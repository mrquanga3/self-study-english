import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "numbers");
mkdirSync(OUT_DIR, { recursive: true });

// NUMBERS: how to say numbers in different situations. Numerals are read in
// context by the voice; word-forms are added where there are several ways.
const sentences = [
  // Cardinals
  "There are 25 students in the class.",
  "The population is about 1,000,000.",          // one million
  "The company made 2.5 billion dollars.",
  // Decimals and fractions
  "Pi is about 3.14.",                            // three point one four
  "Add one half cup of sugar.",                   // 1/2
  "About three quarters of the team agreed.",     // 3/4
  // Money
  "It costs $19.99.",                             // nineteen ninety-nine
  "The total is $1,250.",                         // one thousand two hundred fifty
  "Sales rose by 15% this year.",                 // fifteen percent
  // Ordinals
  "She finished in 1st place.",                   // first
  "It's my 21st birthday.",                       // twenty-first
  "Take the elevator to the 3rd floor.",          // third
  // Different ways to say the same number
  "1500 can be said two ways: fifteen hundred, or one thousand five hundred.",
  "A phone number, 555-0123, is said digit by digit: five five five, oh one two three.",
  // Negatives / temperature
  "Today it's -5 degrees.",                       // minus five
  "The score was 3 to 2.",                        // three to two / three-two
];

const intro = "Welcome. Let's learn how to say numbers in different ways. This part covers cardinals, decimals, money, and ordinals. Listen and repeat.";
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
