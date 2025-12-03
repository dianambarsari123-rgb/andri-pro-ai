
/**
 * Service to interact with Pollinations.ai API
 * Provides fast, free, unlimited image generation using models like Flux and SDXL.
 */

export const generateWithPollinations = async (
  prompt: string, 
  width: number = 1024, 
  height: number = 1024
): Promise<string> => {
  try {
    // Pollinations uses GET requests with query params
    // We add a random seed to ensure variations
    const seed = Math.floor(Math.random() * 10000000);
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Construct URL
    // nologo=true removes the watermark
    // enhance=true uses prompt enhancement
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    
    // Fetch the image as a blob
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Pollinations API Error: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Convert to Base64 Data URL to match application architecture
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error("Pollinations Generation Error:", error);
    throw error;
  }
};
