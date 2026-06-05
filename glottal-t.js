import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "glottal-t");
mkdirSync(OUT_DIR, { recursive: true });

// Glottal / "silent" T: T before a syllabic N is not released — the throat
// closes briefly (button -> "BUH-'n"). The neural voice does this naturally,
// so we just say each real word twice; no fake phonetic spelling.
//
// NOTE: the -tton / -tten / -dn't words below glottalize naturally on Edge.
// The -tain family (mountain, certain, curtain, fountain) will be pronounced
// with an AUDIBLE T by the free Edge voice — it won't glottalize them and no
// respelling reliably fixes it. They're kept here for reference/completeness;
// to hear a real glottal stop on those, a phoneme-capable TTS is needed.
const words = [
  // glottalize correctly on Edge:
  "Button.",
  "Cotton.",
  "Kitten.",
  "Written.",
  "Rotten.",
  "Gotten.",
  "Bitten.",
  "Forgotten.",
  "I didn't.",
  "I couldn't.",
  // -tain family + important (audible T on Edge — see note above):
  "Mountain.",
  "Certain.",
  "Curtain.",
  "Fountain.",
  "Important.", // casual: "impor-'nt"
  // More -ten / -tten words that glottalize
  "Tighten.",
  "Threaten.",
  "Frighten.",
  "Shorten.",
  "Sweeten.",
  "Mitten.",
];

// Domain examples in context (use words that glottalize: button/written/forgotten).
const domain = [
  // IT
  "Click the button.",          // button   -> buh-'n
  "It's written in code.",       // written  -> wri-'n
  "I've forgotten my password.", // forgotten -> forgah-'n
  // Banking
  "Press the button to pay.",    // button   -> buh-'n
  "A written statement.",        // written  -> wri-'n
  "Forgotten your PIN?",         // forgotten -> forgah-'n
];

// Say each word twice so the glottal stop is easy to catch, then the sentences.
const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is the glottal T. Before an N sound, the T is held silently. Listen and repeat.";
const text = [intro, ...words.map((w) => `${w} ${w}`), ...domain].join(" ");

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
