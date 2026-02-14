const socketIo = require('socket.io');

// الماب سيبقى داخلياً فقط لتوجيه الرسائل الخاصة
const onlineUsers = new Map(); // key: userId, value: socketId

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: ["http://localhost:3000", "https://edchatflow.vercel.app"],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        }
    });

    io.on('connection', (socket) => {
        let currentUserId = null;

        // الربط الداخلي فقط لتوجيه الرسائل
        socket.on("c_user", (userId) => {
            currentUserId = userId;
            onlineUsers.set(userId, socket.id);
        });

        // توجيه الرسائل الخاصة
        socket.on("send_msg", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", data);
            }
        });

        socket.on("del_msg", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("deletedMessage", data.messageId);
            }
        });

        socket.on("upd_msg", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("updatedMessage", data);
            }
        });

        socket.on("clear_chat", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("chat_cleared", { from: data.from });
            }
        });

        socket.on("typing", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("user_typing", { from: data.from });
            }
        });

        socket.on("stop_typing", (data) => {
            const receiverSocketId = onlineUsers.get(data.to?._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("user_stop_typing", { from: data.from });
            }
        });

        socket.on('disconnect', () => {
            if (currentUserId) {
                onlineUsers.delete(currentUserId);
            }
        });
    });

    return io;
};

module.exports = initializeSocket;
