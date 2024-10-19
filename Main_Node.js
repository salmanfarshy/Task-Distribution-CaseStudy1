import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  getUserInput,
  disconnectingNodes,
  delay,
  deleteInputFile,
} from "./Utils.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const main = async () => {
  // taking user input
  const words = await getUserInput();
  // getting types from input
  const types = [...new Set(words.map((type) => type[0]))];

  // server starting
  server.listen(3000, () => {
    console.log("\nMain node started.");
  });

  const nodes = [];

  io.on("connection", (socket) => {
    // connecting a node and storing their identity
    nodes.push({
      no: nodes?.length + 1,
      socket,
      id: socket.id,
      type: types[nodes?.length],
    });
    console.log(
      "\x1b[33m%s\x1b[0m",
      `Node ${nodes[nodes?.length - 1]?.no} connected.`
    );

    socket.on("message", async () => {
      // conforming that whether the number of nodes is equal to the number of types or not
      if (types?.length === nodes?.length) {
        await delay(1000);
        console.log(); // printing a new line
        let task = "";

        for (let idx = 0; idx < words?.length; idx++) {
          // checking whether there is a contiguous same-type word or not like, a1 a2
          if (task?.length >= 2) task += ` ${words[idx]}`;
          else task += words[idx];

          if (words[idx + 1] && task[0] === words[idx + 1][0]) continue;

          const type = words[idx][0];
          // finding the targeted node
          const node = nodes.find((node) => node?.type === type);

          if (node) {
            // sending a task to a targeted node to complete
            io.to(node?.id).emit("message", task);
            await delay(1000);
            console.log("Executed:", task, ` by Node ${node?.no}`);
            task = "";
          } else {
            task = "";
            await delay(1000);
            console.log(`'${type}' type Node disconnected.`);
          }
        }

        console.log(); // printing a new line

        // disconnecting all the nodes
        disconnectingNodes(nodes?.length, nodes);

        // deleting the file that used to store the user input
        deleteInputFile();

        console.log("Completed the task.");

        // stopping the main node
        server.close(async () => {
          await delay(1000);
          console.log("Main node stopped.");
          process.exit(0);
        });
      }
    });

    // Handle a node on disconnecting
    socket.on("disconnect", () => {
      const index = nodes.findIndex((node) => node?.id === socket.id);
      if (index !== -1) {
        const nodeNumber = nodes[index]?.no;
        nodes.splice(index, 1);
        console.log("\x1b[33m%s\x1b[0m", `Node ${nodeNumber} disconnected.`);
      }
    });
  });
};

main();
