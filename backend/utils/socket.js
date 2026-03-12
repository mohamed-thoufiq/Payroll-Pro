import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // Your Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ userId, role, orgId }) => {
      if (userId) {
        // Personal Room
        socket.join(userId.toString());
        
        // If they are a Super Admin, join the Admin Broadcast room
        if (role === "Super Admin") {
          socket.join(`admin_${orgId}`);
          console.log(`Super Admin joined Admin Room for Org: ${orgId}`);
        }
      }
    });
 });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};