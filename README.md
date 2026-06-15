# 🏥 Hospital Appointment System

A full-stack Server-Side Rendered (SSR) web application built with **Node.js + Express + EJS + PostgreSQL** for managing hospital appointments.

## 📋 Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Group Members](#group-members)
- [License](#license)

## ✨ Features

### Patient Features
- Register account with detailed profile
- Login/Logout with session management
- Forgot/Reset Password
- View and update profile
- Search doctors by name/specialization
- Book appointments with preferred doctors
- View appointment history
- Cancel pending appointments
- Receive appointment status updates

### Doctor Features
- Login/Logout
- View and update profile
- View all appointments
- Approve/Reject appointments
- Mark appointments as completed
- View patient information

### Admin Features
- Login/Logout
- Dashboard with analytics
- Manage doctors (Add, Edit, Delete)
- Manage patients (View, Edit, Delete)
- Manage all appointments
- Filter appointments by status, doctor, patient
- Generate reports (via dashboard stats)

## 🛠 Technologies

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Embedded JavaScript), Tailwind CSS
- **Database**: PostgreSQL
- **Security**: Helmet, express-rate-limit, bcrypt, express-validator, express-session
- **Other**: connect-flash, connect-pg-simple (session store)

## 🚀 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd hospital-appointment-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
 .env
```
Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_password
SESSION_SECRET=your_super_secret_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Step 4: Initialize Database
```bash
npm run init-db
```

### Step 5: Start the Server

npm run dev


The application will be available at `http://localhost:5000`

### Default Admin Credentials
- **Email**: admin@hospital.com
- **Password**: admin123


## 🗄 Database Setup

The database schema includes:
- `users` - Authentication and role management
- `patients` - Patient profiles
- `doctors` - Doctor profiles
- `appointments` - Appointment records
- `password_resets` - Password reset tokens
- `user_sessions` - Session storage (auto-created)

## 📁 Project Structure

```
hospital-appointment-system/
├── app.js                    # Main application entry
├── package.json
├── .env
├── .gitignore
├── README.md
├── SECURITY.md               # Security documentation
│
├── config/
│   └── db.js                 # Database configuration
│
├── controllers/
│   ├── authController.js     # Authentication (login, register, password reset)
│   ├── patientController.js  # Patient operations
│   ├── doctorController.js   # Doctor operations
│   ├── adminController.js    # Admin operations
│   └── mainController.js     # Public pages
│
├── middleware/
│   ├── security.js           # Security middleware (Helmet, rate limiting, validation)
│   ├── authMiddleware.js     # Authentication & authorization
│   └── logger.js             # Request logging & attack detection
│
├── models/
│   ├── UserModel.js          # User operations
│   ├── PatientModel.js       # Patient operations
│   ├── DoctorModel.js        # Doctor operations
│   ├── AppointmentModel.js   # Appointment operations
│   └── PasswordResetModel.js # Password reset operations
│
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── patientRoutes.js      # Patient routes
│   ├── doctorRoutes.js       # Doctor routes
│   ├── adminRoutes.js        # Admin routes
│   └── mainRoutes.js         # Public routes
│
├── views/                    # EJS templates
│   ├── partials/             # Reusable components (header, nav, sidebar, footer)
│   ├── auth/                 # Login, Register, Forgot/Reset Password
│   ├── patient/              # Dashboard, Profile, Search, Book, Appointments
│   ├── doctor/               # Dashboard, Profile, Appointments, Patient Info
│   ├── admin/                # Dashboard, Doctors, Patients, Appointments
│   ├── home.ejs              # Homepage
│   ├── about.ejs             # About page
│   ├── contact.ejs           # Contact page
│   └── error.ejs             # Error page
│
├── public/                   # Static assets (CSS, JS, images)
│
└── scripts/
    └── initDatabase.js       # Database initialization script
```

## Group Members

Name                                          ID

Kibruyesfa Misganaw                           072 
Nebyu Samuel                                  087
Tewobsta Alemayehu                            095
Wengelalwit Asres                             096
Yihune Yeshanew                               099

