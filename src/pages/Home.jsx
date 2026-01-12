import React,{useState} from 'react'
import HomePage from '../components/Home/home'
export default function Home() {
  return (
    <HomePage/>
  )
}
export const LeadsContext=React.createContext();
export const LeadsContextProvider=({children})=>{
   const [leads,setLeads]=useState([])
   return(
    <LeadsContext.Provider value={{leads,setLeads}}>
    {children}
    </LeadsContext.Provider>
   )
}