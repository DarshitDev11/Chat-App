import mongoose from "mongoose";
const messageShema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:false,
    },
    messageType:{
        type: String,
        enum: ['text','file'],
        required: true,
    },
    content:{
        type: String,
        required: function(){
            return this.messageType === 'text';
        }
    },
    fileurl:{
        type:String,
        required:function (){
            return this.messageType === 'file';
        }
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
});

const Message = mongoose.model("Messages",messageShema);
export default Message;