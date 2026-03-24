
/**
 * Service to interact with Pollinations.ai API
 * Provides fast, free, unlimited image generation using models like Flux and SDXL.
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateWithPollinations = async (
  prompt: string, 
  width: number = 1024, 
  height: number = 1024,
  retries: number = 2,
  negativePrompt?: string,
  customSeed?: number
): Promise<string> => {
  try {
    // Pollinations uses GET requests with query params
    const seed = customSeed || Math.floor(Math.random() * 10000000);
    
    // Append negative prompt to main prompt if provided (standard way for some APIs if no dedicated param)
    // Pollinations generally handles "text" so we can try to be descriptive in prompt
    // However, putting it in URL as param if supported is better.
    // Pollinations API documentation is simple: /prompt/[prompt]?params
    // We will append " --no [negative]" style which is common, or just include it in description "excluding [negative]"
    // A robust way for Flux (often used by Pollinations) is implicit in the prompt.
    let finalPrompt = prompt;
    if (negativePrompt) {
        finalPrompt += ` | negative prompt: ${negativePrompt}`;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    
    // Construct URL
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    
    // Fetch the image as a blob
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Pollinations API Error: ${response.status} ${response.statusText} ${errorText}`.trim());
    }
    
    const blob = await response.blob();
    
    // Check if we got an image
    if (blob.type.includes('text') || blob.type.includes('html')) {
         throw new Error("Pollinations returned text/html instead of image.");
    }
    
    // Convert to Base64 Data URL to match application architecture
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.warn(`Pollinations Attempt Failed (Retries left: ${retries}):`, error.message);
    
    if (retries > 0) {
        await delay(1500); 
        return generateWithPollinations(prompt, width, height, retries - 1, negativePrompt, customSeed);
    }
    
    console.error("Pollinations Final Error:", error);
    throw new Error(`Gagal generate gambar (Banana Fast): ${error.message}`);
  }
};
