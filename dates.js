import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "dates");
mkdirSync(OUT_DIR, { recursive: true });

// DATES & TIME: how to say dates, years, and times in different ways.
const sentences = [
  // Days and months
  "Today is Monday, the 6th of June.",
  "We usually meet on Tuesdays.",
  // Date formats (US vs UK style)
  "My birthday is March 5th.",                 // March fifth
  "In Britain we say the 5th of March.",       // the fifth of March
  "The date 3/5/2024 is read March fifth, twenty twenty-four.",
  // Years (different ways)
  "I was born in 1990.",                       // nineteen ninety
  "It happened in 2008.",                      // two thousand eight
  "The year 2000 is said two thousand.",       // two thousand
  "By 2025, things had changed.",              // twenty twenty-five
  // Clock time (different ways)
  "The train leaves at 9:00 AM.",              // nine A M
  "It's 7:15.",                                // seven fifteen / quarter past seven
  "Seven fifteen can also be quarter past seven.",
  "Let's meet at 7:30.",                       // seven thirty / half past seven
  "Seven thirty can also be half past seven.",
  "It's 8:45.",                                // eight forty-five / quarter to nine
  "Let's have lunch at noon.",                 // 12:00
  // 24-hour and full datetime
  "The flight departs at 14:30.",              // fourteen thirty / two thirty PM
  "The meeting is on June 6th, 2026, at 8 PM.",
];

const intro = "Welcome. Let's learn how to say dates and times in different ways. Listen and repeat.";
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
