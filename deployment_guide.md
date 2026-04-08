# VyaparOS Soft Deployment Guide

The VyaparOS architecture has been mathematically decoupled to support your hybrid cloud topology safely. Before pressing deploy on Render and Netlify, please execute the exact environment mapping sequences below.

## 1. Firebase Preparation (Mandatory)
Before your Netlify URL will be allowed to send real SMS payloads, it must be cleared natively by Google.
1. Open **Firebase Console**.
2. Navigate to **Authentication** -> **Settings** -> **Authorized Domains**.
3. Add your explicit Netlify production URL (`vyaparos-test.netlify.app`). 

## 2. Server Deployment (Render / Railway)
Since the database natively writes to an SQLite file (`vyaparos.sqlite`), you **must** configure your Render Web Service to utilize a [Persistent Disk](https://render.com/docs/disks). Without a persistent disk, Render's container restarts will permanently erase all Registered CAs and Clients automatically!
* **Build Command**: `npm install`
* **Start Command**: `npm start` (this correctly triggers `node src/index.js`).

**Environment Variables Required:**
* `CORS_ORIGIN` = `https://vyaparos-test.netlify.app` *(Critical for blocking spoof requests and ensuring only your frontend can reach the database)*
* `FIREBASE_ADMIN_KEY` = `[Paste your Service Account JSON locally here or ensure the proxy file reads it]`

## 3. Client Deployment (Netlify)
The React/Vite instance is prepared for Netlify implicitly via the `client/public/_redirects` file mapped earlier (which prevents React Router 404s).
* **Build Command**: `npm run build`
* **Publish Directory**: `dist`

**Environment Variables Required:**
* `VITE_BACKEND_URL` = `https://your-render-app.onrender.com/api` *(Critical! Notice the `/api` postfix. This redirects global Axios requests directly towards your live Render IP)*
* `VITE_FIREBASE_API_KEY` = `...`
* `VITE_FIREBASE_AUTH_DOMAIN` = `...`
* `VITE_FIREBASE_PROJECT_ID` = `...`
* `VITE_FIREBASE_STORAGE_BUCKET` = `...`
* `VITE_FIREBASE_MESSAGING_SENDER_ID` = `...`
* `VITE_FIREBASE_APP_ID` = `...`
