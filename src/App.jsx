import { ToastContainer } from "react-toastify"
import { BrowserRouter  } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"

import {LeadsContextProvider} from './pages/Home'
const App = () => {
  return (
    <BrowserRouter>
      <LeadsContextProvider>
      <AppRoutes />
      </LeadsContextProvider>
     
      <ToastContainer position="top-right" autoClose={1000} theme="colored" />
    </BrowserRouter>
  )
}

export default App