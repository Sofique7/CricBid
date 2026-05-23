import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      autoConnect: false,
      transports: ["websocket"],
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
    });
  }

  return socket;
};