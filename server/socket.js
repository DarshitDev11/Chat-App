import {Server as SocketIOServer} from 'socket.io'
import Message from './models/Messagesmodel.js';
import Channel from './models/ChannelModel.js';
import User from './models/Usermodel.js';

const setupSocket = (server)=>{
    const io = new SocketIOServer(server,{
        cors:{
            origin:process.env.ORIGIN,
            methods:['GET','POST'],
            credentials:true,
        }
    });
    const userSocketMap = new Map()

    const disconnect = (socket)=>{
        console.log(`Client disconnect:${socket.id}`);
        for(const [userId,socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
    }

    const sendMessage = async (message)=>{
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);
        
        const createMessage = await Message.create(message);

        const messageData = await Message.findById(createMessage._id)
        .populate('sender','id email firstname lastname image color')
        .populate('recipient','id email firstname lastname image color');

        if(recipientSocketId){
            io.to(recipientSocketId).emit('recieveMessage',messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit('recieveMessage',messageData);
        }
     };

    const sendChannelMesaage = async (message)=>{
        const {channelId, sender, content, messageType, fileurl} = message;
        const createdMessage = await Message.create({
            sender,
            recipient:null,
            content,
            messageType,
            timestamp:new Date(),
            fileurl,
        });

        const messageData = await Message.findById(createdMessage._id).populate(
            'sender','id email firstname lastname image color'
        ).exec();

        await Channel.findByIdAndUpdate(channelId,{
            $push:{messages:createdMessage._id}
        });
        const channel = await Channel.findById(channelId).populate('members');
        const finalData = {...messageData._doc,channelId:channel._id};
        if(channel && channel.members){
            channel.members.forEach((member)=>{
                const memberSocketId = userSocketMap.get(member._id.toString());
                if(memberSocketId){
                    io.to(memberSocketId).emit('recieve-channel-message',finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin._id.toString());
                if(adminSocketId){
                    io.to(adminSocketId).emit('recieve-channel-message',finalData);
                }
        }
    };

    io.on('connection',(socket)=>{
        const userId = socket.handshake.query.userId;
        if(userId){
            userSocketMap.set(userId,socket.id);
            console.log(`User connection: ${userId} with socket ID:${socket.id}`);
        } else {
            console.log("user ID not provided during connection.");
        }
        socket.on('sendMessage', sendMessage);
        socket.on('send-channel-message',sendChannelMesaage);
        socket.on('disconnect',()=>disconnect(socket))
    })
}
export default setupSocket;