/**
 * Get the duration of a video file in seconds
 * @param file - The video file to get duration from
 * @returns Promise<number> - Duration in seconds
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    // Create a video element
    const video = document.createElement("video");
    video.preload = "metadata";

    // Create object URL from file
    const url = URL.createObjectURL(file);
    video.src = url;

    // Once metadata is loaded, we can get the duration
    video.onloadedmetadata = () => {
      // Clean up the object URL
      URL.revokeObjectURL(url);
      
      // Return duration in seconds
      const durationInSeconds = Math.round(video.duration);
      resolve(durationInSeconds);
    };

    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    };
  });
}

/**
 * Format duration in seconds to readable format (e.g., "1h 30m", "45m", "2m 30s")
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }

  if (remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m`;
}

/**
 * Convert seconds to minutes (rounded)
 * @param seconds - Duration in seconds
 * @returns Duration in minutes
 */
export function secondsToMinutes(seconds: number): number {
  return Math.ceil(seconds / 60);
}

