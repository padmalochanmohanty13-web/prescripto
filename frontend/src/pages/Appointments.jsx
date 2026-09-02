import React, { useContext, useEffect, useState } from "react";
// import { doctors } from '../assets/assets'
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import RelatedDoctor from "../components/RelatedDoctor";
import { toast } from "react-toastify";
import axios from "axios";

const Appointments = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendurl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // const fetchDocInfo = async () => {
  //   const docInfo = doctors.find(doc => doc._id === docId)
  //   setDocInfo(docInfo)
  // }

  const fetchDocInfo = async () => {
    try {
      const { data } = await axios.get(backendurl + "/api/doctor/" + docId);

      if (data.success) {
        setDocInfo(data.doctor);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load doctor");
    }
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);

    // getting current dates

    let today = new Date();
    for (let i = 0; i < 7; i++) {
      // geting date with index

      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // seting end time of datwe with index

      // let endTime = new Date()
      // endTime.setDate(today.getDate() + 1)
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      // seting hours

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10,
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
      let timeSlot = [];
      while (currentDate < endTime) {
        let formatedTimes = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formatedTimes

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true
        
        if (isSlotAvailable) {
          // add Time slots
          timeSlot.push({
            datetime: new Date(currentDate),
            time: formatedTimes,
          });
        }

        

        // Increement Current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots((prev) => [...prev, timeSlot]);
    }
  };

  // const bookAppointment = async () => {
  //   if (!token) {
  //     toast.warn("login to book appointment");
  //     return navigate("/login");
  //   }
  //   try {
  //     const date = docSlots[slotIndex][0].datetime;

  //     let day = date.getDate();
  //     let month = date.getMonth() + 1;
  //     let year = date.getFullYear();

  //     const slotDate = day + "_" + month + "_" + year;
  //     const user = JSON.parse(localStorage.getItem("user"));

  //     const { data } = await axios.post(
  //       backendurl + "/api/user/book-appointment",
  //       { userId: user._id, docId, slotDate, slotTime },
  //       { headers: { token } },
  //     );
  //     if (data.success) {
  //       toast.success(data.message);
  //       getDoctorsData();
  //       navigate("/my-appointments");
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message);
  //   }
  // };



const bookAppointment = async () => {
  if (!token) {
    toast.warn("Login to book appointment");
    return navigate("/login");
  }

  if (!docId) {
    toast.error("Doctor ID not found");
    return;
  }

  if (!slotTime) {
    toast.warn("Please select a time slot");
    return;
  }

  if (!docSlots.length || !docSlots[slotIndex]?.length) {
    toast.warn("Please select a date");
    return;
  }

  try {
    const date = docSlots[slotIndex][0].datetime;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const slotDate = `${day}_${month}_${year}`;

    console.log("BOOKING DATA:", {
      docId,
      slotDate,
      slotTime,
    });

    const { data } = await axios.post(
      backendurl + "/api/user/book-appointment",
      {
        docId,
        slotDate,
        slotTime,
      },
      {
        headers: {
          token: token,
        },
      },
    );

    console.log("BOOKING RESPONSE:", data);

    if (data.success) {
      toast.success(data.message);

      await getDoctorsData();
      await fetchDocInfo();  // re-fetch doctor to update slots_booked

      navigate("/my-appointments");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log("BOOK APPOINTMENT ERROR:", error);

    if (error.response) {
      toast.error(error.response.data?.message || "Failed to book appointment");
    } else {
      toast.error("Server connection failed");
    }
  }
};



  useEffect(() => {
    fetchDocInfo();
  }, [ docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {}, [docSlots]);

  return (
    docInfo && (
      <div>
        {/* -------- Doctors details ----------- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/*----------- Doctor Info Name, degree, experience-------- */}
            <p className=" flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>

            {/* ✅ NEW: ADD THIS (availability) */}
            <p
              className={`mt-2 font-medium ${
                docInfo.available ? "text-green-500" : "text-red-500"
              }`}
            >
              {docInfo.available ? "Available" : "Not Available"}
            </p>

            <div className="flex items-center gap-2 text-sm mt-1 text-gray-800">
              <p>
                {" "}
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              {/* --------About Doctor ------- */}
              <p className="flex items-center gap-1  text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className=" text-sm text-gray-500 max-w-[700] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>
        {/* ---------Booking Slots */}
        <div className=" sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>

          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={` text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? "bg-primary text-white" : "border border-gray-200"}`}
                  key={index}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? "bg-primary text-white " : "text-gray-400 border border-gray-300"}`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            // disabled={!docInfo.available}
            className=" bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
          >
            Book Appointment
          </button>
        </div>

        {/* ---------  listing Related doctors------- */}
        <RelatedDoctor docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointments;
