"""
Local, FREE voice-cloning → interview intro generator.

Clones the voice in sample.wav and speaks an interview intro,
saving the result as an MP3. 100 % local, zero cost.

Backends (tried in order):
  1. Coqui XTTS v2  — best quality, needs Python ≤ 3.12
  2. F5-TTS          — great quality, works on Python 3.13+
  3. Bark (Suno)     — decent quality, broad compatibility

Usage:
    set COQUI_TOS_AGREED=1
    python clone_local.py
    python clone_local.py --sample sample.wav --output interview_intro.mp3
    python clone_local.py --text "Custom intro text here"
    python clone_local.py --text "Hi, I'm Binh. Let me share my testing experience."

First run downloads the model (~1.8-2 GB). Subsequent runs are fast.

NOTE: Only clone a voice you own or have consent to use.
"""

import os
import sys
import subprocess
import argparse
import shutil
import tempfile
from pathlib import Path

# ─── Configuration ─────────────────────────────────────────────────────────────

DEFAULT_SAMPLE = "sample.wav"
DEFAULT_OUTPUT = "interview_intro.mp3"
DEFAULT_LANG = "en"

# Default interview intro text — edit to your liking
DEFAULT_INTRO = """
Hello everyone, and welcome.
My name is Binh, and I'm a QA engineer specializing in Cypress end-to-end testing.
Today I'd like to walk you through my experience building robust test automation frameworks,
and share some practical tips for writing reliable, maintainable tests.
Let's dive right in.
""".strip()

# ─── Helpers ───────────────────────────────────────────────────────────────────

def pip_install(*packages):
    """Install packages into the current Python environment."""
    cmd = [sys.executable, "-m", "pip", "install", "--quiet", *packages]
    print(f"  📦 Installing: {', '.join(packages)} ...")
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def check_ffmpeg():
    """Verify ffmpeg is available (needed for MP3 conversion)."""
    if shutil.which("ffmpeg"):
        return True
    # Try the Node ffmpeg-static binary
    static = Path(__file__).parent / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"
    if static.exists():
        os.environ["PATH"] = str(static.parent) + os.pathsep + os.environ["PATH"]
        return True
    return False


def wav_to_mp3(wav_path: str, mp3_path: str, bitrate: str = "192k"):
    """Convert WAV → MP3 using pydub (which shells out to ffmpeg)."""
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_wav(wav_path)
        audio.export(mp3_path, format="mp3", bitrate=bitrate)
    except Exception:
        # Fallback: use ffmpeg directly
        ffmpeg = shutil.which("ffmpeg") or "ffmpeg"
        subprocess.run(
            [ffmpeg, "-y", "-i", wav_path, "-b:a", bitrate, mp3_path],
            check=True, capture_output=True,
        )


def get_device():
    """Return 'cuda' if a GPU is available, else 'cpu'."""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"  🚀 GPU detected: {torch.cuda.get_device_name(0)}")
            return "cuda"
    except ImportError:
        pass
    print("  💻 Using CPU (slower, but works fine)")
    return "cpu"


# ─── Backend 1: Coqui XTTS v2 (best quality) ─────────────────────────────────

def try_xtts(text: str, sample: str, wav_out: str, lang: str) -> bool:
    """
    Try Coqui XTTS v2.  Returns True on success.
    Requires Python ≤ 3.12 and the 'TTS' package.
    """
    py_ver = sys.version_info
    if py_ver >= (3, 13):
        print("  ⚠️  XTTS v2: skipped (needs Python ≤ 3.12, you have "
              f"{py_ver.major}.{py_ver.minor})")
        return False

    try:
        import TTS  # noqa: F401
    except ImportError:
        try:
            pip_install("TTS")
        except Exception as e:
            print(f"  ⚠️  XTTS v2: install failed ({e})")
            return False

    try:
        from TTS.api import TTS as CoquiTTS

        device = get_device()
        print("  ⏳ Loading XTTS v2 model (first run downloads ~1.8 GB)...")
        tts = CoquiTTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

        print("  🎙️  Generating speech with cloned voice...")
        tts.tts_to_file(
            text=text,
            speaker_wav=sample,
            language=lang,
            file_path=wav_out,
        )
        return True
    except Exception as e:
        print(f"  ⚠️  XTTS v2: runtime error ({e})")
        return False


# ─── Backend 2: F5-TTS (works on Python 3.13) ────────────────────────────────

def try_f5tts(text: str, sample: str, wav_out: str, lang: str) -> bool:
    """
    Try F5-TTS (DiT-based, high-quality voice cloning).
    Works on Python 3.10+ including 3.13.
    """
    try:
        from f5_tts.api import F5TTS  # noqa: F401
    except ImportError:
        try:
            pip_install("f5-tts")
        except Exception as e:
            print(f"  ⚠️  F5-TTS: install failed ({e})")
            return False

    try:
        from f5_tts.api import F5TTS

        print("  ⏳ Loading F5-TTS model (first run downloads ~1.3 GB)...")
        tts = F5TTS()

        print("  🎙️  Generating speech with cloned voice...")
        tts.infer(
            ref_file=sample,
            ref_text="",          # empty = auto-transcribe the reference
            gen_text=text,
            file_wave=wav_out,
        )
        return True
    except Exception as e:
        print(f"  ⚠️  F5-TTS: runtime error ({e})")
        return False


# ─── Backend 3: Bark (Suno) — broad compatibility fallback ───────────────────

def try_bark(text: str, sample: str, wav_out: str, lang: str) -> bool:
    """
    Bark from Suno.  Voice "cloning" via speaker embeddings.
    NOTE: Bark's cloning is more of a style-transfer than a true clone.
    """
    try:
        import bark  # noqa: F401
    except ImportError:
        try:
            pip_install("git+https://github.com/suno-ai/bark.git", "scipy")
        except Exception as e:
            print(f"  ⚠️  Bark: install failed ({e})")
            return False

    try:
        from bark import generate_audio, preload_models, SAMPLE_RATE
        import numpy as np
        from scipy.io.wavfile import write as wav_write

        print("  ⏳ Loading Bark model (first run downloads ~5 GB)...")
        preload_models()

        print("  🎙️  Generating speech (Bark style-transfer)...")
        audio_array = generate_audio(text)
        wav_write(wav_out, SAMPLE_RATE, (audio_array * 32767).astype(np.int16))
        return True
    except Exception as e:
        print(f"  ⚠️  Bark: runtime error ({e})")
        return False


# ─── Main pipeline ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Clone a voice from a sample and generate an interview intro (MP3).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python clone_local.py
  python clone_local.py --text "Hi, I'm Binh. Welcome to my talk."
  python clone_local.py --sample sample.wav --output my_intro.mp3
  python clone_local.py --lang vi --text "Xin chào mọi người"
  python clone_local.py --backend f5tts
        """,
    )
    parser.add_argument("--sample", default=DEFAULT_SAMPLE,
                        help=f"Voice sample WAV (default: {DEFAULT_SAMPLE})")
    parser.add_argument("--text", default=None,
                        help="Text for the cloned voice to speak")
    parser.add_argument("--text-file", default=None,
                        help="Read text from a file instead of --text")
    parser.add_argument("--output", default=DEFAULT_OUTPUT,
                        help=f"Output MP3 path (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--lang", default=DEFAULT_LANG,
                        help=f"Language code (default: {DEFAULT_LANG})")
    parser.add_argument("--backend", choices=["xtts", "f5tts", "bark", "auto"],
                        default="auto",
                        help="Force a specific backend (default: auto)")
    args = parser.parse_args()

    # ── Resolve text ────────────────────────────────────────────────────────
    if args.text_file:
        if not os.path.exists(args.text_file):
            sys.exit(f"❌ Text file not found: {args.text_file}")
        text = Path(args.text_file).read_text(encoding="utf-8").strip()
    elif args.text:
        text = args.text.strip()
    else:
        text = DEFAULT_INTRO
        print(f"ℹ️  Using default intro text (pass --text to customise)")

    if not text:
        sys.exit("❌ Text is empty. Provide --text or --text-file.")

    # ── Validate sample ────────────────────────────────────────────────────
    if not os.path.exists(args.sample):
        sys.exit(
            f"❌ Voice sample not found: {args.sample}\n"
            f"   Extract one with:\n"
            f'   node extract-audio.js "WDX Cypress NMBinh.mp4" sample.wav 5 30'
        )

    sample_size = os.path.getsize(args.sample)
    if sample_size < 10_000:
        print(f"⚠️  Sample is very small ({sample_size:,} bytes). "
              f"15-90s of clean speech works best.")

    # ── Check ffmpeg ────────────────────────────────────────────────────────
    if not check_ffmpeg():
        print("⚠️  ffmpeg not found — output will be WAV instead of MP3.")
        args.output = args.output.replace(".mp3", ".wav")

    # ── Print summary ───────────────────────────────────────────────────────
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║         🎤  Local Voice Cloning Pipeline  🎤           ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print(f"║  Sample : {Path(args.sample).name:<45s}  ║")
    print(f"║  Output : {Path(args.output).name:<45s}  ║")
    print(f"║  Lang   : {args.lang:<45s}  ║")
    print(f"║  Backend: {args.backend:<45s}  ║")
    print(f"║  Text   : {text[:42] + '...' if len(text) > 45 else text:<45s}  ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # ── Intermediate WAV path ──────────────────────────────────────────────
    tmp_wav = tempfile.mktemp(suffix=".wav", prefix="clone_")

    # ── Try backends ───────────────────────────────────────────────────────
    backends = {
        "xtts":  ("Coqui XTTS v2", try_xtts),
        "f5tts": ("F5-TTS",        try_f5tts),
        "bark":  ("Bark (Suno)",   try_bark),
    }

    if args.backend == "auto":
        order = ["xtts", "f5tts", "bark"]
    else:
        order = [args.backend]

    success = False
    for key in order:
        name, fn = backends[key]
        print(f"🔄 Trying {name}...")
        if fn(text, args.sample, tmp_wav, args.lang):
            print(f"  ✅ {name} succeeded!")
            success = True
            break
        print()

    if not success:
        # Clean up
        if os.path.exists(tmp_wav):
            os.remove(tmp_wav)
        print()
        print("=" * 60)
        print("❌ All backends failed. Manual setup:")
        print()
        print("  Option A — Install Python 3.11 + XTTS v2:")
        print("    1. Download Python 3.11 from python.org")
        print("    2. py -3.11 -m venv .venv311")
        print("    3. .venv311\\Scripts\\activate")
        print("    4. pip install TTS pydub")
        print("    5. set COQUI_TOS_AGREED=1")
        print("    6. python clone_local.py --backend xtts")
        print()
        print("  Option B — Install F5-TTS manually:")
        print("    1. pip install f5-tts")
        print("    2. python clone_local.py --backend f5tts")
        print()
        print("  Option C — Use Docker (Coqui):")
        print("    docker run --rm -v .:/data ghcr.io/coqui-ai/tts \\")
        print('      --model_name tts_models/multilingual/multi-dataset/xtts_v2 \\')
        print('      --speaker_wav /data/sample.wav \\')
        print('      --language_idx en \\')
        print('      --text "Your intro text" \\')
        print('      --out_path /data/interview_intro.wav')
        print("=" * 60)
        sys.exit(1)

    # ── Convert to MP3 ────────────────────────────────────────────────────
    if args.output.endswith(".mp3"):
        print(f"  🔧 Converting to MP3...")
        try:
            pip_install("pydub")
        except Exception:
            pass
        wav_to_mp3(tmp_wav, args.output)
        os.remove(tmp_wav)
    else:
        shutil.move(tmp_wav, args.output)

    # ── Done! ──────────────────────────────────────────────────────────────
    size_kb = os.path.getsize(args.output) / 1024
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                    ✅  All done!                        ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print(f"║  Output: {args.output:<46s}  ║")
    print(f"║  Size  : {size_kb:,.1f} KB{'':<39s}  ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print("║  Play it:                                               ║")
    print(f"║    start {args.output:<46s}  ║")
    print("║                                                         ║")
    print("║  Re-run with different text:                            ║")
    print('║    python clone_local.py --text "Your new text"         ║')
    print("╚══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
