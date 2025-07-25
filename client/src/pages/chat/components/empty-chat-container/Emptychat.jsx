import { animationDefaultOption } from '@/lib/utils'
import Lottie from "lottie-react";
const EmptychatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col items-center justify-center hidden duration-100 transition-all">
        <Lottie
        loop={true}
        autoplay={true}
        style={{ height: 200, width: 200 }}
        options={animationDefaultOption}
        />
        <div className='text-opacity-80 text-white flex flex-col gap-5 
        items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center'>
            <h3 className='poppins-medium'>
                Hi<span className='text-purple-500'>! </span>Welcome to 
                <span className='text-purple-500'> Syncronus </span>Chat App
                <span className='text-purple-500'>.
                </span>
            </h3>
        </div>
    </div>
  )
}

export default EmptychatContainer