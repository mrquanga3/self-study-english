import { execFileSync } from "child_process";
import { existsSync } from "fs";
import ffmpeg from "ffmpeg-static";

// Extract clean audio from a video/audio file — e.g. to use as a voice-cloning
// sample. Outputs mono 22.05 kHz WAV (a good format for cloning tools like
// XTTS / ElevenLabs). Optionally trim a segment with start + duration.
//
// Usage:
//   node extract-audio.js <input> [output.wav] [startSec] [durationSec]
// Examples:
//   node extract-audio.js clip.mp4
//   node extract-audio.js clip.mp4 sample.wav
//   node extract-audio.js clip.mp4 sample.wav 12 8     # 8s starting at 0:12

const [input, output = "sample.wav", start, duration] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node extract-audio.js <input> [output.wav] [startSec] [durationSec]");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const args = ["-y"];
if (start) args.push("-ss", String(start));
if (duration) args.push("-t", String(duration));
args.push(
  "-i", input,
  "-vn",                 // drop video
  "-ac", "1",            // mono
  "-ar", "22050",        // 22.05 kHz
  "-c:a", "pcm_s16le",   // 16-bit WAV
  output,
);

execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "inherit"] });
console.log(`Extracted -> ${output} (mono, 22.05 kHz WAV)`);
console.log("Tip: aim for 30-90s of clean speech, no music/noise, for cloning.");
