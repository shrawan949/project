## 📝 Mini Notes App – Backend

This is the **backend** of the Mini Notes App, built with **Node.js + Express + MongoDB**.  
It provides secure REST APIs for authentication and notes management, with **JWT authentication** and **Socket.io** for real-time updates.  

---

## 🚀 Features
- 🔐 User authentication (Register / Login) with JWT  
- 🔑 Secure password hashing using **bcrypt.js**  
- 📝 CRUD APIs for notes (Add, Get, Update, Delete)  
- ⚡ Real-time updates with **Socket.io**  
- 🗄️ MongoDB for persistent storage  

---

## ⚡ Setup Instructions

### 1️⃣ Clone the Repository

git clone https://github.com/your-username/mini-notes-app.git


### 2️⃣ Install Dependencies
 npm install

### 3️⃣ Configure Environment Variables
Create a .env file in the backend folder with the following content:
PORT=3000
MONOGO_URL=your-url
Cors=http://localhost:5173

### 4️⃣ Run the Server
npm run dev

### Server will start on:
👉 http://localhost:5000


