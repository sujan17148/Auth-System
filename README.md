# Auth System

A production-ready authentication and user management system built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Prisma**, and **React**.

The project focuses on providing a secure, scalable, and modern authentication solution with support for traditional email/password login, OAuth providers, session management, and administrative user controls.

---

## ✨ Features

### 🔐 Authentication

- Email & Password Authentication
- Google OAuth Login
- GitHub OAuth Login
- JWT Access & Refresh Token Authentication
- Secure Refresh Token Rotation
- Protected Routes with Role-based Authorization

### 👤 User Management

- User Registration
- Email Verification
- Welcome Email
- Update Profile
- Change Password

### 🔑 Password Recovery

- Secure Password Reset via Email Link
- One-time Password Reset Tokens
- Automatic Session Revocation after Password Reset

### 📱 Session Management

- View Active Sessions
- Track Device Information
- IP Address Tracking
- Last Activity Tracking
- Logout Current Session
- Logout All Sessions

### 🛠️ Admin Features

- View All Users
- Ban / Unban Users
- View User Sessions
- Manage User Status

### 🛡️ Security

- Password Hashing using bcrypt
- JWT Authentication
- Refresh Token Rotation
- One-time Password Reset Links
- Session Revocation
- Role-based Access Control
- Request Validation using Zod

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- Nodemailer

### Frontend

- React
- TypeScript
- React Router
- React Hook Form
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Axios

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone <repository-url>
```

Open two terminal windows and navigate to the frontend and backend directories:

**Terminal 1**

```bash
cd client
npm install
npm run dev
```

**Terminal 2**

```bash
cd backend
npm install
```

Configure your environment variables using the provided `.env.sample` file.

Run the database migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```
