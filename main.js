const mic = require("mic");
const say = require("say");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");

const googleTTS = require("google-tts-api");
const https = require("https");

const player = require("play-sound")({ player: "play" });

const RECORD_DURATION = 5; // seconds
const INPUT_FILE = "input.wav";
const OUTPUT_FILE = "response.wav";

// Record audio
function recordAudio(filePath, durationSec) {
  return new Promise((resolve, reject) => {
    const micInstance = mic({
      rate: "16000",
      channels: "1",
      debug: false,
      fileType: "wav",
    });

    const micInputStream = micInstance.getAudioStream();
    const outputFileStream = fs.WriteStream(filePath);

    micInputStream.pipe(outputFileStream);

    micInstance.start();

    console.log("Recording...");

    setTimeout(() => {
      micInstance.stop();
      console.log("Recording stopped.");
      resolve();
    }, durationSec * 1000);

    micInputStream.on("error", (err) => {
      reject("Mic error: " + err);
    });
  });
}

// Transcribe using Whisper CLI
// function transcribeWhisper(filePath) {
//   return new Promise((resolve, reject) => {
//     exec(
//       `whisper ${filePath} --model base --language en --output_format txt`,
//       (error, stdout, stderr) => {
//         if (error) {
//           return reject(`Transcription error: ${stderr}`);
//         }

//         const txtPath = filePath.replace(".wav", ".txt");
//         const text = fs.readFileSync(txtPath, "utf-8");
//         fs.unlinkSync(txtPath); // clean up
//         resolve(text.trim());
//       }
//     );
//   });
// }

function transcribeWhisper(filePath) {
  return new Promise((resolve, reject) => {
    exec(`python transcribe.py "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(`Transcription error: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
}

// Send to Ollama
async function chatWithOllama(prompt) {
  try {
    const res = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: `${prompt} Give me answer as human and in short 200 letters only as you taking with someone not chatting.`,
      stream: false,
    });

    return res.data.response;
  } catch (err) {
    return "Error contacting Ollama: " + err.message;
  }
}

// Generate TTS audio using gTTS (you can switch to other APIs like Google or AWS)
// function generateTTS(text, filePath) {
//   return new Promise((resolve, reject) => {
//     const command = `gtts-cli "${text}" --lang en --output ${filePath}`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) return reject(`TTS error: ${stderr}`);
//       resolve();
//     });
//   });
// }

function generateTTS(text, filePath) {
  return new Promise((resolve, reject) => {
    const url = googleTTS.getAudioUrl(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
    });

    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(filePath);
        reject(`TTS download error: ${err.message}`);
      });
  });
}

// Play audio
// function playAudio(filePath) {
//   return new Promise((resolve, reject) => {
//     player.play(filePath, (err) => {
//       if (err) return reject("Playback error: " + err);
//       resolve();
//     });
//   });
// }

// function playAudio(filePath) {
//   return new Promise((resolve, reject) => {
//     console.log("Playing audio...");
//     const audio = new Aplay(filePath);

//     audio.play();

//     audio.on("complete", () => {
//       console.log("Playback complete.");
//       resolve();
//     });

//     audio.on("error", (err) => {
//       reject("Aplay error: " + err);
//     });
//   });
// }

function playAudio(filePath) {
  return new Promise((resolve, reject) => {
    console.log("Playing audio...");
    player.play(filePath, (err) => {
      if (err) reject("Playback error: " + err);
      else resolve();
    });
  });
}

async function speakText(text) {
  return new Promise((resolve, reject) => {
    say.speak(text, undefined, 1.0, (err) => {
      if (err) {
        console.error("Speech error:", err);
        reject(err);
      } else {
        console.log("Agent:", text);
        resolve();
      }
    });
  });
}

// Main loop
async function main() {
  for (let i = 0; i < 3; i++) {
    console.log(`\n>> Press Enter to record (${RECORD_DURATION}s)`);
    await new Promise((res) => process.stdin.once("data", res));

    try {
      await recordAudio(INPUT_FILE, RECORD_DURATION);
      const transcript = await transcribeWhisper(INPUT_FILE);
      console.log("You said:", transcript);

      const response = await chatWithOllama(transcript);
      console.log("AI says:", response);

      //   speak

      await speakText(response);

      //   await generateTTS(response, OUTPUT_FILE);
      //   await playWithDefaultPlayer(OUTPUT_FILE);
      //   await playAudio(OUTPUT_FILE);

      //   fs.unlinkSync(INPUT_FILE);
      //   fs.unlinkSync(OUTPUT_FILE);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  process.exit();
}

main();
