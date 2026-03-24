
import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, UploadedImage, FeatureMode, HistoryItem } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Prunes history to fit within localStorage limits
 */
export const saveHistoryWithPruning = (newItem: HistoryItem) => {
    try {
        const saved = localStorage.getItem('andri_ai_history');
        let history: HistoryItem[] = saved ? JSON.parse(saved) : [];
        
        // Add new item at the beginning
        history = [newItem, ...history];
        
        // Limit history to 50 items to keep storage healthy
        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        const attemptSave = (data: HistoryItem[]) => {
            try {
                localStorage.setItem('andri_ai_history', JSON.stringify(data));
                return true;
            } catch (e: any) {
                if (e.name === 'QuotaExceededError' || e.code === 22) {
                    return false;
                }
                throw e;
            }
        };

        // Aggressive pruning if storage is still full
        let success = attemptSave(history);
        while (!success && history.length > 1) {
            history = history.slice(0, Math.floor(history.length * 0.8)); // Remove 20% oldest items
            success = attemptSave(history);
        }
    } catch (err) {
        console.error("Critical error saving history:", err);
    }
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MODEL CONFIGURATION ---
// Based on documentation guidelines
const PRIMARY_IMAGE_MODEL = 'gemini-2.5-flash-image'; 
const PRIMARY_CHAT_MODEL = 'gemini-3-flash-preview';       
const CLONING_MODEL = 'gemini-3-flash-preview'; // Gemini 3 supports multimodal audio I/O
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const PRO_MODEL = 'gemini-3-pro-preview';

/**
 * Helper to parse error details
 */
const parseError = (error: any) => {
  const errString = JSON.stringify(error, Object.getOwnPropertyNames(error));
  let message = error?.message || error?.error?.message || "Unknown error occurred";
  
  const status = error?.status || error?.error?.status;
  const code = error?.code || error?.error?.code;

  const isQuotaError = status === 'RESOURCE_EXHAUSTED' || code === 429 || message.includes('429') || message.includes('quota');
  const isPermissionError = status === 'PERMISSION_DENIED' || code === 403 || message.includes('403');

  return { isPermissionError, isQuotaError, message };
};

const pcmToWav = (base64PCM: string): string => {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = len;

  const bufferHeader = new ArrayBuffer(44);
  const view = new DataView(bufferHeader);

  const writeString = (v: DataView, o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(new Uint8Array(bufferHeader), 0);
  wavBytes.set(buffer, 44);

  let binary = '';
  for (let i = 0; i < wavBytes.byteLength; i++) {
    binary += String.fromCharCode(wavBytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
};

/**
 * Handles chat interactions with Gemini 3
 */
export const chatWithGemini = async (history: ChatMessage[], message: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: PRIMARY_CHAT_MODEL,
      contents,
    });

    return response.text || "Gagal mendapatkan respon dari AI.";
  } catch (error: any) {
    const { message: errMsg } = parseError(error);
    throw new Error(`Chat error: ${errMsg}`);
  }
};

/**
 * Analyzes uploaded images to suggest a prompt
 */
export const analyzeImagesToPrompt = async (images: UploadedImage[]): Promise<string> => {
  if (images.length === 0) return "";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageParts = await Promise.all(images.map((img) => fileToGenerativePart(img.file)));
    
    const response = await ai.models.generateContent({
      model: PRIMARY_CHAT_MODEL,
      contents: [{
        parts: [
            ...imageParts,
            { text: "Tugas: Analisis gambar-gambar ini. Berikan satu baris instruksi/prompt kreatif untuk generator AI agar bisa menggabungkan atau memproses gambar ini menjadi karya seni yang luar biasa. Berikan HANYA teks prompt-nya saja tanpa penjelasan apapun." }
        ]
      }]
    });

    return response.text || "";
  } catch (err) {
    console.error("Analysis error:", err);
    return "";
  }
};

/**
 * Enhances a given text prompt using Gemini Pro
 */
export const enhancePrompt = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) return prompt;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: [{
        parts: [{ text: `Tugas: Perbaiki dan tingkatkan prompt berikut agar lebih artistik, mendetail, dan profesional untuk hasil generasi gambar AI berkualitas tinggi (8k, cinematic, detailed). Berikan HANYA hasil prompt yang telah ditingkatkan: "${prompt}"` }]
      }]
    });
    return response.text || prompt;
  } catch (err) {
    console.error("Enhance error:", err);
    return prompt;
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Bram', sampleAudio?: { data: string, mimeType: string }): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        if (sampleAudio) {
            // VOICE CLONING via Multimodal Gemini 3
            const response = await ai.models.generateContent({
                model: CLONING_MODEL,
                contents: [{
                    parts: [
                        { inlineData: { data: sampleAudio.data, mimeType: sampleAudio.mimeType } },
                        { text: `Sangat penting: Kamu adalah asisten suara. Tirulah karakteristik vokal (pitch, tone, prosody) dari audio yang diberikan. Bacakan teks berikut dengan suara tersebut: "${text}"` }
                    ]
                }],
                config: {
                    responseModalities: [Modality.AUDIO],
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (!base64Audio) throw new Error("AI tidak mengembalikan data audio hasil kloning.");
            return pcmToWav(base64Audio);

        } else {
            // STANDARD TTS
            let targetVoice = voiceName === 'Bram' ? 'Fenrir' : voiceName;
            
            const response = await ai.models.generateContent({
                model: TTS_MODEL,
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: targetVoice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("Gagal mengambil data audio dari Gemini TTS.");
            return pcmToWav(base64Audio);
        }
    } catch (error: any) {
        const { message } = parseError(error);
        throw new Error(`Gagal membuat suara: ${message}`);
    }
};

export const generateImage = async (
  prompt: string,
  images: UploadedImage[],
  ratio: AspectRatio,
  mode: FeatureMode,
  options?: { negativePrompt?: string; seed?: number }
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageParts = await Promise.all(images.map((img) => fileToGenerativePart(img.file)));
    
    let systemInstruction = "You are a professional AI image generator. Create high-quality results.";
    if (mode === 'faceswap') systemInstruction = "Task: Face Swap. Replace face in image 2 with face from image 1 perfectly.";
    
    const response = await ai.models.generateContent({
      model: PRIMARY_IMAGE_MODEL,
      contents: [{
        parts: [
            ...imageParts,
            { text: `Instruction: ${systemInstruction}\n\nPrompt: ${prompt}\nAspect Ratio: ${ratio}\nNegative: ${options?.negativePrompt || ''}` }
        ]
      }],
      config: { 
          seed: options?.seed,
          imageConfig: { aspectRatio: ratio as any }
      }
    });

    const imageData = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (imageData) return `data:image/png;base64,${imageData}`;
    
    throw new Error(response.text || "Gagal membuat gambar.");
};

export const generateVideo = async (
    prompt: string,
    images: UploadedImage[],
    ratio: AspectRatio,
    mode: FeatureMode,
    quality: '720p' | '1080p' = '1080p'
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let imagePart = undefined;
    if (images.length > 0) {
        const part = await fileToGenerativePart(images[0].file);
        imagePart = { imageBytes: part.inlineData.data, mimeType: part.inlineData.mimeType };
    }

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imagePart,
        config: {
            numberOfVideos: 1,
            aspectRatio: (ratio === AspectRatio.SQUARE ? '16:9' : ratio) as any,
            resolution: quality
        }
    });

    while (!operation.done) {
        await delay(10000);
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Gagal mendapatkan link download video.");
    return `${downloadLink}&key=${process.env.API_KEY}`;
};
