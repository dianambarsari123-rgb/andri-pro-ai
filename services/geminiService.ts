
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, UploadedImage, FeatureMode } from '../types';

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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

// Helper to ensure API key is selected (specifically for Veo)
const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey && win.aistudio.openSelectKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

export const generateImage = async (
  prompt: string,
  images: UploadedImage[],
  ratio: AspectRatio,
  mode: FeatureMode
): Promise<string> => {
  try {
    // Create client instance right before call to get latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = await Promise.all(images.map((img) => fileToGenerativePart(img.file)));
    
    let systemContext = "";
    
    switch (mode) {
      case 'merge':
        systemContext = "Task: Merge the provided images into a single cohesive composite image.";
        break;
      case 'thumbnail':
        systemContext = "Task: Create a high-converting, click-worthy YouTube thumbnail.";
        break;
      case 'expand':
        systemContext = "Task: Outpaint and expand the scene of the provided image seamlessly. Maintain style consistency.";
        break;
      case 'edit':
        systemContext = "Task: Edit the image precisely according to the user instructions. Maintain original style where possible.";
        break;
      case 'faceswap':
        systemContext = `
          CRITICAL ASSIGNMENT: PHOTOREALISTIC FACE SWAPPING.
          
          ROLE: You are a Forensic Image Specialist and VFX Compositor.
          
          INPUT IDENTIFICATION:
          - Image 1 is the SOURCE FACE (The Identity).
          - Image 2 is the TARGET BODY/SCENE (The Context).
          
          STRICT EXECUTION RULES:
          1. IDENTITY PRESERVATION: You MUST transfer the eyes, nose, mouth, eyebrows, and facial structure of Image 1 onto the head of Image 2. The person must look exactly like Image 1.
          2. CONTEXT PRESERVATION: You MUST KEEP the hair, head shape, ears, neck, body, clothing, background, and lighting of Image 2 EXACTLY as they are. DO NOT CHANGE THE HAIRSTYLE of Image 2.
          3. SKIN TONE BLENDING: The skin color of the new face must perfectly match the lighting condition and skin tone of the body in Image 2.
          4. REALISM: The result must be a real photo. No cartoon filters, no painting effects, no smoothing artifacts. High skin texture detail (pores, wrinkles) is required.
          
          OUTPUT: A single seamless photo where Person 1's face is on Person 2's body.
        `;
        break;
      case 'videofaceswap':
        systemContext = `
          TASK: ANIMATE A STATIC PORTRAIT INTO A REALISTIC VIDEO.
          
          INPUT: A static photo of a face.
          GOAL: Generate a video of THIS SPECIFIC PERSON performing the action described in the prompt.
          
          CRITICAL:
          - The person in the video MUST be the person in the uploaded photo.
          - Maintain facial identity (eyes, nose, mouth) consistency throughout the video.
          - Style: Photorealistic, cinematic lighting.
        `;
        break;
      case 'fitting': // Kamar Pas
        systemContext = "Task: Virtual Try-On / Fitting. The FIRST image is the PERSON. The SECOND image is the CLOTHING/GARMENT. Generate a photo of the person wearing the clothing. Ensure realistic fabric physics, draping, and lighting matching the person's photo.";
        break;
      case 'product':
        systemContext = "Task: Create a professional commercial product photograph. The first image is the product. Place it in a high-quality studio setting appropriate for the brand.";
        break;
      case 'fashion':
        systemContext = "Task: Generate a high-fashion editorial shot using the provided clothing/reference. Use professional model posing and editorial lighting.";
        break;
      case 'mockup':
        systemContext = "Task: Apply the design/logo from the first image onto a realistic mockup scene defined by the user (e.g., mug, shirt, billboard).";
        break;
      
      // Studio Foto AI
      case 'prewedding':
        systemContext = "Task: Create a romantic pre-wedding photo. Enhance lighting, mood, and background to be cinematic and dreamy. Focus on the couple's connection.";
        break;
      case 'wedding':
        systemContext = "Task: Create a stunning wedding photography shot. Focus on elegance, white dresses, suits, celebration atmosphere, and magical lighting.";
        break;
      case 'babyborn':
        systemContext = "Task: Create a professional newborn baby photography shot. Use soft textures, gentle pastel lighting, and cute props (baskets, blankets). High safety and comfort aesthetic.";
        break;
      case 'kids':
        systemContext = "Task: Create a professional kids portrait. Bright, playful, and high-quality studio lighting. Capture natural expressions.";
        break;
      case 'maternity':
        systemContext = "Task: Create an elegant maternity photo. Focus on the silhouette, soft lighting, and emotional connection. Graceful posing.";
        break;
      case 'umrah':
        systemContext = "Task: Create a photo with Umrah/Haji theme. Background should be Mecca or Medina (Kaaba or Nabawi mosque). Subjects should be wearing accurate Ihram or modest islamic clothing. Atmosphere: Peaceful, spiritual, holy.";
        break;
      case 'passphoto':
        systemContext = "Task: Create a formal ID/Passport photo. Strict requirements: Frontal face, neutral expression, even lighting, no shadows on face. Background must be solid color as requested (usually Red #db1514 or Blue #0090ff).";
        break;

      // Desain & Seni
      case 'interior':
        systemContext = "Task: Generate a photorealistic interior design based on the room layout or concept provided. Focus on lighting, textures, material realism, and furniture arrangement.";
        break;
      case 'exterior':
        systemContext = "Task: Generate a photorealistic architectural exterior design. Focus on building facade, landscaping, environmental lighting, and realistic materials.";
        break;
      case 'sketch':
        systemContext = "Task: Convert the image or concept into a high-quality artistic sketch. Pencil, charcoal, or technical line art style as requested.";
        break;
      case 'caricature':
        systemContext = "Task: Create a fun and artistic caricature or cartoon version of the subject. Exaggerate features slightly for style while maintaining likeness. High quality rendering.";
        break;

      // Marketing (Text based or Ref image based)
      case 'banner':
        systemContext = "Task: Create a professional advertising banner layout. Focus on visual hierarchy, space for text (if any), and engaging visuals suitable for web or print promotion.";
        break;
      case 'carousel':
        systemContext = "Task: Create a visually engaging social media carousel slide. Focus on clear graphics, modern flat or 3D illustration style, and eye-catching composition.";
        break;
      
      // Special
      case 'banana':
        systemContext = "Task: Nano Banana Mode. Be creative, vibrant, and fast. Generate high-quality artistic interpretations of the prompt.";
        break;

      default:
        systemContext = "Task: Generate a creative image based on the inputs.";
    }

    // Construct a detailed prompt for the model
    const fullPrompt = `
      ${systemContext}
      User Instruction: ${prompt}
      Style: Professional, high quality, photorealistic (unless specified otherwise).
      Output Aspect Ratio: ${ratio}
      Important: Generate a unique variation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          { text: fullPrompt }
        ]
      },
      config: {
        // Nano banana models do not support responseMimeType
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated.");
    }

    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The model did not return an image. Please try again with a different prompt.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

// New Function to generate 4 variations in parallel
export const generateBatchImages = async (
    prompt: string,
    images: UploadedImage[],
    ratio: AspectRatio,
    mode: FeatureMode,
    count: number = 4
  ): Promise<string[]> => {
    
    // Create an array of promises
    const promises = Array.from({ length: count }).map(() => 
        generateImage(prompt, images, ratio, mode)
            .catch(e => {
                console.error("One batch item failed", e);
                return null; // Return null on failure so Promise.all doesn't fail everything
            })
    );
  
    const results = await Promise.all(promises);
    
    // Filter out nulls (failed generations)
    const validResults = results.filter((res): res is string => res !== null);
    
    if (validResults.length === 0) {
        throw new Error("Gagal membuat gambar. Silakan coba lagi.");
    }
  
    return validResults;
  };

export const generateVideo = async (
  prompt: string,
  images: UploadedImage[],
  ratio: AspectRatio,
  quality: '720p' | '1080p' | '4k' = '1080p'
): Promise<string> => {
  try {
    // 1. Ensure API Key is selected for Veo
    await ensureApiKey();

    // 2. Create client with current key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Prepare config
    // Map existing ratio enum to Veo supported strings
    let veoAspectRatio = '16:9';
    if (ratio === AspectRatio.PORTRAIT) veoAspectRatio = '9:16';
    // Square is not directly supported by Veo usually, default to 16:9 or handle error. 
    // Guidelines say "Can be 16:9 (landscape) or 9:16 (portrait)".
    if (ratio === AspectRatio.SQUARE) veoAspectRatio = '16:9'; 

    // Determine Model and Resolution based on requested quality
    let modelName = 'veo-3.1-fast-generate-preview';
    let resolution = '1080p';

    if (quality === '720p') {
      modelName = 'veo-3.1-fast-generate-preview';
      resolution = '720p';
    } else if (quality === '1080p') {
      modelName = 'veo-3.1-fast-generate-preview';
      resolution = '1080p';
    } else if (quality === '4k') {
      // Use the higher quality model for "Ultra/4K" request
      // Note: API currently supports 720p/1080p output for preview models, 
      // but generate-preview is higher fidelity than fast-generate-preview.
      modelName = 'veo-3.1-generate-preview';
      resolution = '1080p'; 
    }

    const config: any = {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: veoAspectRatio
    };

    let operation;

    // 4. Call generateVideos
    // Case 1: Prompt only (or Prompt + Image)
    if (images.length > 0) {
        // Veo supports image prompt. Use the first image.
        const filePart = await fileToGenerativePart(images[0].file);
        operation = await ai.models.generateVideos({
            model: modelName,
            prompt: prompt,
            image: {
                imageBytes: filePart.inlineData.data,
                mimeType: filePart.inlineData.mimeType,
            },
            config: config
        });
    } else {
        operation = await ai.models.generateVideos({
            model: modelName,
            prompt: prompt,
            config: config
        });
    }

    // 5. Poll for completion
    while (!operation.done) {
      // Longer poll interval for high quality
      const pollTime = quality === '4k' ? 10000 : 5000;
      await new Promise(resolve => setTimeout(resolve, pollTime));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    // 6. Get Result
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
        throw new Error("Video generation failed or no URI returned.");
    }

    // Append key for download
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error: any) {
    console.error("Veo Generation Error:", error);
    if (error.message && error.message.includes("Requested entity was not found")) {
        // Reset key if needed, or prompt user to re-select
         const win = window as any;
         if (win.aistudio && win.aistudio.openSelectKey) {
            await win.aistudio.openSelectKey();
             throw new Error("API Key issue detected. Please select your key again and retry.");
         }
    }
    throw new Error(error.message || "Failed to generate video.");
  }
};
