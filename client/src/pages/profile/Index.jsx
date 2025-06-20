import React,{useState,useEffect, useRef}from 'react'
import { useAppStore } from '@/store'
import { useNavigate } from 'react-router-dom';
import {IoArrowBack} from 'react-icons/io5'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { colors, getColor } from '@/lib/utils';
import {FaPlus,FaTrash} from 'react-icons/fa'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTES } from '@/utils/constants';

const Profile = () => {
  const navigate = useNavigate()
  const {userInfo, setUserInfo} = useAppStore();
  const [firstname, setfirstName] = useState('')
  const [lastname, setlastname] = useState('')
  const [image, setimage] = useState(null)
  const [hovered, sethovered] = useState(false)
  const [selectedcolor, setselectedcolor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if(userInfo.profileSetup){
      setfirstName(userInfo.firstname);
      setlastname(userInfo.lastname);
      setselectedcolor(userInfo.color);
    }
    if (userInfo.image) {
      setimage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo])
  

  const validateProfile = () => {
    if (!firstname || firstname.trim() === '') {
        toast.error('First name is required');
        return false;
    }
    if (!lastname || lastname.trim() === '') {
        toast.error('Last name is required');
        return false;
    }
    return true;
  };

  const saveChanges = async ()=>{
    if(validateProfile()){
        const responce = await apiClient.post(UPDATE_PROFILE_ROUTES,
          {firstname, lastname, color: selectedcolor},
          {withCredentials:true});
        
        if (responce.status === 200 && responce.data && responce.data.email) {
          setUserInfo({ ...responce.data,image: responce.data.image ?? userInfo.image  });
          toast.success('Profile updated successfully.');
          navigate('/chat');
        }else {
          toast.error('Unexpected response data.');
        }
      }  
    }
  

    const handleNavigate = () => {
      navigate('/chat');
    }
  

  const handlefileInputClick =()=>{
    fileInputRef.current.click();
  }
  const handleimagechange = async (event)=>{
    const file = event.target.files[0];
    console.log({file});
    if(file){
      const formData = new FormData();
      formData.append('profile-image',file);

      const responce = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE,formData,{
        withCredentials: true,
      headers: {
      'Content-Type': 'multipart/form-data',  // Manually set the Content-Type
      }
      });

      if(responce.status === 200 && responce.data.image){
        setUserInfo({...userInfo, image:responce.data.image})
        toast.success('Image updates Successfully.')
      }
      // const reader = new FileReader();
      // reader.onload=()=>{
      //   setimage(reader.result)
      // }
      // reader.readAsDataURL(file)
    }
  };
  const handledeleteImage = async () =>{
    try {
      const responce = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE,{withCredentials:true})
      if(responce.status === 200){
        setUserInfo({...userInfo,image: null})
        toast.success('Image removed successfully.');
        setimage(null);
      }
    } catch (error) {
      console.log(error);
      
    }
  };

  return (
    <div className='bg-[#1B1c24] h-[100vh] flex items-center justify-center flex-col gap-10'>
      <div className='flex flex-col gap-10 w-[80vw] md:w-max'>
        <div onClick={handleNavigate}>
          <IoArrowBack className='text-4xl lg:text-6xl text-white/90 cursor-pointer'/>
        </div>
        <div className='grid grid-cols-2'>
          <div className='h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center'
            onMouseEnter={()=>sethovered(true)}
            onMouseLeave={()=>sethovered(false)}
          >
            <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'>
              {
                image ? (<AvatarImage 
                  src={image}
                  alt='profile'
                  className='object-cover w-full h-full bg-black'
                />):(
                  <div className={`upperacse h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedcolor)}`}>
                    {firstname ? firstname.split('').shift(): userInfo.email.split('').shift()}
                  </div>
                )
              }
            </Avatar>
            {
              hovered && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full'
                  onClick={image ? handledeleteImage : handlefileInputClick}
                >
                   {
                    image ? <FaTrash className='text-white text-3xl cursor-pointer'/> 
                    : <FaPlus className='text-white text-3xl cursor-pointer'/>
                   }
                </div>
              )
            }
            <input  type='file' 
            ref={fileInputRef} 
            className='hidden' 
            onChange={handleimagechange} 
            name='profile-image' 
            accept='.png, .jpg, .jepg, .svg, .webp'/>

          </div>
          <div className='flex min-w-32 md:min-w-32 flex-col gap-5 text-white items-center justify-center'>
            <div className='w-full'>
              <Input placeholder='email' type='email' readOnly value={userInfo.email} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
            </div>
            <div className='w-full'>
              <Input placeholder='First Name' type='text' value={firstname} onChange={(e)=>setfirstName(e.target.value)} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
            </div>
            <div className='w-full'>
              <Input placeholder='Last Name' type='text' value={lastname} onChange={(e)=>setlastname(e.target.value)} className='rounded-lg p-6 bg-[#2c2e3b] border-none'/>
            </div>
            <div className='w-full flex gap-5'>
              {
                colors.map((color,index)=> 
                <div 
                className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                ${selectedcolor===index ? 
                  'outline-white/100 outline-1':''}`} 
                key={index}
                onClick={()=>setselectedcolor(index)}
                ></div>)
              }
            </div>
          </div>
        </div>
        <div className='w-full'>
            <Button className='h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
            onClick={saveChanges}
            >
              Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default Profile;
export { Profile }