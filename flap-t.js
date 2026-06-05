import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const OUT_DIR = join("audio", "flap-t");
mkdirSync(OUT_DIR, { recursive: true });

// Flap-T: T between vowels turns into a soft "D" in American English
// (water -> "wadder"). The neural voice does this naturally, so we just
// say each real word/phrase twice; no fake phonetic spelling.
const words = [
  "Water.",
  "Better.",
  "Butter.",
  "City.",
  "Party.",
  "Computer.",
  "Pretty.",
  "Metadata.", // both T's flap: "MED-uh-DAY-duh"
  "Get away.",
  "What about it?",
  "A lot of it.",
  "Put it on.",
  "I gotta go.",
];

// Say each item twice so the flap is easy to catch.
const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is the flap T. Between two vowels, the letter T sounds like a soft D. Listen and repeat.";
const text = [intro, ...words.map((w) => `${w} ${w}`)].join(" ");

// American voices.
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
