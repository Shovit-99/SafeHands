# SafeHands 

![SafeHands](https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=300&fit=crop)

**🚀 Live Demo:** [https://safe-hands-eta.vercel.app](https://safe-hands-eta.vercel.app)
**🔌 Backend API:** [https://safehands-ad69.onrender.com](https://safehands-ad69.onrender.com)

**SafeHands** (formerly *LostHub*) is the ultimate community-driven campus lost-and-found platform. It connects students who have lost items with those who have found them, focusing on security, user-centered design, and seamless retrieval.

## ✨ Features

- **Strict Campus Authentication:** Registration is restricted to specific college ERP emails (e.g., `@dit.edu.in`) to ensure a safe, closed community.
- **Mandatory 2FA:** All accounts are secured with Two-Factor Authentication via Google Authenticator or Authy.
- **Smart Search & Filtering:** Find exactly what you're looking for with an advanced search and categorization system. Filter by date, location, or item type.
- **Secure Real-time Communication:** Chat safely with finders or owners instantly using WebSockets, without exposing your personal contact information.
- **Real-time Notifications:** Get instantly notified when an item matching your description is found or when someone replies to your report.
- **Modern UI/UX:** Built with a beautiful, high-contrast "mesh" glassmorphism aesthetic.

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Vanilla CSS** (Custom Design System with Glassmorphism)
- **Axios** (API Requests)
- **Lucide React** (Iconography)
- **Socket.io-client** (Real-time chat)

### Backend
- **Node.js & Express**
- **TypeScript**
- **MongoDB** (Mongoose)
- **Socket.io** (WebSockets)
- **JWT & Speakeasy** (Authentication & 2FA)
- **Cloudinary / Multer** (Image Uploads)

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB server)

### 2. Installation
Clone the repository and install dependencies for both the frontend and backend.

```bash
git clone https://github.com/Shovit-99/SafeHands.git
cd SafeHands

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
You need to create a `.env` file in both the `frontend` and `backend` directories.

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/safehands?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COLLEGE_EMAIL_DOMAIN=dit.edu.in

# Optional (for Image Uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Development Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The app will be running at `http://localhost:5173`.

## 🌐 Deployment

SafeHands is designed to be deployed with a decoupled architecture:
1. **Frontend:** Deployed as a static site on **Vercel** (for blazing fast CDN delivery).
2. **Backend:** Deployed as a Node.js web service on **Render** (to support long-polling WebSockets for real-time chat).

Ensure you set `CLIENT_URL` on the backend to your Vercel URL, and `VITE_API_URL` on the frontend to your Render URL!

## 📄 License
© 2026 SafeHands. All rights reserved.
