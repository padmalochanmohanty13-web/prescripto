# prescripto


# 🏥 Prescripto - Full Stack Doctor Appointment Booking System

Prescripto is a complete, full-stack healthcare web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) and styled with **Tailwind CSS**. It includes a User Patient portal, an Admin Panel, and a Doctor Dashboard Panel.

---

## 📁 Project Structure

```text
precripto/
├── 📂 backend/                  # Express.js REST API & MongoDB Backend
│   ├── 📂 config/              # MongoDB & Cloudinary configurations
│   ├── 📂 controllers/         # Business logic (admin, doctor, user)
│   ├── 📂 middlewares/         # Auth middlewares (JWT) & Multer (upload)
│   ├── 📂 models/              # Mongoose database schemas
│   ├── 📂 routes/              # Express API route endpoints
│   ├── 📄 .env.example         # Environment variables template
│   ├── 📄 package.json
│   └── 📄 server.js            # Server entry point
│
├── 📂 frontend/                 # Patient / User Portal (React + Vite)
│   ├── 📂 src/
│   │   ├── 📂 assets/          # Images, icons, doctor graphics
│   │   ├── 📂 components/      # Reusable UI components (Navbar, Header, Banner, etc.)
│   │   ├── 📂 context/         # React Context API state management
│   │   └── 📂 pages/           # Pages (Home, Doctors, Appointments, Login, Profile)
│   ├── 📄 index.html
│   ├── 📄 package.json
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
│
├── 📂 admin/                    # Admin & Doctor Management Panel (React + Vite)
│   ├── 📂 src/
│   │   ├── 📂 assets/          # Admin/Doctor panel icons and assets
│   │   ├── 📂 componets/       # Navbar, Sidebar components
│   │   ├── 📂 context/         # AdminContext & DoctorContext state management
│   │   └── 📂 pages/
│   │       ├── 📂 Admin/       # Admin views (Dashboard, Add Doctor, All Appointments, Doctor List)
│   │       ├── 📂 Doctor/      # Doctor views (Doctor Dashboard, Appointments, Profile)
│   │       └── 📄 Login.jsx    # Dual login for Admin & Doctor
│   ├── 📄 index.html
│   ├── 📄 package.json
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
│
├── 📄 .gitignore                # Git ignore configuration
└── 📄 README.md                 # Project documentation
