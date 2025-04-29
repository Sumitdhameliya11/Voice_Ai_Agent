const { exec } = require("child_process");
const path = require("path");

export function playWithDefaultPlayer(filePath) {
  // Ensure correct file path (absolute and properly escaped)
  const fullPath = path.resolve(filePath);

  exec(`start "" "${fullPath}"`, (error) => {
    if (error) {
      console.error(`Error playing audio: ${error}`);
    } else {
      console.log("Playing audio with default media player...");
    }
  });
}

playWithDefaultPlayer("input.wav");
