# 🎙️ Voice AI Agent

A real-time voice-based AI assistant using **Node.js**, **Whisper** for speech-to-text, **Mistral via Ollama** for AI response, and **TTS** for voice output.

---

## 🚀 Features

- 🎧 Record your voice (5 seconds)
- 📝 Transcribe speech to text using [OpenAI Whisper](https://github.com/openai/whisper)
- 💬 Get AI responses using [Ollama](https://ollama.com/)
- 🗣️ Convert AI response to voice using `gtts` or `TTS` models
- 🔊 Play response audio on Windows

---

## 🛠️ Technologies Used

- **Node.js**
- **Python** (for Whisper integration)
- **Whisper** – Speech-to-text (CLI or Python API)
- **Ollama** – Local LLM serving Mistral
- **gTTS** / **TTS (Coqui.ai)** – Text-to-Speech
- **`play-sound`** – Audio playback
- **`sounddevice`** (if using Python for recording)
- **ffmpeg** – Audio format conversion

---

## 📦 Installation

### 1. Clone the Repository

```bash
cd Voice_Ai_Agent
```

Install Node.js Dependencies
```bash
npm install
```

Install Python & Dependencies
```bash
pip install openai-whisper gTTS
```
🔹 Ollama (Mistral)
Install Ollama from https://ollama.com and run the model:
```bash
  ollama run mistral
```
▶️ Usage
```bash
node main.js
```
Follow the prompts:

Press Enter to record

Speak for 5 seconds

Hear the AI's voice response!
On Windows, you must install SoX and add it to PATH to use play.
🔗 Credits
OpenAI Whisper
Ollama
TTS Coqui.ai
