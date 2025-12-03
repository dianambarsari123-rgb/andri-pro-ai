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
    // Using a popular, stable public space for Face Swap (Roop/InsightFace based)
    // Alternative spaces: "felixrosberg/face-swap", "tonyassi/face-swap"
    const app = await client("tonyassi/face-swap"); 

    // Prepare blobs
    const sourceBlob = sourceFile;
    const targetBlob = targetFile;

    // The endpoint signature depends on the specific Gradio space.
    // For tonyassi/face-swap, it usually accepts [source, target] and returns the image.
    const result = await app.predict("/predict", [
      sourceBlob, 
      targetBlob, 
      false // "Face Enhance" boolean (optional, false is faster)
    ]);

    // Gradio client returns data structure. Usually result.data[0] is the file/url info
    // Adjust based on inspection of the specific space response
    const output = result.data as any[];
    
    if (output && output.length > 0) {
        // Handle different Gradio return types (sometimes object with url, sometimes just url)
        const imageResult = output[0];
        if (typeof imageResult === 'object' && imageResult.url) {
            return imageResult.url;
        }
        if (typeof imageResult === 'string') {
            return imageResult;
        }
    }

    throw new Error("No image returned from Face Swap service.");

  } catch (error: any) {
    console.error("Hugging Face Error:", error);
    throw new Error(`Face Swap Failed: ${error.message || "Server Busy or Error"}. Silakan coba lagi nanti atau gunakan mode lain.`);
  }
};