import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import ffmpeg from "ffmpeg-static";

// Iconic Half-Life lines, generated with an expressive ElevenLabs male voice
// and run through the walkie-talkie radio effect (game-style comms).
// Setup: ELEVENLABS_API_KEY in .env (see .env.example), then:  node elevenlabs-halflife.js

function loadEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY || API_KEY.includes("your_key_here")) {
  console.error("Missing ELEVENLABS_API_KEY. Copy .env.example to .env and paste your key.");
  process.exit(1);
}

const API = "https://api.elevenlabs.io/v1";
const headers = { "xi-api-key": API_KEY, "Content-Type": "application/json" };

async function pickVoice() {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;
  const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": API_KEY } });
  if (!res.ok) throw new Error(`voices: ${res.status} ${await res.text()}`);
  const { voices } = await res.json();
  const isMale = (v) => (v.labels?.gender || "").toLowerCase() === "male";
  const pick =
    voices.find((v) => /clyde/i.test(v.name)) ||
    voices.find((v) => /adam|arnold|josh|antoni|drew|paul/i.test(v.name) && isMale(v)) ||
    voices.find(isMale) || voices[0];
  console.log(`Using voice "${pick.name}" (${pick.voice_id}).`);
  return pick.voice_id;
}

// Iconic Half-Life lines (G-Man, HECU marines, Black Mesa PA, Barney, scientists).
const lines = [
  // G-Man
  "Rise and shine, Mister Freeman. Rise and shine.",
  "The right man in the wrong place can make all the difference in the world.",
  "Prepare for unforeseen consequences.",
  // Black Mesa announcement system
  "Warning. Biohazard detected.",
  "Attention. All personnel must evacuate immediately.",
  "Containment failure in sector C.",
  // HECU marine radio chatter
  "We have hostiles!",
  "Target practice!",
  "Forget about Freeman!",
  "Move it out!",
  // Barney and scientists
  "Gordon! It's me, Barney!",
  "Catch me later, I'll buy you a beer.",
  "The military's here. Everything's going to be all right.",
  "It's not supposed to do that.",
];

const OUT_CLEAN = join("audio", "game", "halflife");
const OUT_FX = join("audio", "game", "halflife-fx");
mkdirSync(OUT_CLEAN, { recursive: true });
mkdirSync(OUT_FX, { recursive: true });

async function tts(voiceId, text) {
  const res = await fetch(`${API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.3, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`tts: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function radioFx(src, dest) {
  const filter = [
    "[0:a]highpass=f=350,lowpass=f=2700,acompressor=threshold=-18dB:ratio=8:attack=5:release=80,acrusher=bits=7:mode=log:mix=0.4,volume=4[v]",
    "[1:a]volume=0.12[bg]",
    "[v][bg]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]",
  ].join(";");
  execFileSync(ffmpeg, [
    "-y", "-i", src,
    "-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.6:sample_rate=24000",
    "-filter_complex", filter, "-map", "[a]", "-ac", "1", "-ar", "24000", "-b:a", "48k", dest,
  ], { stdio: ["ignore", "ignore", "ignore"] });
}

const voiceId = await pickVoice();
const text = lines.join(" ");
const clean = join(OUT_CLEAN, "voice.mp3");
writeFileSync(clean, await tts(voiceId, text));
console.log(`Saved ${clean}`);
radioFx(clean, join(OUT_FX, "voice.mp3"));
console.log(`Saved ${join(OUT_FX, "voice.mp3")} (walkie-talkie fx)`);
