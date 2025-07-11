import React, { useState,useEffect } from 'react'
import Auth from './pages/auth/Auth'
import { Chat } from './pages/chat/Index' 
import { Profile } from './pages/profile/Index'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store'
import { apiClient } from './lib/apiClient'
import { GET_USER_INFO } from './utils/constants'

const PrivateRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to='/auth'/>
}
const AuthRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to='/chat'/> : children;
}

const App = () => {
  // const {userInfo,setUserInfo} = useAppStore();
  const userInfo = useAppStore((state) => state.userInfo);
  const setUserInfo = useAppStore((state) => state.setUserInfo);
  const [loading, setLoading] = useState(true);
  console.log('userInfo:', userInfo, 'setUserInfo:', setUserInfo);
  // console.log('💥 store', useAppStore.getState());
  useEffect(() => {
    const getUserData = async ()=>{
      try {
        const responce = await apiClient.get(GET_USER_INFO, { withCredentials:true,
          headers: {
            'Content-Type': 'multipart/form-data',  
    }, 
         })
        if(responce.status === 200 && responce.data.id){
          setUserInfo(responce.data);
        }else{
          setUserInfo(undefined);
        }
      } catch (error) {
        setUserInfo(undefined);
      } finally{
        setLoading(false);
      }
    };
    if(!userInfo){
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo,setUserInfo]);

  if(loading){
    return <div className='text-white text-2xl font-bold'>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path='*' element={<Navigate to='/auth'/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App