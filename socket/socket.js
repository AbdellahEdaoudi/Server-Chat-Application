const socketIo = require('socket.io');
const User = require('../models/User');

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
    const existingUser = onlineUsers.find((user) => user.userId === userId);
    if (existingUser) {
        existingUser.socketId = socketId;
    } else {
        onlineUsers.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: ["http://localhost:3000", "https://edchatflow.vercel.app"],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
    });

    io.on('connection', (socket) => {
        // console.log(`A user connected with id: ${socket.id}`);

        // Add User
        socket.on("c_user", async (userId) => {
            addNewUser(userId, socket.id);
            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
            } catch (err) {
                console.error("Error updating user online status:", err);
            }
            io.emit("getOnlineUsers", onlineUsers);
        });

        // Send Message
        socket.on("send_msg", (data) => {
            const receiver = getUser(data.to._id);
            if (receiver) {
                io.to(receiver.socketId).emit("receiveMessage", data);
            }
        });

        // Delete Message
        socket.on("del_msg", (data) => {
            const receiver = getUser(data.to?._id);
            if (receiver) {
                io.to(receiver.socketId).emit("deletedMessage", data.messageId);
            }
        });

        // Update Message
        socket.on("upd_msg", (data) => {
            const receiver = getUser(data.to?._id);
            if (receiver) {
                io.to(receiver.socketId).emit("updatedMessage", data);
            }
        });

        // Clear Chat
        socket.on("clear_chat", (data) => {
            const receiver = getUser(data.to?._id);
            if (receiver) {
                io.to(receiver.socketId).emit("chat_cleared", { from: data.from });
            }
        });

        // Typing Status
        socket.on("typing", (data) => {
            const receiver = getUser(data.to?._id);
            if (receiver) {
                io.to(receiver.socketId).emit("user_typing", { from: data.from });
            }
        });

        socket.on("stop_typing", (data) => {
            const receiver = getUser(data.to?._id);
            if (receiver) {
                io.to(receiver.socketId).emit("user_stop_typing", { from: data.from });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            const user = onlineUsers.find((user) => user.socketId === socket.id);
            if (user) {
                try {
                    await User.findByIdAndUpdate(user.userId, { isOnline: false });
                } catch (err) {
                    console.error("Error updating user offline status:", err);
                }
            }
            removeUser(socket.id);
            io.emit("getOnlineUsers", onlineUsers);
            // console.log('A user disconnected');
        });
    });

    return io;
};

module.exports = initializeSocket;
