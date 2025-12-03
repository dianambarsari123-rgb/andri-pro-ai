
export interface DownloadResult {
  title: string;
  thumbnail: string;
  downloadUrl: string;
  format: string;
  size: string;
}

/**
 * Simulates the video analysis and conversion process.
 * In a real-world app, this would hit a backend API (like yt-dlp wrapper).
 */
export const processVideoLink = async (
  url: string, 
  platform: string, 
  format: string,
  onProgress: (progress: number) => void
): Promise<DownloadResult> => {
  
  // Validation
  if (!url.trim()) throw new Error("URL tidak boleh kosong.");
  const validUrl = url.toLowerCase();
  
  if (platform === 'youtube' && !validUrl.includes('youtu')) throw new Error("URL Youtube tidak valid.");
  if (platform === 'tiktok' && !validUrl.includes('tiktok')) throw new Error("URL Tiktok tidak valid.");
  if (platform === 'instagram' && !validUrl.includes('instagram')) throw new Error("URL Instagram tidak valid.");
  if (platform === 'facebook' && !validUrl.includes('facebook')) throw new Error("URL Facebook tidak valid.");
  if (platform === 'twitter' && (!validUrl.includes('twitter') && !validUrl.includes('x.com'))) throw new Error("URL X/Twitter tidak valid.");

  // Simulate Steps
  const steps = [10, 30, 50, 70, 90, 100];
  
  for (const p of steps) {
    await new Promise(r => setTimeout(r, 600)); // Delay
    onProgress(p);
  }

  // Generate Mock Result based on input
  return {
    title: `Video Downloaded from ${platform} - ${format.toUpperCase()}`,
    thumbnail: "https://images.unsplash.com/photo-1611162616475-99137d7b5758?auto=format&fit=crop&w=500&q=80",
    downloadUrl: "#", // Dummy link
    format: format,
    size: format === 'mp3' ? '4.5 MB' : (format.includes('1080') ? '125 MB' : '45 MB')
  };
};
