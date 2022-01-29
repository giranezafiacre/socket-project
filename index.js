const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Authorization ,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });
const io = require('socket.io')(server,{
    cors:{
        origin:["https://awesome-jennings-229f16.netlify.app","https://localhost:3000"]
    }, 
});
let users = [];

const addUser=(userId,socketId)=>{
    console.log("addusers",users)
    !users.some((user)=>user.userId===userId) && 
    users.push({userId, socketId});
}
const removeUser = (socketId) =>{
    
 users = users.filter((user) =>user.socketId !== socketId); 
 console.log("remained users:",users)
}
const getUserSocketId = (userId)=>{
    const user=users.filter(user=>user.userId === userId);
    console.log('receiver:',user[0])
return user[0].socketId;
}
io.on("connection", (socket) => {
    //connect
    console.log("a user connected")
    //take us  erId and sockeId from user
    socket.on("addUser",userId=>{
        let userID='';
        userID=userId;
       addUser(userID,socket.id);
      io.emit("getUsers",{'users':users});
    });

    //send and get messages
    socket.on("sendMessage",(data) => {
        // { _id,senderId, receiverId, text}
        let sendData={}
        let receiverId='';
        let socketId = '';
        sendData={
            '_id': data._id,
            'senderId': data.senderId, 
            'text': data.text,
        };
    
    receiverId=data.receiverId;
    socketId = getUserSocketId(receiverId);
    console.log('socketId',socketId)
    console.log('send data:',JSON.stringify(sendData));
    io.to(socketId).emit("getMessage",sendData); 
    });

    socket.on("disconnect",()=>{
        console.log("a user disconnected")
        removeUser(socket.id); 
        io.emit("getUsers",users);
    });
})
server.listen(process.env.PORT || 8900, 
    console.log("Backend server is running!")
  );