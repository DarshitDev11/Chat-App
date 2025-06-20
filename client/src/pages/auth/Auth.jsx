
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../../assets/login2.png'
import Victory from '../../assets/victory.svg'
import { TabsContent, TabsTrigger, Tabs, TabsList} from '@radix-ui/react-tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { toast} from 'sonner'
import { LOGIN_ROUTES, SIGNUP_ROUTES } from '@/utils/constants'
import {apiClient} from '@/lib/apiClient'
import { useAppStore } from '@/store'


const Auth = () => {
    const naviagate = useNavigate()
    const {setUserInfo} = useAppStore()
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirmpassword, setconfirmpassword] = useState('')

    const validateSignup = () =>{
        if(!email.length){
            toast.error('Email is required');
            return false;
        }
        if(!password.length){
            toast.error('Password is required');
            return false;
        }
        if(confirmpassword !== password){
            toast.error('Password do not match or are empty');
            return false;
        }
        return true;
    }
    const validateLogin = () => {
        if (!email || email.trim() === '') {
            toast.error('Email is required');
            return false;
        }
        if (!password || password.trim() === '') {
            toast.error('Password is required');
            return false;
        }
        return true;
    };
    

    const handelLogin = async () => {
        if(validateLogin()){
            try {
                console.log('Sending data:', { email, password });
                const responce = await apiClient.post(LOGIN_ROUTES, { email, password }, { withCredentials: true });
                console.log({ responce });
                if (responce.data.user.id) {
                    setUserInfo(responce.data.user);
                    if (responce.data.user.profileSetup) naviagate('/chat');
                    else naviagate('/profile');
                }
            } catch (error) {
                console.error('Login Error:', error); 
                toast.error('Failed to log in.');
            }
        }
    }
    const handelSignup = async () => {
        if(validateSignup()){
            const responce = await apiClient.post(SIGNUP_ROUTES, {email, password},{withCredentials: true});
            console.log({responce});
            if(responce.status === 201){
                setUserInfo(responce.data.user);
                naviagate('/profile')
            }
        }
    }
  return (
    <div className='h-[100vh] w-[100vw] flex items-center justify-center'>
        <div className='h-[90vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw]
        md:w-[90vw] lg:w-[70vw] xl:[60vw] rounded-3xl grid xl:grid-cols-2'>
            <div className='flex flex-col items-center gap-10 justify-center'>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex items-center justify-center'>
                        <h1 className='font-bold text-5xl md:text-6xl'>Welcome</h1>
                        <img src={Victory} alt='victory emoji' className='h-[100px]'></img>
                    </div>
                    <p className='font-medium text-center'>Fill in the details to get started with the best chat app!
                    </p>
                </div>
                <div className='flex items-center justify-center w-full'>
                    <Tabs className='w-3/4' defaultValue='login'>
                        <TabsList className='bg-transparent rounded-none w-full flex flex-row justify-center'>
                            <TabsTrigger value='login'
                            className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full
                             data-[state=active]:text-black 
                             data-[state=active]:font-semibold
                             data-[state=active]:border-b-purple-500
                             p-3 transition-all duration-300'>Login</TabsTrigger>  
                            <TabsTrigger value='signup'
                            className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full
                            data-[state=active]:text-black 
                            data-[state=active]:font-semibold
                            data-[state=active]:border-b-purple-500
                            p-3 transition-all duration-300'>Signup</TabsTrigger>
                        </TabsList>
                            <TabsContent className='flex flex-col gap-5 mt-10' value='login'>
                                <Input placeholder='Email' 
                                type='email' 
                                className='rounded-full p-6' 
                                value={email} 
                                onChange={e=>setemail(e.target.value)}
                                />
                                <Input placeholder='Password' 
                                type='password' 
                                className='rounded-full p-6' 
                                value={password} 
                                onChange={e=>setpassword(e.target.value)}
                                />
                                <Button className='rounded-full p-6' onClick={handelLogin}>Login</Button>
                            </TabsContent>

                            <TabsContent className='flex flex-col gap-5 mt-10' value='signup'>
                                <Input placeholder='Email' 
                                    type='email' 
                                    className='rounded-full p-6' 
                                    value={email} 
                                    onChange={e=>setemail(e.target.value)}
                                    />
                                <Input placeholder='Password' 
                                    type='password' 
                                    className='rounded-full p-6' 
                                    value={password} 
                                    onChange={e=>setpassword(e.target.value)}
                                    />
                                <Input placeholder='Confirm Password' 
                                    type='password' 
                                    className='rounded-full p-6' 
                                    value={confirmpassword} 
                                    onChange={e=>setconfirmpassword(e.target.value)}
                                    />
                                    <Button className='rounded-full p-6' onClick={handelSignup}>Signup</Button>
                            </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div className='hidden xl:flex items-center justify-center'>
                <img src={Background} alt='Background login' className='h-[550px]' ></img>
            </div>
        </div>
    </div>
  )
}

export default Auth;