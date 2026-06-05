import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "linking");
mkdirSync(OUT_DIR, { recursive: true });

// Connected-speech / linking examples (American English).
// The neural voice links naturally, so we just say each real phrase
// (twice) and let the linking happen — no fake phonetic spelling.
const phrases = [
  // 1) Consonant -> Vowel: final consonant joins the next word.
  "An apple.",
  "Pick it up.",
  "Turn it off.",
  "Come on in.",

  // 2) Vowel -> Vowel with a /w/ glide (after oo, oh sounds).
  "Go away.",
  "Do it.",
  "Who is it?",

  // 3) Vowel -> Vowel with a /y/ glide (after ee, ay sounds).
  "She is here.",
  "I agree.",
  "Be honest.",

  // 4) Same / similar consonants merge into one longer sound.
  "Bus stop.",
  "Gas station.",
  "Bad day.",
  "Catch up.",   // catch + up -> "catchup"

  // 5) IT domain
  "Back it up.",   // back-it-up
  "Set it up.",    // set-it-up
  "Log in.",       // lo-gin
  "Check it out.", // che-ki-tout

  // 6) Banking domain
  "Fill it out.",  // fi-li-tout
  "Pay it off.",   // pay-i-toff
  "Sign in.",      // sig-nin
  "Cash it out.",  // ca-shi-tout

  // 7) More common linked phrases
  "An hour.",      // a-nour
  "Not at all.",   // no-da-tall
  "Far away.",     // fa-raway
  "First of all.", // fir-stuh-vall
  "Hold on.",      // hol-don
  "Come on.",      // co-mon
  // (The "nt -> n" T-drop — twenty, internet, center — lives in nt-drop.js)
];

// Say each phrase twice so the linked version is easy to catch.
const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is linking. Words connect together smoothly, with no pause between them. Listen and repeat.";
const text = [intro, ...phrases.map((p) => `${p} ${p}`)].join(" ");

// American voices.
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
