import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// Listening messages from the main node
socket.on("message", (msg) => {
  console.log("Executed:", msg);
});

socket.emit("message", null);

// Sending a message to the main node
