
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, UploadedImage, FeatureMode } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- API KEY MANAGEMENT ---
const getApiKey = (): string => {
  // 1. Priority: Check LocalStorage (User entered in Admin Settings)
  const localKey = localStorage.getItem('SUPERADMIN_API_KEY');
  if (localKey && localKey.trim().length > 5) {
    return localKey.trim();
  }

  // 2. Check Vite Environment Variable (Standard for React/Vite)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // 3. Check Process Environment (Legacy/Node)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }

  throw new Error("API Key tidak ditemukan! Silakan masuk ke Menu 'Pengaturan Admin' dan masukkan Google Gemini API Key dari Google AI Studio.");
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey && win.aistudio.openSelectKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MODEL CONFIGURATION ---
// Primary models (Bleeding edge, might be restricted)
const PRIMARY_IMAGE_MODEL = 'gemini-3-pro-image-preview'; 
const PRIMARY_CHAT_MODEL = 'gemini-3-pro-preview';       

// Fallback models (Stable, broadly available)
const FALLBACK_IMAGE_MODEL = 'gemini-2.5-flash-image';   
const FALLBACK_CHAT_MODEL = 'gemini-2.5-flash';          

/**
 * Helper to parse error details from various SDK error formats
 */
const parseError = (error: any) => {
  // Convert error to string to catch codes hidden in JSON messages
  const errString = JSON.stringify(error, Object.getOwnPropertyNames(error));
  
  // Extract a readable message
  let message = '';
  if (error?.message) message = error.message;
  if (error?.error?.message) message = error.error.message;
  if (!message && typeof error === 'string') message = error;
  if (!message) message = "Unknown error occurred";
  
  // Check for permission codes in various places including the message string
  const isPermissionError = 
    errString.includes('403') || 
    errString.includes('PERMISSION_DENIED') || 
    message.includes('403') ||
    message.toLowerCase().includes('permission') ||
    error?.status === 403 || 
    error?.error?.code === 403;

  const isServerError = 
    errString.includes('500') || 
    errString.includes('INTERNAL') || 
    error?.status === 500;

  return { isPermissionError, isServerError, message };
};

/**
 * Magic Prompt: Enhances a user prompt. Includes Fallback logic.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // Attempt with Pro model
    try {
        const response = await ai.models.generateContent({
          model: PRIMARY_CHAT_MODEL,
          contents: {
            parts: [{ text: `You are an expert AI Prompt Engineer and visual artist. 
            Your task is to take the following simple user input and rewrite it into a highly detailed, descriptive, and artistic prompt suitable for top-tier image generation models (like Gemini 3 Pro, Midjourney, or Flux).
            
            Key requirements:
            - Expand on lighting (e.g., volumetric, cinematic, studio softbox).
            - Describe textures, materials, and colors vividly.
            - Specify camera angles and lens types (e.g., 85mm f/1.8, wide angle).
            - Add mood and atmosphere keywords (e.g., ethereal, cyberpunk, serene).
            - Keep the original subject matter but elevate the description to be professional.
            - Output ONLY the raw enhanced prompt string. Do not add "Here is the prompt" or quotes.
            
            User Input: "${originalPrompt}"` }]
          },
          config: {
            systemInstruction: "You are a creative writing assistant specialized in visual descriptions."
          }
        });
        return response.text?.trim() || originalPrompt;
    } catch(err: any) {
        const { isPermissionError } = parseError(err);
        
        if (isPermissionError) {
            console.warn("Enhance prompt fallback to Flash due to 403 Permission Error");
            const response = await ai.models.generateContent({
              model: FALLBACK_CHAT_MODEL,
              contents: {
                parts: [{ text: `Expand this image description to be more detailed and artistic: "${originalPrompt}"` }]
              }
            });
            return response.text?.trim() || originalPrompt;
        }
        throw err;
    }
    
  } catch (e) {
    console.warn("Failed to enhance prompt completely", e);
    return originalPrompt;
  }
};

/**
 * Main Image Generation Function with Fallback & Retry
 */
export const generateImage = async (
  prompt: string,
  images: UploadedImage[],
  ratio: AspectRatio,
  mode: FeatureMode,
  retries = 3,
  useFallback = false
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare images
    const imageParts = await Promise.all(images.map((img) => fileToGenerativePart(img.file)));
    
    let systemContext = "";
    switch (mode) {
      case 'imagine': systemContext = "Task: Text-to-Image Generation. Create a high-quality, highly detailed image based strictly on the user's description."; break;
      case 'merge': systemContext = "Task: Merge images into a cohesive composite. Blend lighting and shadows perfectly."; break;
      case 'thumbnail': systemContext = "Task: Create a high-converting YouTube thumbnail. Use vibrant colors and dramatic expressions."; break;
      case 'expand': systemContext = "Task: Outpaint and expand the scene seamlessly. Match the style and texture of the original image."; break;
      case 'edit': systemContext = "Task: Edit the image precisely according to instructions. Maintain original style."; break;
      case 'removeobj': systemContext = "Task: Magic Eraser. Remove the object described and inpaint the background seamlessly."; break;
      case 'removebg': systemContext = "Task: Background Removal. Isolate the subject perfectly and place it on a pure white background (#FFFFFF). Ensure edges are clean."; break;
      case 'restore': systemContext = "Task: Photo Restoration. Sharpen details, reduce noise, and colorize if black and white. Make it high definition."; break;
      case 'faceswap': systemContext = "Task: Face Swap. Reconstruct the face from the first image onto the body of the second image. Maintain identity, skin tone, and lighting of the target scene."; break;
      case 'fitting': systemContext = "Task: Virtual Try-On. Warp the clothing from the second image onto the person in the first image. Adjust folds and lighting."; break;
      case 'product': systemContext = "Task: Commercial Product Photography. Enhance lighting, reflections, and composition to look like a high-end studio shot."; break;
      case 'fotomodel': systemContext = "Task: AI Model Generation. The user has provided an image of a product/clothing. Generate a photorealistic human model wearing/using this product. Ensure the model fits the description in the prompt (age, ethnicity, pose). Professional studio lighting."; break;
      case 'fashion': systemContext = "Task: Fashion Editorial. Showcase the clothing and model with professional posing and lighting."; break;
      case 'prewedding': systemContext = "Task: Romantic Pre-wedding Photography Composite. Merge the male subject from the first image and the female subject from the second image into a single cohesive couple pose. Ensure consistent lighting, shadows, and perspective. The result must look like a real photograph of a couple together."; break;
      case 'wedding': systemContext = "Task: Luxury Wedding Photography. Grandeur, elegance, sharp details, and perfect lighting."; break;
      case 'babyborn': systemContext = "Task: Newborn Photography. Soft textures, pastel tones, gentle lighting, adorable composition."; break;
      case 'kids': systemContext = "Task: Child Photography. Vibrant, energetic, sharp focus, capturing genuine expressions."; break;
      case 'maternity': systemContext = "Task: Maternity Photography. Elegant silhouettes, soft lighting, emotional and artistic."; break;
      case 'umrah': systemContext = "Task: Religious Photography. Place the subject in a holy setting (Mecca/Kaaba) with respect and realism."; break;
      case 'interior': systemContext = "Task: Interior Design Rendering. Photorealistic furniture placement, lighting, and textures."; break;
      case 'exterior': systemContext = "Task: Architectural Rendering. Realistic building materials, landscaping, and environmental lighting."; break;
      case 'sketch': systemContext = "Task: Artistic Sketch. Convert the image into a detailed pencil or charcoal sketch."; break;
      case 'caricature': systemContext = "Task: 3D Caricature. Exaggerated features, Pixar-style rendering, cute and expressive."; break;
      case 'flayer': systemContext = "Task: Flyer Design. Create a promotional layout with the image elements. Modern and professional."; break;
      case 'banana': systemContext = "Task: Artistic Creation. Create a vibrant and creative image."; break;
      default: systemContext = "Task: Advanced Photo Manipulation. Follow the user's prompt exactly. High quality, photorealistic output."; break;
    }

    const modelName = useFallback ? FALLBACK_IMAGE_MODEL : PRIMARY_IMAGE_MODEL;
    console.log(`Generating with ${modelName} for mode ${mode} (Fallback: ${useFallback})`);

    // Construct content parts
    const contents = {
        parts: [
            ...imageParts,
            { text: `${systemContext}\n\nUser Instruction: ${prompt}\n\nAspect Ratio: ${ratio}` }
        ]
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        generationConfig: {
            temperature: 0.4, 
        }
      } as any
    });

    // Parse Response
    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
        if (candidates[0].content.parts[0].text) {
             // In some cases, Gemini might return text describing the image if it failed to generate or filtered it.
             // We treat this as an error for the image generator.
             throw new Error("AI returned text instead of image: " + candidates[0].content.parts[0].text);
        }
    }

    throw new Error("No image data found in response.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);

    const { isPermissionError, isServerError, message } = parseError(error);

    // Automatic Fallback for Permission Error (403) -> Switch to Flash
    if (isPermissionError && !useFallback) {
        console.warn("Permission denied for Pro model. Switching to Flash...");
        return generateImage(prompt, images, ratio, mode, retries, true);
    }

    // Retry Logic for Server Errors (500)
    if (retries > 0 && (isServerError || message.includes('FetchFailure') || message.includes('Overloaded'))) {
        console.warn(`Retrying... (${retries} attempts left)`);
        await delay(2000 * (4 - retries)); // Exponential backoff
        return generateImage(prompt, images, ratio, mode, retries - 1, useFallback);
    }

    throw error; // Let the UI handle the error display
  }
};

/**
 * Sequential Batch Generation
 * Generates N images one by one to avoid 500 XHR Errors.
 */
export const generateBatchImages = async (
    prompt: string, 
    images: UploadedImage[], 
    ratio: AspectRatio, 
    mode: FeatureMode,
    count: number = 4,
    onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
    const results: string[] = [];
    
    // Check key before starting loop
    getApiKey(); 

    for (let i = 0; i < count; i++) {
        if (onProgress) onProgress(i + 1, count);
        
        const variationPrompt = `${prompt} (Variation ${i+1})`;
        
        try {
            const result = await generateImage(variationPrompt, images, ratio, mode);
            results.push(result);
        } catch (e) {
            console.error(`Batch item ${i+1} failed`, e);
            // If the first one fails hard (e.g. invalid key), stop immediately
            if (results.length === 0 && i === 0) {
                 throw e; 
            }
        }
        
        // Small delay to let the network breathe
        await delay(1000); 
    }
    
    if (results.length === 0) {
        throw new Error("Gagal membuat gambar. Pastikan API Key Anda valid dan kuota mencukupi.");
    }

    return results;
};

/**
 * Video Generation using Google Veo
 */
export const generateVideo = async (
    prompt: string,
    images: UploadedImage[],
    ratio: AspectRatio,
    mode: FeatureMode,
    quality: '720p' | '1080p' | '4k' = '1080p'
): Promise<string> => {
    try {
        await ensureApiKey(); // Check for API key selection (required for Veo)
        
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        // Map ratio to Veo supported formats
        let veoRatio = '16:9';
        if (ratio === AspectRatio.PORTRAIT || ratio === AspectRatio.PORTRAIT_4_5) veoRatio = '9:16';
        
        // Determine Model
        let model = 'veo-3.1-fast-generate-preview'; // Default
        if (quality === '4k') model = 'veo-3.1-generate-preview'; // Higher quality model

        // Prepare Inputs
        let imagePart = null;
        if (images.length > 0) {
            const { inlineData } = await fileToGenerativePart(images[0].file);
            imagePart = {
                imageBytes: inlineData.data,
                mimeType: inlineData.mimeType
            };
        }

        let finalPrompt = prompt;
        if (mode === 'videofaceswap') {
            finalPrompt = `Cinematic shot. Animate the person in the image: ${prompt}. Maintain facial identity strictly. High motion quality.`;
        } else if (mode === 'animate') {
            finalPrompt = `Bring this image to life. ${prompt}. Smooth camera movement, natural elements motion (wind, water, light).`;
        }

        console.log(`Starting Veo Generation: ${model}, ${veoRatio}, ${quality}`);
        
        let operation = await ai.models.generateVideos({
            model: model,
            prompt: finalPrompt,
            image: imagePart || undefined,
            config: {
                numberOfVideos: 1,
                aspectRatio: veoRatio as any,
                resolution: quality === '720p' ? '720p' : '1080p' 
            }
        });

        // Poll for completion
        while (!operation.done) {
            await delay(5000); // Wait 5s
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log("Veo processing...");
        }

        if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos.length > 0) {
            const videoUri = operation.response.generatedVideos[0].video?.uri;
            if (videoUri) {
                return `${videoUri}&key=${apiKey}`;
            }
        }

        throw new Error("Video generation completed but no URI returned.");

    } catch (error: any) {
        console.error("Veo Error:", error);
        throw new Error(`Gagal membuat video: ${error.message}`);
    }
};

/**
 * Chat with Gemini
 */
export const chatWithGemini = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const chatHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const chat = ai.chats.create({
            model: PRIMARY_CHAT_MODEL,
            history: chatHistory,
            config: {
                systemInstruction: "You are Andri AI, a helpful, professional, and creative AI assistant for a graphic design platform. Help users with prompts, ideas, and technical questions about photo editing."
            }
        });

        try {
            const result = await chat.sendMessage({ message: newMessage });
            return result.text || "Maaf, saya tidak bisa menjawab saat ini.";
        } catch (err: any) {
             const { isPermissionError } = parseError(err);
             if (isPermissionError) {
                 console.warn("Chat fallback to Flash due to 403");
                 const fallbackChat = ai.chats.create({
                    model: FALLBACK_CHAT_MODEL,
                    history: chatHistory
                 });
                 const res = await fallbackChat.sendMessage({ message: newMessage });
                 return res.text || "Maaf, saya tidak bisa menjawab saat ini.";
             }
             throw err;
        }

    } catch (error: any) {
        console.error("Chat Error:", error);
        throw error;
    }
};
