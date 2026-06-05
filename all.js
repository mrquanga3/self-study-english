// Runs every generator so all audio/<topic>/ folders are (re)built in one go.
import { execFileSync } from "child_process";

const scripts = ["reduce.js", "flap-t.js", "linking.js", "glottal-t.js", "nt-drop.js", "word-reductions.js", "contractions.js", "palatalization.js", "minimal-pairs.js", "it-acronyms.js"];

for (const script of scripts) {
  console.log(`\n=== ${script} ===`);
  execFileSync("node", [script], { stdio: "inherit" });
}

// Stitch everything into audio/combined/{female,male}.mp3
console.log(`\n=== combine.js ===`);
execFileSync("node", ["combine.js"], { stdio: "inherit" });

console.log("\nAll audio generated under audio/");
