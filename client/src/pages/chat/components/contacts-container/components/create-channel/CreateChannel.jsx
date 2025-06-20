import React,{useState,useEffect} from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {FaPlus} from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/apiClient'
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from '@/utils/constants'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { MultipleSelector } from "@/components/ui/multiple-selector";



const CreateChannel = () => {
  const {setSelectedChatType,setSelectedChatData,addChannel} = useAppStore()
  const [newChannelModel, setnewChannelModel] = useState(false);
  const [allcontacts, setallcontacts] = useState([]);
  const [selectedContacts, setselectedContacts] = useState([]);
  const [channelName, setchannelName] = useState('');

  useEffect(() => {
    const getData = async ()=>{
        const responce = await apiClient.get(GET_ALL_CONTACTS_ROUTES,{
            withCredentials:true,
        });
        setallcontacts(responce.data.contacts);
    };
    getData();
  }, [])
  
  const createChannel = async ()=>{
    try {
      if(channelName.length>0 && selectedContacts.length>0){
        const responce = await apiClient.post(CREATE_CHANNEL_ROUTE,{
        name: channelName,
        members: selectedContacts.map((contact)=>contact.value),
      },{withCredentials:true});
      if(responce.status === 201){
        setchannelName('');
        setselectedContacts([]);
        setnewChannelModel(false);
        addChannel(responce.data.channel);
      }
      };
      
    } catch (error) {
      console.log({error});
      
    }
  };

  return (
    <div>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <FaPlus 
                className='text-neutral-400 font-light text-opacity-90 text-start 
                hover:text-neutral-100 cursor-pointer transition-all duration-300 mt-1'
                onClick={()=>setnewChannelModel(true)}
                />
            </TooltipTrigger>
                <TooltipContent 
                className='bg-[#1c1b1e] border-none mb-2 p-3 text-white'
                >
                    Create New Channel
                </TooltipContent>
        </Tooltip>
    </TooltipProvider>
    <Dialog open={newChannelModel} onOpenChange={setnewChannelModel}>
      <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col'>
        <DialogHeader>
            <DialogTitle>
              Please Fill Up The Details For New Channel.
            </DialogTitle>
          <DialogDescription>
        
          </DialogDescription>
        </DialogHeader>
      <div className=''>
        <Input 
        placeholder='Channel Name'
        className='rounded-lg p-6 bg-[#2c2e3b] border-none'
        onChange={(e)=>setchannelName(e.target.value)}
        value={channelName}
        />
      </div>
      <div>
        <MultipleSelector className='rounded-lg bg-[#2c2e3b] border-none py-2 text-white'
        defaultOptions={allcontacts}
        placeholder='Search Contacts'
        value={selectedContacts} 
        onChange={setselectedContacts}
        emptyIndicator={
            <p className='text-center text-lg leading-10 text-gray-600'>No Results Found.</p>
        }
        />
      </div>
      <div>
        <Button className='w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
        onClick={createChannel}
        >
            Create Channel
        </Button>
      </div>
      
      
    </DialogContent>
  </Dialog>
</div>
  )
}

export default CreateChannel;