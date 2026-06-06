const sets = [
  {
    id: "combined", title: "▶ Full Course (all parts)", rule: "Everything below, back to back.",
    examples: "All parts in the recommended study order.", combined: true
  },
  {
    id: "reductions", title: "1 · Single-word Reductions", rule: "Casual spoken forms",
    examples: "<code>wanna</code> (want to), <code>gonna</code> (going to), <code>gotta</code> (got to)"
  },
  {
    id: "word-reductions", title: "2 · Word Reductions (weak forms)", rule: "Function words go weak",
    examples: "<code>to → tuh</code>, <code>for → fer</code>, <code>and → en</code>"
  },
  {
    id: "contractions", title: "3 · Contractions", rule: "Hear the 've / 'll ending",
    examples: "<code>I</code> · <code>I've</code> · <code>I'll</code>"
  },
  {
    id: "flap-t", title: "4 · Flap T", rule: "T between vowels → soft D",
    examples: "<code>water → wadder</code>, <code>better → bedder</code>, <code>metadata</code>"
  },
  {
    id: "glottal-t", title: "5 · Glottal T", rule: "T before N is held silent",
    examples: "<code>button → buh-'n</code>, <code>kitten</code>, <code>written</code>"
  },
  {
    id: "nt-drop", title: "6 · NT Reduction", rule: "T drops after N",
    examples: "<code>internet → innernet</code>, <code>twenty → twenny</code>"
  },
  {
    id: "linking", title: "7 · Linking", rule: "Words glue together",
    examples: "<code>pick it up → pi-ki-tup</code>, <code>an apple → a-napple</code>"
  },
  {
    id: "palatalization", title: "8 · Palatalization (D/T + Y)", rule: "did you → didja",
    examples: "<code>did you → didja</code>, <code>got you → gotcha</code>"
  },
  {
    id: "minimal-pairs", title: "9 · Minimal Pairs", rule: "Similar words, one different sound",
    examples: "<code>world / word / would</code>, <code>ship / sheep</code>, <code>cache / cash</code>"
  },
  {
    id: "it-acronyms", title: "10 · IT Acronyms", rule: "How tech terms are said aloud",
    examples: "<code>XML → ex-em-el</code>, <code>JSON → jay-son</code>, <code>GUI → gooey</code>"
  },
  {
    id: "pilot-comms", title: "11 · Pilot / ATC Comms", rule: "Aviation radio phraseology",
    examples: "<code>Mayday</code>, <code>cleared for takeoff</code>, <code>niner</code>, <code>squawk 7700</code>"
  },
  {
    id: "pilot-radio", title: "12 · Pilot Comms (radio static)", rule: "Same calls, with VHF radio noise",
    examples: "Band-limited + static, like a real cockpit radio 📻"
  },
  {
    id: "bbc-news", title: "13 · BBC News (British)", rule: "Formal British broadcast English",
    examples: "<code>BBC News at Ten</code>, weather, headlines 🇬🇧"
  },
  {
    id: "numbers", title: "14 · Numbers", rule: "Numbers in different situations",
    examples: "<code>$19.99</code>, <code>3.14</code>, <code>21st</code>, <code>1500</code>"
  },
  {
    id: "dates", title: "15 · Dates & Time", rule: "Dates, years & clock time",
    examples: "<code>1990 → nineteen ninety</code>, <code>7:30 → half past seven</code>"
  },
  {
    id: "radio-tactical", title: "16 · Tactical Radio (clean)", rule: "Military/combat radio chatter",
    examples: "<code>Enemy contact</code>, <code>requesting backup</code>, <code>move move move</code>"
  },
  {
    id: "radio-tactical-fx", title: "17 · Tactical Radio (walkie-talkie)", rule: "Same, with game-style radio static 📻",
    examples: "Squelch clicks, roger beep, heavy static"
  },
];

// Voices (must match voices.js file names).
const voices = [
  { file: "us-female.mp3", label: "🇺🇸 US · Ava (F)" },
  { file: "us-male.mp3", label: "🇺🇸 US · Andrew (M)" },
  { file: "in-female.mp3", label: "🇮🇳 Indian · Neerja (F)" },
  { file: "in-male.mp3", label: "🇮🇳 Indian · Prabhat (M)" },
  { file: "au-female.mp3", label: "🇦🇺 Australian · Natasha (F)" },
  { file: "au-male.mp3", label: "🇦🇺 Australian · William (M)" },
  { file: "sg-female.mp3", label: "🇸🇬 Singapore · Luna (F)" },
  { file: "sg-male.mp3", label: "🇸🇬 Singapore · Wayne (M)" },
  { file: "th-female.mp3", label: "🇹🇭 Thai · Premwadee (F)" },
  { file: "th-male.mp3", label: "🇹🇭 Thai · Niwat (M)" },
  { file: "ru-female.mp3", label: "🇷🇺 Russian · Svetlana (F)" },
  { file: "ru-male.mp3", label: "🇷🇺 Russian · Dmitry (M)" },
  { file: "jp-female.mp3", label: "🇯🇵 Japanese · Nanami (F)" },
  { file: "jp-male.mp3", label: "🇯🇵 Japanese · Keita (M)" },
  { file: "zh-female.mp3", label: "🇨🇳 Chinese · Xiaoxiao (F)" },
  { file: "zh-male.mp3", label: "🇨🇳 Chinese · Yunxi (M)" },
];

// Build the collapsible "words & sentences" transcript for a set, if one
// exists in transcripts.js. Returns "" for sets with no transcript.
const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function transcriptHtml(id) {
  const lines = (window.TRANSCRIPTS || {})[id];
  if (!lines || !lines.length) return "";
  const items = lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("");
  return `<details class="script">
      <summary>Words &amp; sentences (${lines.length})</summary>
      <ol>${items}</ol>
    </details>`;
}

const app = document.getElementById("app");
for (const s of sets) {
  const card = document.createElement("section");
  card.className = "card" + (s.combined ? " combined" : "");
  card.innerHTML = `
    <h2>${s.title}</h2>
    <p class="rule">${s.rule}</p>
    <p class="examples">${s.examples}</p>
    <audio class="play" controls preload="none" src="audio/${s.id}/us-female.mp3"></audio>
    ${transcriptHtml(s.id)}`;
  app.appendChild(card);
}

// --- Game / special voices: single-file ElevenLabs clips (NOT accent-switchable;
// they have no "play" class so the dropdown leaves them alone). ---
const gameClips = [
  { title: "🎮 Tactical Radio — walkie-talkie", rule: "FPS combat callouts + radio static", src: "game/tactical-fx/voice.mp3" },
  { title: "🎮 Tactical — clean", rule: "Same callouts, no radio FX", src: "game/tactical/voice.mp3" },
  { title: "🎮 Half-Life — radio", rule: "Iconic Half-Life lines + radio static", src: "game/halflife-fx/voice.mp3" },
  { title: "🎚️ Voice option · Charlie", rule: "Deep, Confident (radio)", src: "game/voice-options/charlie-radio.mp3" },
  { title: "🎚️ Voice option · Callum", rule: "Husky Trickster (radio)", src: "game/voice-options/callum-radio.mp3" },
  { title: "🎚️ Voice option · Brian", rule: "Deep, Resonant (radio)", src: "game/voice-options/brian-radio.mp3" },
  { title: "🎚️ Voice option · Bill", rule: "Wise, Mature (radio)", src: "game/voice-options/bill-radio.mp3" },
  { title: "🎚️ Voice option · George", rule: "Storyteller (radio)", src: "game/voice-options/george-radio.mp3" },
  { title: "🎚️ Voice option · Eric", rule: "Smooth, Trustworthy (radio)", src: "game/voice-options/eric-radio.mp3" },
];
const gameHeader = document.createElement("section");
gameHeader.className = "card combined";
gameHeader.innerHTML = `<h2>🎮 Game &amp; Special Voices (ElevenLabs)</h2>
  <p class="examples">Expressive voices — the accent dropdown above does <b>not</b> affect these.</p>`;
app.appendChild(gameHeader);
for (const g of gameClips) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `<h2>${g.title}</h2><p class="rule">${g.rule}</p>
    <audio controls preload="none" src="audio/${g.src}"></audio>`;
  app.appendChild(card);
}

// Accent/voice switcher: updates every player's src, keeping the same set.
const picker = document.getElementById("voice");
for (const v of voices) {
  const opt = document.createElement("option");
  opt.value = v.file; opt.textContent = v.label;
  picker.appendChild(opt);
}
picker.addEventListener("change", () => {
  document.querySelectorAll("audio.play").forEach((a) => {
    const wasPlaying = !a.paused;
    a.pause();
    a.src = a.src.replace(/[^/]+\.mp3$/, picker.value);
    if (wasPlaying) a.play();
  });
});

// Only one audio plays at a time: starting one pauses all the others.
document.addEventListener("play", (e) => {
  document.querySelectorAll("audio").forEach((other) => {
    if (other !== e.target) other.pause();
  });
}, true);

// Replay mode: off (play once) or repeat (loop the current part).
const replay = document.getElementById("replay");
document.addEventListener("ended", (e) => {
  if (replay.value === "repeat") {
    e.target.currentTime = 0;
    e.target.play();
  }
}, true);
