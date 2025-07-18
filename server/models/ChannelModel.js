import mongoose from "mongoose";

const channelShema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    members:[{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    }],
    admin:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },
    messages:[{
        type: mongoose.Schema.ObjectId,
        ref:'Messages',
        required:false,
    }],
    createdAt:{
        type: Date,
        default:Date.now(),   
    },
    updatedAt:{
        type: Date,
        default:Date.now(),   
    },
});

channelShema.pre('save',function(next){
    this.updatedAt = Date.now();
    next();
});

channelShema.pre('findOneAndUpdate',function(next){
    this.set({updatedAt:Date.now()});
    next();
});

const Channel = mongoose.model('Channels',channelShema);
export default Channel;