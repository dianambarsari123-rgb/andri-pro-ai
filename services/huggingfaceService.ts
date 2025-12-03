
import { client } from "@gradio/client";

/**
 * Performs a face swap using a free Hugging Face Space (InsightFace/Roop).
 * Note: This relies on public spaces which may have queues.
 * 
 * @param sourceFile The file containing the face to copy (Source)
 * @param targetFile The file containing the body/target (Target)
 * @returns The URL of the swapped image
 */
export const faceSwap = async (sourceFile: File, targetFile: File): Promise<string> => {
  try {
    console.log("Connecting to Face Swap Neural Network (High Fidelity)...");
    
    // Using 'tonyassi/face-swap' which is a reliable implementation of InsightFace
    // This provides much better results than generic LLMs for identity preservation.
    const app = await client("tonyassi/face-swap"); 

    // The API signature for tonyassi/face-swap usually accepts:
    // [source_image, target_image, use_face_enhance_bool]
    // We set use_face_enhance_bool to TRUE for "perfect facial feature transfer"
    const result = await app.predict("/predict", [
      sourceFile, 
      targetFile, 
      true // ENABLE FACE ENHANCER (GFPGAN) for sharper eyes and skin
    ]);

    // Gradio client returns a data array. 
    // Usually result.data[0] contains the image information.
    const output = result.data as any[];
    
    if (output && output.length > 0) {
        const imageResult = output[0];
        
        // Handle standard Gradio URL response
        if (typeof imageResult === 'object' && imageResult.url) {
            return imageResult.url;
        }
        // Handle direct string URL response
        if (typeof imageResult === 'string') {
            return imageResult;
        }
    }

    throw new Error("Neural Network did not return a valid image.");

  } catch (error: any) {
    console.error("Hugging Face Error:", error);
    
    // specific error handling for queue/busy states
    if (error.message && error.message.includes("Queue")) {
        throw new Error("Server Face Swap sedang sibuk (Antrian Penuh). Silakan coba 1-2 menit lagi.");
    }

    throw new Error(`Gagal memproses Face Swap: ${error.message || "Koneksi ke Neural Network terputus"}.`);
  }
};
