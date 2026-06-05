import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { jobs } from "./voices.js";

// Stitches every set's audio into one mp3 per voice. All sets use the same
// format (24 kHz mono mp3), so concatenating the file buffers plays fine.
// Order = the recommended study order.
const sets = [
  "reductions",
  "word-reductions",
  "contractions",
  "flap-t",
  "glottal-t",
  "nt-drop",
  "linking",
  "palatalization",
  "minimal-pairs",
  "it-acronyms",
  "pilot-comms",
  "bbc-news",
  "numbers",
  "dates",
];

const OUT_DIR = join("audio", "combined");
mkdirSync(OUT_DIR, { recursive: true });

// One combined file per voice (us-female.mp3, in-male.mp3, ...).
for (const { file } of jobs) {
  const buffers = [];
  for (const set of sets) {
    const p = join("audio", set, file);
    if (existsSync(p)) buffers.push(readFileSync(p));
    else console.warn(`(skip, missing) ${p}`);
  }
  const dest = join(OUT_DIR, file);
  writeFileSync(dest, Buffer.concat(buffers));
  console.log(`Saved ${dest} (${buffers.length} sets)`);
}
