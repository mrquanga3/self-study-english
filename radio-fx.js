import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import ffmpeg from "ffmpeg-static";
import { jobs } from "./voices.js";

// Turns clean pilot-comms audio into a WALKIE-TALKIE radio call:
//   - narrow band-pass (350-2700 Hz, like a VHF set)
//   - heavy compression + bit-crush distortion (radio AGC + clipping)
//   - constant low static under the voice
//   - a short squelch "click" of noise at the start (PTT keyed)
//   - a "roger beep" tone + squelch tail at the end (PTT released)
// Each clean set -> its walkie-talkie version.
const SETS = [
  { src: "pilot-comms",    out: "pilot-radio" },
  { src: "radio-tactical", out: "radio-tactical-fx" },
];

const filter = [
  // voice -> radio band, compressed, crushed, boosted
  "[0:a]highpass=f=350,lowpass=f=2700,acompressor=threshold=-18dB:ratio=8:attack=5:release=80,acrusher=bits=7:mode=log:mix=0.4,volume=4[v]",
  // constant background static under the whole voice
  "[1:a]volume=0.12[bg]",
  "[v][bg]amix=inputs=2:duration=first:normalize=0[body]",
  // start squelch click (~120 ms noise burst)
  "[4:a]atrim=0:0.12,volume=0.4,highpass=f=350,lowpass=f=2700[sqs]",
  // roger beep (1200 Hz, 150 ms) through the same radio band
  "[2:a]volume=0.22,highpass=f=350,lowpass=f=2700[beep]",
  // end squelch tail (~250 ms noise burst)
  "[3:a]atrim=0:0.25,volume=0.35,highpass=f=350,lowpass=f=2700[sqe]",
  // sequence: click -> voice -> beep -> squelch tail
  "[sqs][body][beep][sqe]concat=n=4:v=0:a=1,alimiter=limit=0.95[a]",
].join(";");

for (const { src: srcDir, out: outDir } of SETS) {
  if (!existsSync(join("audio", srcDir))) { console.warn(`(skip set, missing) audio/${srcDir}`); continue; }
  mkdirSync(join("audio", outDir), { recursive: true });

  for (const { file, voice } of jobs) {
    const src = join("audio", srcDir, file);
    if (!existsSync(src)) { console.warn(`(skip, missing) ${src}`); continue; }
    const dest = join("audio", outDir, file);

    execFileSync(ffmpeg, [
      "-y",
      "-i", src,                                                              // [0] voice
      "-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.6:sample_rate=24000",  // [1] bg static
      "-f", "lavfi", "-i", "sine=frequency=1200:duration=0.15:sample_rate=24000",   // [2] roger beep
      "-f", "lavfi", "-i", "anoisesrc=color=white:amplitude=0.9:sample_rate=24000", // [3] end squelch
      "-f", "lavfi", "-i", "anoisesrc=color=white:amplitude=0.9:sample_rate=24000", // [4] start squelch
      "-filter_complex", filter,
      "-map", "[a]",
      "-ac", "1", "-ar", "24000", "-b:a", "48k",
      dest,
    ], { stdio: ["ignore", "ignore", "ignore"] });

    console.log(`Saved ${dest} (walkie-talkie fx, ${voice})`);
  }
}
