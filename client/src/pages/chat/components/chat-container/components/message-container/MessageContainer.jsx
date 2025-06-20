import { apiClient } from '@/lib/apiClient';
import { useAppStore } from '@/store'
import { GET_ALL_MESSAGES_ROUTES, GET_CHANNEL_MESSAGES, HOST } from '@/utils/constants';
import moment from 'moment';
import React, { useRef,useEffect } from 'react'
import {MdFolderZip} from 'react-icons/md'
import {IoMdArrowRoundDown} from 'react-icons/io'
import { IoCloseSharp } from 'react-icons/io5';
import { useState } from 'react';
import { getColor } from '@/lib/utils';
import { Avatar,AvatarFallback,AvatarImage } from '@/components/ui/avatar';

const MessageContainer = () => {
  const scrollRef = useRef();
  const {selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setisDownloading,
    setfileDownloadProgress} = useAppStore();

  const [showImage, setshowImage] = useState(false);
  const [imageURL, setimageURL] = useState(null);

  useEffect(()=>{
    const getMessages = async () =>{
      try {
        const responce = await apiClient.post(GET_ALL_MESSAGES_ROUTES,
          {id:selectedChatData._id},{withCredentials:true}
        );
        if(responce.data.messages){
          setSelectedChatMessages(responce.data.messages);
        }
      } catch (error) {
        console.log(error);
        
      }
    }
    const getChannelMessages = async ()=>{
      try {
        const responce = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          {withCredentials:true}
        );
        if(responce.data.messages){
          setSelectedChatMessages(responce.data.messages);
        }
      } catch (error) {
        console.log(error);
        
      }
    }
    if(selectedChatData._id){
      if(selectedChatType === 'contact') getMessages();
      else if(selectedChatType==='channel') getChannelMessages();
    }
  },[selectedChatData,selectedChatType,setSelectedChatMessages]);

  useEffect(() => {
    if(scrollRef.current){
      scrollRef.current.scrollIntoView({behavior:'smooth'});
    }
  }, [selectedChatMessages])

  const checkIfImage = (filePath)=>{
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  }
  
  const renderMessages = ()=>{
    let lastDate = null;
    return selectedChatMessages.map((message,index)=>{
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (<div className='text-center text-gray-500 my-2'>
            {moment(message.timestamp).format('LL')}
          </div>)}
          {
            selectedChatType === 'contact' && renderDMMessages(message)
          }
          {
            selectedChatType === 'channel' && renderChannelMessages(message)
          }
        </div>
      )
    })
  };

  const downloadFile = async (url) =>{
    setisDownloading(true);
    setfileDownloadProgress(0);
    const responce = await apiClient.get(`${HOST}/${url}`,{
      responseType:'blob',
      // withCredentials:true,
      onDownloadProgress:(progressEvent)=>{
        const {loaded,total} = progressEvent;
        const percentCompleted = Math.round((loaded*100)/total);
        setfileDownloadProgress(percentCompleted);
      }
    });
    const urlBlob = window.URL.createObjectURL(new Blob([responce.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download',url.split('/').pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setisDownloading(false);
    setfileDownloadProgress(0);
  }
  const renderDMMessages = (message)=> (
  <div className={`${message.sender === selectedChatData._id 
  ? 'text-left' : 'text-right'}`}>
    {
      message.messageType === 'text' && (
        <div 
          className={`${message.sender !== selectedChatData._id 
          ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50'
          :'bg-[#2a2b33]/5 text-white/80  border-[#ffffff]/20'}
          border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {message.content} 
        </div>
      )
    }
    {
      message.messageType==='file' && (
        <div 
          className={`${message.sender !== selectedChatData._id 
          ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50'
          :'bg-[#2a2b33]/5 text-white/80  border-[#ffffff]/20'}
          border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {checkIfImage(message.fileurl) 
            ? <div className='cursor-pointer'
            onClick={()=>{
              setshowImage(true);
              setimageURL(message.fileurl);
            }}
            >
              <img src={`${HOST}/${message.fileurl}`} 
              height={300} width={300}/>
            </div>
            :<div className='flex items-center justify-center gap-4'>
              <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
              <MdFolderZip />
              </span>
              <span>{message.fileurl.split('/').pop()}</span>
              <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
              onClick={()=>downloadFile(message.fileurl)}
              >
                <IoMdArrowRoundDown />
                </span>
              </div>} 
        </div>
      )
    }
    <div className='text-xs text-gray-600'>
      {moment(message.timestamp).format('LT')}
    </div>
    </div>
  )

  const renderChannelMessages = (message) =>{
    return (
      <div className={`mt-5 ${message.sender._id !== userInfo.id ?
        'text-left' : 'text-right'
      }`}>
        {
      message.messageType === 'text' && (
        <div 
          className={`${message.sender._id === userInfo.id 
          ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50'
          :'bg-[#2a2b33]/5 text-white/80  border-[#ffffff]/20'}
          border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}>
            {message.content} 
        </div>
      )
    }
    {
      message.messageType==='file' && (
        <div 
          className={`${message.sender._id === userInfo.id 
          ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50'
          :'bg-[#2a2b33]/5 text-white/80  border-[#ffffff]/20'}
          border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {checkIfImage(message.fileurl) 
            ? <div className='cursor-pointer'
            onClick={()=>{
              setshowImage(true);
              setimageURL(message.fileurl);
            }}
            >
              <img src={`${HOST}/${message.fileurl}`} 
              height={300} width={300}/>
            </div>
            :<div className='flex items-center justify-center gap-4'>
              <span className='text-white/8 text-3xl bg-black/20 rounded-full p-3'>
              <MdFolderZip />
              </span>
              <span>{message.fileurl.split('/').pop()}</span>
              <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
              onClick={()=>downloadFile(message.fileurl)}
              >
                <IoMdArrowRoundDown />
                </span>
              </div>} 
        </div>
      )
    }
    {
      message.sender._id !== userInfo.id ? (<div className='flex items-center gap-3'>
        <Avatar className='h-8 w-8 rounded-full overflow-hidden'>
                  {
                    message.sender.image ? (<AvatarImage 
                      src={`${HOST}/${message.sender.image}`}
                      alt='profile'
                      className='object-cover w-full h-full bg-black'
                    />):(
                      <AvatarFallback className={`upperacse h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(message.sender.color)}`}>
                        {message.sender.firstname 
                        ?  message.sender.firstname.split('').shift()
                        : message.sender.email.split('').shift()}
                      </AvatarFallback>
                    )}
                </Avatar>
                <span className='text-sm text-white/60'>{`${message.sender.firstname} ${message.sender.lastname}`}</span>
                <span className='tetx-xs text-white/60'>
                {moment(message.timestamp).format('LT')}</span>
      </div>) : ( 
        <div className='tetx-xs text-white/60 mt-1'>
                {moment(message.timestamp).format('LT')}</div>
      )
    }
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:-[50vw] xl:w-[60vw] w-full '>
      {renderMessages()}
      <div ref={scrollRef}/>
      {
        showImage && <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col'>
          <div>
            <img src={`${HOST}/${imageURL}`} 
            className='h-[70vh] w-full bg-cover'
            />
          </div>
          <div className='flex gap-5 fixed top-0 mt-5'>
            <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
            onClick={()=>downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown/>
            </button>
            <button className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
            onClick={()=>{
              setshowImage(false);
              setimageURL(null);
            }}
            >
              <IoCloseSharp/>
            </button>
          </div>
        </div>
      }
    </div>
  )
}

export default MessageContainer