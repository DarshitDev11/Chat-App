import { useAppStore } from '@/store';
import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ChatContainer from './components/chat-container/Chat';
import ContactContainer from './components/contacts-container/Contact';
import EmptychatContainer from './components/empty-chat-container/Emptychat';

const Chat = () => {
  const {userInfo,selectedChatType, isUploading,
    isDownloading,
    fileUploadingProgress,
    fileDownloadingProgress}= useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if(!userInfo.profileSetup){
      toast('please set profile');
      navigate('/profile')
    }
  }, [userInfo,navigate])
  
  return (
    <div className='flex h-[100vh] text-white overflow-hidden'>
      {
        isUploading && (<div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex flex-col items-center justify-center gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'>Uploading File</h5>
          {fileUploadingProgress}%
        </div>)
      }
      {
        isDownloading && (<div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex flex-col items-center justify-center gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'>Downloading File</h5>
          {fileDownloadingProgress}%
        </div>)
      }
      <ContactContainer/>
      {
        selectedChatType === undefined 
        ? (<EmptychatContainer/>) :(<ChatContainer/>)
      }
    </div>
  )
}

export default Chat;
export { Chat }