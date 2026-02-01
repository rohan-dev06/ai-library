# 🚀 Deployment Guide: MERN AI Library System

This guide will walk you through hosting your **React Frontend on Vercel** and **Node.js Backend on Render**.

---

## 📦 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free account and a new **Cluster**.
3. In **Database Access**, create a user with a username and password.
4. In **Network Access**, allow access from anywhere (`0.0.0.0/0`).
5. Click **Connect** -> **Drivers** and copy your Connection String.
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your real credentials.

---

## 🎨 2. Frontend Deployment (Vercel)
Vercel is the best place to host Vite/React apps.

### Option A: Drag & Drop (Easiest)
1. Go to your project folder: `client`
2. Run `npm run build` locally (we already did this!).
3. Visit [Vercel Login](https://vercel.com/login).
4. Go to your Dashboard and click **"Add New Project"**.
5. Drag and drop the `client/dist` folder into Vercel.
6. It will deploy instantly!

### Option B: Via GitHub (Recommended)
1. Push your code to GitHub.
2. Go to Vercel -> **Add New Project** -> **Import from GitHub**.
3. Select your repository.
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (Important!)
5. Click **Deploy**.

---

## ⚙️ 3. Backend Deployment (Render)
Render allows hosting Node.js APIs for free.

1. Push your code to GitHub (if not already done).
2. Go to [Render](https://render.com/) and create an account.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure settings:
   - **Name**: `ai-library-api`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. **Environment Variables** (Add these in the "Environment" tab):
   - `MONGO_URI`: (Your MongoDB Connection String)
   - `PORT`: `5000` (Optional, Render sets this auto)
   - `CLOUDINARY_CLOUD_NAME`: (Check your .env file)
   - `CLOUDINARY_API_KEY`: (Check your .env file)
   - `CLOUDINARY_API_SECRET`: (Check your .env file)
   - `EMAIL_USER`: (If used for emails)
   - `EMAIL_PASS`: (If used for emails)
7. Click **Create Web Service**.

---

## 🔗 4. Connecting Frontend to Backend
Once your backend is live (e.g., `https://ai-library-api.onrender.com`), you need to tell your frontend to use it.

1. Go to your **Vercel Project Settings** -> **Environment Variables**.
2. Add a new variable:
   - Key: `VITE_API_URL`
   - Value: `https://ai-library-api.onrender.com`
3. **Re-deploy** your frontend for changes to take effect.
4. *(Note: Make sure your React code uses `import.meta.env.VITE_API_URL` when making API calls)*

---

## 🎉 Done!
Your website is now live on the internet! 
- **Frontend Link**: Provided by Vercel
- **Backend Link**: Provided by Render
