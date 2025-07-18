import Channel from '../models/ChannelModel.js';
import User from '../models/Usermodel.js'
import mongoose from 'mongoose';

export const createChannel = async (req,res)=>{
    try {
        const {name,members} = req.body;
        const userId = req.userId;

        const admin = await User.findById(userId);
        if(!admin){
            return res.status(400).send('Admin User not Found.');
        }

        const validMembers = await User.find({_id:{$in:members}});
        if(validMembers.length !== members.length){
            return res.status(400).send('Some Members Are Not Valid Users.')
        }
        const newChannel = new Channel({
            name,
            members,
            admin:userId,
        });
        await newChannel.save();
        return res.status(201).json({channel:newChannel});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const getUserChannels = async (req,res)=>{
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const channels = await Channel.find({
            $or:[{admin:userId},{members:userId}],
        }).sort({updatedAt:-1});

        return res.status(201).json({channels});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};

export const getChannelMessages = async (req,res)=>{
    try {
        const {channelId} = req.params;
        const channel = await Channel.findById(channelId).populate({
            path:'messages',populate:{
            path:'sender',
            select:'firstname lastname email _id image color'
        },
    });
    if(!channel){
        return res.status(404).send('Channel Not Found.')
    }
    
    const messages = channel.messages;
    return res.status(201).json({messages});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
};