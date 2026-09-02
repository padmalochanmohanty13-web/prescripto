import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import razorpay from "razorpay";

//Api to register user

const registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { name, email, password } = req.body;

    console.log(name, email, password);

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }
    // validating email format

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    //validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a strong password",
      });
    }

    // hashing user password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user  login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "user doesnot Exit" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credential" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// API to update profile

// const updateProfile = async (req, res) => {
//     console.log(req.file);
//     try {
//          const userId = req.userId;
//         const { name, phone, address, dob, gender } = req.body
//         const imageFile = req.file
//          console.log("BODY:", req.body);
//         if (!name || !phone || !address || !dob || !gender) {
//             return res.json({success:false, message:"Data is Missing"})
//         }

//         await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

//         if (imageFile) {

//             //  upload image to cloidinary
//             const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
//              const imageURL = imageUpload.secure_url

//             await userModel.findByIdAndUpdate(userId,{image:imageURL})
//         }

// res.json({
//   success: true,
//   message: "Profile updated",
//   userData: await userModel.findById(userId).select("-password"),
// });

//     } catch (error) {
//          console.log(error);
//          res.json({ success: false, message: error.message });
//     }
// }

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    let { name, phone, address, dob, gender } = req.body;

    console.log("BODY:", req.body);

    // ✅ SAFE PARSE
    let parsedAddress = {};
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
    } catch (err) {
      parsedAddress = {};
    }

    const updateData = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    // ✅ handle image
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    // const updatedUser = await userModel
    //   .findByIdAndUpdate(userId, updateData, { new: true })
    //   .select("-password");

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, {
        returnDocument: "after",
        runValidators: true,
      })
      .select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to Book appointmet with doctor

const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware (JWT token)
    const { docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData || !docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    let slots_booked = docData.slots_booked
      ? JSON.parse(JSON.stringify(docData.slots_booked))
      : {};

    //  checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");

    // Create a plain copy of docData without slots_booked for storing in appointment
    const docDataForAppointment = docData.toObject();
    delete docDataForAppointment.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docDataForAppointment,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    //  Save new slots_booked data in doctor document
    await doctorModel.findByIdAndUpdate(docId, { $set: { slots_booked } });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

// API toget user appointments for frontend my-appointment page

const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to  cancel the appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user

    if (appointmentData.userId !== userId) {
      return res.json({ success: true, message: "unauthorized access" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctors slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



//  API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: true, message: "Appointment cancelled" });
    }

    // creating option for razor pay payment

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log("ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};


//   API to verify payment of razorpay

const verifyRazorpay = async (req, res) => {
  try {
    console.log("VERIFY REQUEST BODY:", req.body);

    // const { razorpay_order_id } = req.body
    const { response } = req.body;
    const razorpay_order_id = response.razorpay_order_id;
    console.log("RAZORPAY ORDER ID:", razorpay_order_id);

     if (!razorpay_order_id) {
       return res.json({
         success: false,
         message: "Razorpay order ID is missing",
       });
     }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
    // console.log(orderInfo)

    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.json({success:true,message:'Payment Successful'})
      
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
     console.log("ERROR:", error);
     res.json({ success: false, message: error.message });
  }
}




export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay
};
