import { appendFile, readFileSync, unlinkSync, existsSync } from "fs";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getUserInput = () => {
  return new Promise((resolve, reject) => {
    rl.question("Enter input: ", (input) => {
      // Saving the input into a text file
      appendFile("Input.txt", input + "\n", (err) => {
        if (err) {
          console.log("Program failed try again.");
          // stoping the program
          process.exit(1);
        }
        // Reading the file
        const fileContent = readFileSync("Input.txt", "utf8");
        // Spliting the words
        const words = fileContent.split(/\s+/);
        words.pop();
        resolve(words);
      });
    });
  });
};

const disconnectingNodes = async (range, nodes) => {
  for (let idx = 0; idx < range; idx++) {
    await delay(1000);
    nodes[0].socket.disconnect(true);
  }
};

const deleteInputFile = () => {
  try {
    if (existsSync("Input.txt")) {
      unlinkSync("Input.txt");
    }
  } catch (err) {
    console.error("Input.txt file does not exist.");
  }
};

export { getUserInput, disconnectingNodes, delay, deleteInputFile };
