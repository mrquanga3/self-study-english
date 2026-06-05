import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const OUT_DIR = join("audio", "palatalization");
mkdirSync(OUT_DIR, { recursive: true });

// Y-COALESCENCE (palatalization): a final D or T blends with the /y/ of "you"
//   D + Y -> /j/  (dʒ)  did you  -> "didja"
//   T + Y -> /ch/ (tʃ)  got you  -> "gotcha"
// These only happen in connected, casual speech, so each is a natural sentence
// and the casual voice (Ava/Andrew) produces the blend. Comment shows -> sound.
const sentences = [
  // D + Y -> /j/ ("didja / wouldja / couldja")
  "What did you eat for breakfast?", // did you   -> did-j-you
  "Where did you go last night?",    // did you   -> did-j-you
  "Would you help me with this?",    // would you -> would-j-you
  "Could you call me later?",        // could you -> could-j-you
  "How did your day go?",            // did your  -> did-j-er

  // T + Y -> /ch/ ("gotcha / doncha / betcha")
  "I got you a present.",            // got you   -> got-cha
  "Don't you want some?",            // don't you -> don-cha
  "Can't you see it?",               // can't you -> can-cha
  "I bet you can do it.",            // bet you   -> bet-cha
  "Nice to meet you.",               // meet you  -> mee-chu
];

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is palatalization. D plus you sounds like ja, and T plus you sounds like cha. For example, did you sounds like didja. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// Casual American voices.
const jobs = [
  { voice: "en-US-AvaNeural", file: "female.mp3" },
  { voice: "en-US-AndrewNeural", file: "male.mp3" },
];

for (const { voice, file } of jobs) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const dest = join(OUT_DIR, file);
  const { audioStream } = tts.toStream(text);
  const out = createWriteStream(dest);

  await new Promise((resolve, reject) => {
    audioStream.pipe(out);
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
    out.on("error", reject);
  });

  console.log(`Saved ${dest} (${voice})`);
}

process.exit(0);
