import { useAppStore } from '@/store'
import React from 'react'
import {RiCloseFill} from 'react-icons/ri'
import { getColor } from '@/lib/utils';
import { HOST } from '@/utils/constants';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';

const ChatHeader = () => {

  const {closeChat,selectedChatData,selectedChatType} = useAppStore();

  return (
    <div className='h-[12vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20'>
      <div className='flex gap-5 items-center justify-between'>
        <div className='flex gap-3 items-center'>
        <div className='w-12 h-12 relative '>
          {
            selectedChatType === 'contact' ?   (<Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                  {
                    selectedChatData.image ? (<AvatarImage 
                      src={`${HOST}/${selectedChatData.image}`}
                      alt='profile'
                      className='object-cover w-full h-full bg-black'
                    />):(
                      <div className={`upperacse h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(selectedChatData.color)}`}>
                        {selectedChatData.firstname ? selectedChatData.firstname.split('').shift(): selectedChatData.email.split('').shift()}
                      </div>
                    )
                  }
                </Avatar>) : ( <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full'>#</div>)
          }
              
              </div>
              <div>
                {
                  selectedChatType === 'channel' && selectedChatData.name
                }
                {selectedChatType === 'contact' && 
                selectedChatData.firstname ?
                `${selectedChatData.firstname}  ${selectedChatData.lastname}`: selectedChatData.email}
              </div>
        </div>
          <div className='flex items-center justify-center  gap-5 md:ml-100 lg:ml-135 sm:ml-70'>
            <button className='text-neutral-500 focus:border-1 
            focus:outline-none focus:text-white duration-300 transition-all'
            onClick={closeChat}
            >
              <RiCloseFill className='text-3xl'/>
            </button>
          </div>
      </div>
    </div>
  )
}

export default ChatHeader