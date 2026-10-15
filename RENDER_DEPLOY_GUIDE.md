# 🚀 24/7 Free Cloud Hosting Guide (Render.com)

To keep your Natural Milk Dairy backend running **24/7/365 across all mobile networks worldwide** without needing your laptop turned on, follow these simple steps to deploy on Render (100% Free):

---

### Step 1: Connect your GitHub Repository
1. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account (`beerayona2101-bot`).
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Choose your repository: **`dairy`** (`beerayona2101-bot/dairy`).

---

### Step 2: Configure Web Service Settings
Fill in the following fields:

| Field | Value |
| :--- | :--- |
| **Name** | `natural-milk-dairy` (or any name you choose) |
| **Region** | `Singapore` or `Frankfurt` (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | `Free` |

---

### Step 3: Add Environment Variables
Under the **Environment Variables** section in Render, click **"Add Environment Variable"** and copy these values:

```env
PORT=10000
IS_PRODUCTION=true
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

### Step 4: Deploy & Get Your Permanent URL
1. Click **"Create Web Service"**.
2. Within 2 minutes, Render will build your server and give you a permanent HTTPS URL, such as:
   `https://natural-milk-dairy.onrender.com`
3. Paste that URL into:
   - `server_config.json` -> `"activeServerUrl": "https://natural-milk-dairy.onrender.com"`
   - Commit and push to GitHub.
4. **All APKs installed on any phone in the world will automatically switch to your 24/7 Render cloud server without any recompile!**
