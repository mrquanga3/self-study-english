import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "radio-tactical");
mkdirSync(OUT_DIR, { recursive: true });

// TACTICAL / MILITARY RADIO chatter in combat situations (game-style).
// This is the CLEAN voice; radio-fx.js turns it into walkie-talkie audio.
const sentences = [
  "Command, this is Alpha One, requesting permission to engage, over.",
  "Enemy contact, two hundred meters, north ridge.",
  "We are pinned down, requesting immediate backup, over.",
  "Roger that, reinforcements inbound, hold your position.",
  "Move, move, move!",
  "Take cover! Incoming!",
  "Grenade! Get down!",
  "Man down! We need a medic!",
  "Target neutralized, area secure.",
  "Watch your six!",
  "Air support is on the way, danger close.",
  "Copy that, moving to the extraction point.",
  "Hold the line, do not fall back.",
  "Mission accomplished, returning to base.",
  "Say again, you're breaking up, over.",
  "Wilco. Out.",
];

const intro = "Welcome. This part simulates tactical military radio communication in combat situations, like in video games. Listen carefully.";
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
