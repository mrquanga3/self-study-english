import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "bbc-news");
mkdirSync(OUT_DIR, { recursive: true });

// BBC TV NEWS simulation: a short broadcast in formal British English (RP).
// Sounds most authentic with the British voices (gb-female / gb-male).
const sentences = [
  "Good evening, and welcome to the BBC News at Ten.",
  "Our top story tonight.",
  "The Prime Minister has announced a new set of measures this afternoon.",
  "Speaking outside Downing Street, she said the changes would take effect next month.",
  "Our political correspondent has more.",
  "We can now go live to our reporter at the scene.",
  "Thank you. Yes, the situation here is developing quickly.",
  "In other news, markets across Europe closed higher today.",
  "And now, the weather.",
  "Tomorrow will be cloudy, with a chance of rain in the north and brighter spells in the south.",
  "Temperatures will reach a high of fifteen degrees.",
  "That is all from us tonight. From everyone here at the BBC, goodnight.",
  "You're watching BBC World News.",
  "Stay with us. After the break, sport and the headlines.",
];

const intro = "Welcome. This part simulates a BBC television news broadcast in formal British English. Listen carefully.";
const text = [intro, ...sentences].join(" ");

// voices imported from voices.js

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
