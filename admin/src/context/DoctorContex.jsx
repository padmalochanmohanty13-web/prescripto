import axios from "axios";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : "",
  );

  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/appointment", {
        headers: { dToken },
      });

      if (data.success) {
          setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
    
    // complete mark for doctor appointment panel
    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })
            
            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message);
        }
    }

    // cancel the Appointment for doctor panel
    const cancelAppointment = async (appointmentId) => {
       try {
         const { data } = await axios.post(
           backendUrl + "/api/doctor/cancel-appointment",
           { appointmentId },
           { headers: { dToken } },
         );

         if (data.success) {
           toast.success(data.message);
           getAppointments();
           getDashData();
         } else {
           toast.error(data.message);
         }
       } catch (error) {
         console.log(error.message);
         toast.error(error.message);
       }
    };
  
  // get dash board profile data

  const getProfileData = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
    
    if (data.success) {
      setProfileData(data.profileData)
      console.log(data.profileData)
    }
  } catch (error) {
     console.log(error.message);
     toast.error(error.message);
  }
}

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,profileData,setProfileData,getProfileData
  };
  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
