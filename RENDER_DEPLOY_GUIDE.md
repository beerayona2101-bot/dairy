# 🚀 24/7 Permanent Free Cloud Hosting Guide (Render.com)

To keep your Natural Milk Dairy backend and mobile storefront running **24/7/365 across all mobile networks worldwide (Cellular 4G/5G, any Wi-Fi)** without needing your laptop turned on, follow these simple steps to deploy on Render (100% Free):

---

### Option A: 1-Click Blueprint Deployment (Recommended)
1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub (`beerayona2101-bot`).
2. Click **"New +"** in the top navigation and select **"Blueprint"**.
3. Select your repository: **`dairy`** (`beerayona2101-bot/dairy`).
4. Render will automatically detect `render.yaml` with all build commands, start commands, and environment variables pre-configured.
5. Click **"Apply"**! Render will build your Client and Server and give you your permanent 24/7 HTTPS URL.

---

### Option B: Manual Web Service Setup
If you prefer creating a Web Service manually:
1. Click **"New +"** -> **"Web Service"**.
2. Select your repository **`dairy`**.
3. Configure the following settings:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `natural-milk-dairy` | Or any unique name you choose |
| **Region** | `Singapore` | Lowest latency for India |
| **Branch** | `main` | Production branch |
| **Root Directory** | *(Leave completely blank)* | Builds both Client & Server from repo root |
| **Runtime** | `Node` | Node.js environment |
| **Build Command** | `npm run build` | Builds Client/dist and installs dependencies |
| **Start Command** | `npm start` | Starts production Node Express server |
| **Instance Type** | `Free` | $0/month |

#### Environment Variables (Add under Environment tab):
```env
PORT=10000
IS_PRODUCTION=true
NODE_ENV=production
DB_URL=mongodb://milk_app:12345@ac-rwdtohw-shard-00-00.d87lkt6.mongodb.net:27017,ac-rwdtohw-shard-00-01.d87lkt6.mongodb.net:27017,ac-rwdtohw-shard-00-02.d87lkt6.mongodb.net:27017/?ssl=true&replicaSet=atlas-6io3bx-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=MADHU_dairy_jwt_secret_key_2026
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=beerayona143@gmail.com
EMAIL_PASS=lznh qvru cler bfel
RAZORPAY_KEY_ID=rzp_test_TZpv3bxIAHtj7y
RAZORPAY_KEY_SECRET=jinx3yiEbQqiPfCvWnWkNgBo
CLOUDINARY_CLOUD_NAME=cf1z70hh
CLOUDINARY_API_KEY=891248573188316
CLOUDINARY_API_SECRET=hDW8MEQqo92To7TlBccD1AzoIhs
CLOUDINARY_FOLDER=dairy_app
```

---

### Step 3: Link Your URL to All APKs Instantly (Zero Recompile Required)
1. Once deployed, Render gives you your live URL (e.g., `https://natural-milk-dairy.onrender.com` or your custom name).
2. Open `server_config.json` in this repo and update:
   ```json
   {
     "activeServerUrl": "https://your-service-name.onrender.com",
     "fallbackUrls": [
       "https://your-service-name.onrender.com"
     ]
   }
   ```
3. Commit and push:
   ```bash
   git add server_config.json
   git commit -m "feat: switch active server to permanent 24/7 cloud URL"
   git push origin main
   ```
4. **Done! Every APK on any phone across any network in the world will automatically switch to your 24/7 cloud server within seconds!**
