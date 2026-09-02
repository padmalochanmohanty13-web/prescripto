import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContex';
import Navbar from './componets/Navbar';
import Sidebar from './componets/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorList from './pages/Admin/DoctorList';
import { DoctorContext } from './context/DoctorContex';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  return aToken || dToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to={aToken ? "/admin-dashboard" : "/doctor-dashboard"} replace />}></Route>
          <Route path="/admin-dashboard" element={<Dashboard />}></Route>
          <Route path="/all-appointments" element={<AllAppointments />}></Route>
          <Route path="/add-doctor" element={<AddDoctor />}></Route>
          <Route path="/doctor-list" element={<DoctorList />}></Route>

          {/* Doctor Route */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />}></Route>
          <Route path="/doctor-appointment" element={<DoctorAppointment />}></Route>
          <Route path='/doctor-profile' element={<DoctorProfile/>}></Route>

        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
}

export default App