# Bridge ATS

This repository contains the source code for the Bridge ATS application. It is a full-stack application consisting of a Node.js/Express backend and a React/Vite frontend.

## Project Structure

The project is divided into two main directories:
- `Backend`: The Node.js Express server using Prisma ORM and PostgreSQL.
- `Bridge-web`: The frontend application built with React, Vite, and TailwindCSS.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A PostgreSQL database (you can use a cloud provider like Neon or host one locally)

## Step-by-Step Setup Guide

### 1. Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Backend` directory with the following variables:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
   
   # Secret for JWT Authentication
   JWT_SECRET="your_secure_jwt_secret_key"
   
   # Port for the backend server
   PORT=5002
   
   # Google OAuth Credentials (for Google Login)
   GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

4. **Initialize the Database:**
   Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Optional)* To populate the database with initial seed data:
   ```bash
   npm run prisma:seed
   ```

5. **Start the Backend Server:**
   - **Development Mode:** `npm run dev`
   - **Production Mode:** Build with `npm run build`, then start with `npm start`

---

### 2. Frontend Setup

1. **Navigate to the Frontend directory:**
   From the root of the project:
   ```bash
   cd Bridge-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Bridge-web` directory. Make sure the API URL points to where your backend is running:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:5002/api
   
   # Google OAuth Client ID
   VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
   ```

4. **Start the Frontend Application:**
   - **Development Mode:** `npm run dev`
   - **Production Mode:** Build the application using `npm run build`. This generates static files in the `dist/` directory. You can host this `dist` folder on static hosting services like Vercel, Netlify, or AWS S3.

## Default Development Ports
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5002

---

## Beginner's Step-by-Step Deployment Guide

Since you are deploying for the first time, this guide will walk you through the entire process from start to finish. 

To deploy on Render and Vercel, your code **must** be hosted on GitHub first. These platforms will read your code from GitHub and put it on the internet automatically.

### Phase 1: Upload Your Code to GitHub (Crucial First Step)

1. **Create a GitHub Account:** Go to [GitHub.com](https://github.com/) and sign up if you haven't already.
2. **Create a New Repository:** 
   - Click the **"+"** icon in the top right corner and select **"New repository"**.
   - Name it `bridge-ats` (or anything you like).
   - Leave it as "Public" or "Private", but **do not** check "Add a README file".
   - Click **"Create repository"**.
3. **Upload Your Code via VS Code:**
   - In VS Code, look at the left sidebar and click on the **Source Control** icon (it looks like a little branching tree).
   - If you see a button that says **"Publish to GitHub"**, click it! It will do all the hard work for you.
   - *If you don't see that button*, open your terminal in VS Code and run these commands one by one:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <paste-your-github-repo-url-here>
     git push -u origin main
     ```

Now that your code is on GitHub, let's put it on the internet!

---

### Phase 2: Deploy the Backend on Render

Render will host your Node.js server and give you a live link.

1. **Sign Up:** Go to [Render.com](https://render.com/) and sign up using your **GitHub account**.
2. **Create a Web Service:**
   - On the Render dashboard, click **"New +"** and select **"Web Service"**.
   - Under "Connect a repository", find the `bridge-ats` repository you just created and click **"Connect"**.
3. **Fill Out the Settings (IMPORTANT):**
   - **Name:** `bridge-backend`
   - **Region:** Choose whatever is closest to you.
   - **Branch:** `main`
   - **Root Directory:** Type exactly `Backend` (This is crucial because your backend code is inside a folder named Backend, not the main folder).
   - **Runtime:** `Node`
   - **Build Command:** Copy and paste this exactly: `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Select the **Free** tier.
4. **Add Environment Variables:**
   - Scroll down and click **"Advanced"**, then click **"Add Environment Variable"**. You need to add all the secret keys from your `Backend/.env` file.
   - Add `DATABASE_URL` and paste your database link.
   - Add `JWT_SECRET` and paste your secret key.
   - Add `GOOGLE_CLIENT_ID` and paste the ID.
   - Add `GOOGLE_CLIENT_SECRET` and paste the secret.
5. **Deploy!**
   - Click the **"Create Web Service"** button at the very bottom.
   - Render will start building your project. This might take 3-5 minutes. 
   - Once you see a green "Live" badge, look near the top left for your live URL (it will look something like `https://bridge-backend.onrender.com`). **Copy this URL**, you will need it for the frontend!

---

### Phase 3: Deploy the Frontend on Vercel

Vercel will host your React website so users can see it.

1. **Sign Up:** Go to [Vercel.com](https://vercel.com/) and sign up with your **GitHub account**.
2. **Add Your Project:**
   - From your Vercel dashboard, click **"Add New"** and select **"Project"**.
   - Find your `bridge-ats` GitHub repository and click **"Import"**.
3. **Configure the Project (IMPORTANT):**
   - **Project Name:** `bridge-web`
   - **Framework Preset:** Vercel should automatically detect **Vite**. Leave it as Vite.
   - **Root Directory:** Click the **"Edit"** button next to Root Directory. A window will pop up showing your folders. Select the `Bridge-web` folder and click **"Continue"**.
4. **Add Environment Variables:**
   - Open the **"Environment Variables"** dropdown menu.
   - **Name:** `VITE_API_URL`
   - **Value:** Paste the URL you got from Render in Phase 2, but **add `/api` to the end of it**. (Example: `https://bridge-backend.onrender.com/api`)
   - Click **"Add"**.
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Paste your Google Client ID here.
   - Click **"Add"**.
5. **Deploy!**
   - Click the big **"Deploy"** button.
   - Vercel will build your site. Once it finishes (usually under a minute), you will see confetti on your screen!
   - Click on your new live website link to test it out.

### Summary
Your frontend is now talking to your backend on the internet! If you make any changes to your code in the future, just push the changes to GitHub, and Render/Vercel will automatically update your live websites.
