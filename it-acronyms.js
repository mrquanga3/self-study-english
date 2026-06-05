import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "it-acronyms");
mkdirSync(OUT_DIR, { recursive: true });

// IT ACRONYMS: how common tech terms are said aloud. Some are spelled out
// (XML = "ex-em-el"), some are read as a word (JSON = "jay-son", GUI = "gooey").
// Each is said once, then used in a short sentence. Comment shows the spoken form.
const sentences = [
  "XML. The file is in XML format.",     // ex-em-el
  "SQL. Write a SQL query.",             // "es-cue-el" (or "sequel")
  "API. Call the API.",                  // ay-pee-eye
  "URL. Copy the URL.",                  // you-are-el
  "JSON. Return a JSON response.",       // jay-son
  "HTTP. Send an HTTP request.",         // aitch-tee-tee-pee
  "CSS. Style it with CSS.",             // see-ess-ess
  "GUI. Open the GUI.",                  // "gooey"
  "SDK. Install the SDK.",               // es-dee-kay
  "CLI. Run it from the CLI.",           // see-el-eye
  "UUID. Generate a UUID.",              // you-you-eye-dee
  "CI CD. Set up the CI CD pipeline.",   // see-eye see-dee
  // More common IT terms (tricky pronunciations)
  "GIF. Send me a GIF.",                 // "jif" or "gif"
  "SaaS. It's a SaaS product.",          // "sass"
  "Regex. Write a regex.",               // "reg-ex"
  "Nginx. Configure nginx.",             // "engine-x"
  "Kubernetes. Deploy on Kubernetes.",   // koo-ber-NET-eez
  "OAuth. Log in with OAuth.",           // "oh-auth"
  "Enum. Define an enum.",               // "ee-num"
  "Cache. Clear the cache.",             // "cash"
];

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is I.T. acronyms. Some are spelled out, like XML. Some are read as a word, like JSON. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// Casual American voices.
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
