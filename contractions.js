import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const OUT_DIR = join("audio", "contractions");
mkdirSync(OUT_DIR, { recursive: true });

// Minimal-pair contrast: hear the difference between the bare pronoun and the
// 've (have) / 'll (will) contractions. First the three forms alone, then the
// same three in a sentence frame so the ending is easy to catch.
//   I    -> /ai/
//   I've -> /aiv/   (I have)
//   I'll -> /ail/   (I will)
const groups = [
  { bare: "I",    have: "I've",    will: "I'll",
    frame: ["I call you.", "I've called you.", "I'll call you."] },
  { bare: "You",  have: "You've",  will: "You'll",
    frame: ["You see it.", "You've seen it.", "You'll see it."] },
  { bare: "We",   have: "We've",   will: "We'll",
    frame: ["We do it.", "We've done it.", "We'll do it."] },
  { bare: "They", have: "They've", will: "They'll",
    frame: ["They win.", "They've won.", "They'll win."] },
];

// For each group: "I... I've... I'll." then the three sentences.
const sentences = groups.flatMap((g) => [
  `${g.bare}. ${g.have}. ${g.will}.`,
  ...g.frame,
]);

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is contractions. Listen for the difference between I, I've, and I'll. Listen and repeat.";
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
