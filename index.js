import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import Connection from "./database/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
app.use(cors({
  origin: "https://chat-skoot.netlify.app"
}));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();
const PORT = process.env.PORT || 8000;
const URL = process.env.MONGO_URI;

// const expressServer = app.listen(PORT, () => {
//   console.log(`app is running successfully on port : ${PORT}`);
// });

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`server is running successfully on port ${PORT}`);
});

//intialise socket server
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chat-skoot.netlify.app",
  },
});

//socket related functions
io.on("connection", (socket) => {
  console.log("connected to socket.io with socket-id: ", socket.id);

  //leaving previous room
  socket.on("leave-room" ,(room) =>{
    socket.leave(room) ;
  })

  //joining a chat with chatId
  socket.on("join-Chat", (room) => {
    socket.join(room);
  });

  //messaging
  socket.on("new-message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users is not defined");
    socket.to(newMessageRecieved.chat._id).emit("message-recieved", newMessageRecieved) ;
  });

});

Connection(URL);

app.get("/", (req, res) => {
  res.send(`chat-app-server`);
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

// const user = {name:"sameep" ,id:"1"} ;
// app.get("/users" ,(req ,res) =>{
//     res.send(user) ;
// })
