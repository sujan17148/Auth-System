# Auth System

A production-oriented authentication and user management system built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Prisma**, **Redis**, and **React**.

The project focuses on building a secure and scalable authentication system with traditional email/password authentication, OAuth, JWT-based authentication, session management, email verification, password recovery, and administrative user controls.

The application is fully containerized with **Docker Compose** and includes a production setup with **Nginx**.

---

## ✨ Features

### 🔐 Authentication

* Email & Password Authentication
* Google OAuth Login
* GitHub OAuth Login
* JWT Access & Refresh Token Authentication
* Secure Refresh Token Rotation
* Protected Routes
* Role-based Authorization

### 👤 User Management

* User Registration
* Email Verification via OTP
* Welcome Email
* Update Profile
* Change Password
* Account Activation / Deactivation

### 🔑 Password Recovery

* Password Reset via Email Link
* Cryptographically Secure Reset Tokens
* One-time Password Reset Tokens
* Automatic Session Revocation after Password Reset
* Redis-based Token Storage with TTL

### 📱 Session Management

* View Active Sessions
* Track Device Information
* IP Address Tracking
* Last Activity Tracking
* Logout Current Session
* Logout All Sessions
* Refresh Token Rotation
* Session Revocation

### 🛠️ Admin Features

* View All Users
* Ban / Unban Users
* View User Sessions
* Manage User Status
* Role-based Administrative Access

### ⚡ Redis

Redis is used for temporary and fast-access application state:

* Email Verification OTP Storage
* OTP Attempt Tracking
* Password Reset Token Storage
* Automatic Expiration using TTL
* Secure Token Hash Storage
* Redis Hashes and Atomic Counters

### 🐳 Docker

The application is containerized using Docker Compose.

Development and production configurations are provided separately.

Services include:

* Backend
* Frontend
* PostgreSQL
* Redis
* Nginx (production)

### 🛡️ Security

* Password Hashing using bcrypt
* JWT Authentication
* Refresh Token Rotation
* Cryptographically Secure Token Generation
* Hashed Password Reset Tokens
* One-time Password Reset Links
* Session Revocation
* Role-based Access Control
* Request Validation using Zod
* Redis TTL for Temporary Authentication Data

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma ORM
* Redis
* ioredis
* JWT
* bcrypt
* Zod
* Nodemailer

### Frontend

* React
* TypeScript
* React Router
* React Hook Form
* TanStack Query
* Tailwind CSS
* shadcn/ui
* Axios

### Infrastructure

* Docker
* Docker Compose
* Nginx

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Docker** and **Docker Compose** installed.

No separate PostgreSQL or Redis installation is required when running the application with Docker Compose.

### Environment Variables

Copy the backend environment sample:

```bash
cp backend/.env.sample backend/.env
```

Update the values in `backend/.env` with your configuration.

### Development

From the project root, run:

```bash
docker compose -f docker-compose.dev.yaml up
```

This starts the development environment with the required services.

### Production

The default Compose configuration is intended for the production setup and includes the Nginx reverse proxy.

From the project root:

```bash
docker compose up
```

---

## 📁 Project Structure

```text
.
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile
│   └── .env.sample
│
├── client/
│   ├── src/
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.dev.yaml
├── docker-compose.yaml
└── README.md
```

---

## 🎯 Project Goals

This project is primarily focused on learning and implementing real-world backend concepts rather than simply creating a basic authentication demo.

The main goals include:

* Secure authentication architecture
* Session and token management
* Redis integration
* PostgreSQL persistence
* Background job processing
* Rate limiting
* Containerized development and deployment
* Production-oriented backend architecture
