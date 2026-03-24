
import { client } from "@gradio/client";

/**
 * Helper to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// NOTE: External Face Swap API removed. Feature now uses Gemini Generative Engine.
// Old endpoints commented out to prevent accidental usage.
// const TAI_API_KEY = "..."; 
// const TAI_API_URL = "https://taiapi.aiphotocraft.com/api/faceswap/basicswap";

/**
 * (Deprecated) Performs a face swap using external API.
 * Currently returns a placeholder error as this should be handled by Gemini.
 */
export const faceSwap = async (sourceFile: File, targetFile: File): Promise<string> => {
  throw new Error("Fungsi Face Swap eksternal dinonaktifkan. Gunakan Gemini API (Otomatis).");
};

/**
 * Upscales and enhances an image using AI (GFPGAN/Real-ESRGAN).
 * 
 * @param imageBlob The image blob to upscale
 * @returns The URL of the upscaled image
 */
export const upscaleImage = async (imageBlob: Blob): Promise<string> => {
  try {
    console.log("Connecting to AI Upscaler...");
    
    let app;
    try {
        // Using a reliable space for face restoration/upscaling
        app = await client("doevent/Face-Upscale");
    } catch (connErr: any) {
        console.warn("HF Upscale Connection Error:", connErr);
        if (connErr.message?.includes("Unexpected token") || connErr.message?.includes("<!doctype")) {
             throw new Error("Upscale Server is currently offline.");
        }
        throw new Error("Could not connect to Upscale server.");
    }

    if (!app) throw new Error("Upscale Service unavailable");

    // Prediction endpoint for Face-Upscale
    // inputs: [image, scale (2x/4x), face_enhance (bool)]
    // We explicitly request 4x scale for 4K-like results on standard inputs
    const result = await app.predict("/predict", [
      imageBlob, 
      "4x", 
      true
    ]);

    const output = result.data as any[];
    
    if (output && output.length > 0) {
        const imageResult = output[0];
        if (typeof imageResult === 'object' && imageResult.url) {
            return imageResult.url;
        }
        if (typeof imageResult === 'string') {
            return imageResult;
        }
    }

    throw new Error("Upscaling failed to return a valid image.");

  } catch (error: any) {
    console.error("Upscale Error:", error);
    if (error.message && error.message.includes("Queue")) {
        throw new Error("Server Upscale sedang sibuk. Silakan coba sebentar lagi.");
    }
    if (error.message && error.message.includes("named_endpoints")) {
         throw new Error("Server Upscale tidak merespon.");
    }
    throw new Error(`Gagal melakukan Upscale: ${error.message || "Unknown error"}`);
  }
};
