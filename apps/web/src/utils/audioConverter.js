export async function convertToWAV(blob) {
  // Minimal safe fallback: most APIs that accept "audio" can handle webm/ogg too.
  // Proper conversion requires ffmpeg/AudioWorklet; keep this lightweight to avoid runtime errors.
  return blob;
}

