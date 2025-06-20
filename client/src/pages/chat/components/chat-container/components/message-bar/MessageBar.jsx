import { useSocket } from '@/context/Socketcontext'
import { apiClient } from '@/lib/apiClient'
import { useAppStore } from '@/store'
import { UPLOAD_FILE_ROUTES } from '@/utils/constants'
import EmojiPicker from 'emoji-picker-react'
import React,{useRef, useState,useEffect} from 'react'
import {GrAttachment} from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import {RiEmojiStickerLine} from 'react-icons/ri'

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();
  const {selectedChatType,selectedChatData,userInfo,setisUploading,setfileUploadProgress} = useAppStore();
  const [message, setmessage] = useState('');
  const [emojipickeropen, setemojipickeropen] = useState('');

  useEffect(() => {
    function handleClickOutside (event){
      if(emojiRef.current && !emojiRef.current.contains(event.target)){
        setemojipickeropen(false)
      }
    }
    document.addEventListener('mousedown',handleClickOutside)
    return ()=>{
      document.addEventListener('mousedown',handleClickOutside)
    }
  }, [emojiRef])
  

  const handleAddEmoji = (emoji) => {
    setmessage((msg) => msg+ emoji.emoji)
  }

  const handleSendMessage = async () => {
    if(selectedChatType==='contact' && socket){
      socket.emit('sendMessage',{
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: 'text',
        fileurl: undefined,
      });
    }else if(selectedChatType === 'channel'){
      socket.emit('send-channel-message',{
        sender: userInfo.id,
        content: message,
        messageType: 'text',
        fileurl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setmessage('');
  }

  const handleAttachmentClick = () =>{
    if(fileInputRef.current){
      fileInputRef.current.click();
    }
  };
  const handleAttachmentChange = async (event) =>{
    try {
      const file = event.target.files[0];
      if(file){
        const formData = new FormData();
        formData.append('file', file);
        setisUploading(true);
        const responce = await apiClient.post(UPLOAD_FILE_ROUTES,
          formData,{
            withCredentials:true,
            headers: {
                      'Content-Type': 'multipart/form-data',  
            }, 
            onUploadProgress:(data)=>{
              setfileUploadProgress(Math.round((100*data.loaded)/data.total));
            }
          })
        
        if(responce.status === 200 && responce.data){
          setisUploading(false);
          if(selectedChatType === 'contact'){
          socket.emit('sendMessage',{
            sender: userInfo.id,
            content: undefined,
            recipient: selectedChatData._id,
            messageType: 'file',
            fileurl: responce.data.filePath,
          });
          }else if(selectedChatType === 'channel'){
            socket.emit('send-channel-message',{
            sender: userInfo.id,
            content: undefined,
            messageType: 'file',
            fileurl: responce.data.filePath,
            channelId: selectedChatData._id,
          });
          }
        }
      
      }
      console.log({file});
      
    } catch (error) {
      setisUploading(false);
      console.log({error});
      
    }
  }

  return (
    <div className='h-[10vh] bg-[#1c1d25] flex items-center justify-center px-8 mb-6 md:mr-10 lg:mr-20 xl:mr-40 sm:mr-5 gap-6' >
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5 w-[50vw]">
        <input type='text' 
        className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
        placeholder='Enter Message'
        value={message}
        onChange={(e)=>setmessage(e.target.value)}
        />
        <button className='text-neutral-500 focus:border-none 
        focus:outline-none focus:text-white duration-300 transition-all'
        onClick={handleAttachmentClick}
        >
          <GrAttachment className='text-2xl'/>
        </button>
        <input type='file' className='hidden' ref={fileInputRef} onChange={handleAttachmentChange}/>
        <div className='relative '>
        <button className='text-neutral-500 focus:border-none
        focus:outline-none focus:text-white duration-300 transition-all'
        onClick={()=>setemojipickeropen(true)}
        >
          <RiEmojiStickerLine className='text-2xl'/>
        </button>
        <div className='absolute bottom-16 right-0' ref={emojiRef}>
          <EmojiPicker
          theme='dark'
          open={emojipickeropen}
          onEmojiClick={handleAddEmoji}
          autoFocusSearch={false}
          />
        </div>
        </div>
      </div>
      <button className='bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none 
        focus:outline-none focus:text-white duration-300 transition-all'
        onClick={handleSendMessage}
        >
          <IoSend className='text-2xl'/>
      </button>
    </div>
  )
}

export default MessageBar