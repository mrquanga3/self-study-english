import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "pilot-comms");
mkdirSync(OUT_DIR, { recursive: true });

// PILOT / ATC COMMUNICATION: realistic radiotelephony phraseology in common
// situations (departure, cruise, emergency, approach). Aviation numbers are
// spoken specially: 3 = "tree", 5 = "fife", 9 = "niner", and letters use the
// NATO alphabet (Alpha, Bravo, Charlie...). Written that way so the voice says
// them like a real pilot.
const sentences = [
  // Pre-flight / cabin announcement
  "Ladies and gentlemen, this is your captain speaking.",
  "We are now cruising at an altitude of tree fife thousand feet.",
  "Cabin crew, prepare for departure.",

  // Departure
  "Tower, Speedbird niner two, ready for departure, runway two seven.",
  "Speedbird niner two, cleared for takeoff, runway two seven.",
  "Cleared for takeoff, runway two seven, Speedbird niner two.",

  // En route
  "Center, Delta four fife seven, request descent to flight level tree tree zero.",
  "Delta four fife seven, descend and maintain flight level tree tree zero.",
  "Roger, wilco.",
  "Affirmative.",
  "Standby.",

  // Approach and landing
  "Approach, Delta four fife seven, established on the I.L.S. runway two seven.",
  "Delta four fife seven, cleared to land, runway two seven, wind two fife zero at one zero.",
  "Cabin crew, prepare for landing.",

  // Emergency
  "Mayday, mayday, mayday. Delta four fife seven, engine failure, requesting immediate return.",
  "Squawk seven seven zero zero.",
];

const intro = "Welcome. This part simulates pilot and air traffic control communication in real situations. Listen carefully.";
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
