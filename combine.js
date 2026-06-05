import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

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
];

const OUT_DIR = join("audio", "combined");
mkdirSync(OUT_DIR, { recursive: true });

for (const voice of ["female.mp3", "male.mp3"]) {
  const buffers = [];
  for (const set of sets) {
    const p = join("audio", set, voice);
    if (existsSync(p)) buffers.push(readFileSync(p));
    else console.warn(`(skip, missing) ${p}`);
  }
  const dest = join(OUT_DIR, voice);
  writeFileSync(dest, Buffer.concat(buffers));
  console.log(`Saved ${dest} (${buffers.length} sets)`);
}
