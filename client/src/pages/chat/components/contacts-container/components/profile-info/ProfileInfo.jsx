import { useAppStore } from '@/store'
import { HOST, LOGOUT_ROUTES } from '@/utils/constants';
import React from 'react'
import { FiEdit2 } from 'react-icons/fi';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { IoPowerSharp} from 'react-icons/io5'
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip'
import { useNavigate } from 'react-router-dom';
import { getColor } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

const ProfileInfo = () => {
    const {userInfo,setUserInfo} = useAppStore();
    const navigate = useNavigate();
    const logOut = async () => {
        try {
            const responce = await apiClient.post(LOGOUT_ROUTES,{},{withCredentials:true})
            if(responce.status === 200){
                navigate('/auth');
                setUserInfo(null);
            }
        } catch (error) {
            
        }
    }
  return (
    <div className='absolute bottom-0 flex items-center 
    justify-center py-5 w-full bg-[#2a2b33] px-4'>
        <div className='flex items-center justify-center gap-3'>
            <div className='w-12 h-12 relative '>
            <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
              {
                userInfo.image ? (<AvatarImage 
                  src={`${HOST}/${userInfo.image}`}
                  alt='profile'
                  className='object-cover w-full h-full bg-black'
                />):(
                  <div className={`upperacse h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo.color)}`}>
                    {userInfo.firstname ? userInfo.firstname.split('').shift(): userInfo.email.split('').shift()}
                  </div>
                )
              }
            </Avatar>
            </div>
            <div>
                {
                    userInfo.firstname && userInfo.lastname ? `${userInfo.firstname} ${userInfo.lastname}`:''
                }
            </div>
        </div>
        <div className='flex ml-12'>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FiEdit2 className='text-purple-500 text-xl font-medium'
                    onClick={()=>navigate('/profile')}
                    />
                </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit Profile</p>
                    </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <IoPowerSharp className='text-red-500 text-xl font-medium ml-3'
                    onClick={logOut}
                    />
                </TooltipTrigger>
                    <TooltipContent>
                        Logout
                    </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        </div>
    </div>
  )
}

export default ProfileInfo