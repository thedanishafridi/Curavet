# 🚀 CuraVet Deployment Playbook

This guide contains the exact steps to move your local CuraVet project to a live production environment on **Render** (Backend) and **Vercel** (Frontend).

---

## 🏗️ 1. Backend Deployment (Render)

Render is ideal for the Express/Node.js backend.

### **Step-by-Step Setup:**
1. **New Web Service**: Log in to [Render](https://render.com) and click `New +` > `Web Service`.
2. **Connect Repository**: Connect your GitHub repo and select the project folder.
3. **Configuration**:
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**: Click the "Advanced" button and add the following:

| Key | Value (Example/Source) |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `MONGO_URI` | *Your Atlas Connection String* |
| `JWT_SECRET` | *Any random 32-character string* |
| `FRONTEND_URL` | *Your Vercel URL (e.g. https://curavet.vercel.app)* |
| `CLOUDINARY_CLOUD_NAME` | *From your Cloudinary Dashboard* |
| `CLOUDINARY_API_KEY` | *From your Cloudinary Dashboard* |
| `CLOUDINARY_API_SECRET` | *From your Cloudinary Dashboard* |
| `SMTP_USER` | *From Mailtrap / SendGrid* |
| `SMTP_PASS` | *From Mailtrap / SendGrid* |

---

## 🎨 2. Frontend Deployment (Vercel)

Vercel is the gold standard for React (Vite) applications.

### **Step-by-Step Setup:**
1. **Import Project**: Log in to [Vercel](https://vercel.com) and click `Add New` > `Project`.
2. **Root Directory**: Select `frontend`.
3. **Framework Preset**: Should auto-detect as `Vite`.
4. **Environment Variables**: Expand this section and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | *Your Render URL + /api (e.g. https://curavet-backend.onrender.com/api)* |

---

## 🔗 3. Connecting the Bridges (The "Handshake")

For the frontend and backend to talk to each other in production, you must update two settings:

1. **CORS on Render**: Ensure the `FRONTEND_URL` variable on Render matches your final Vercel URL exactly.
2. **API URL on Vercel**: Ensure the `VITE_API_URL` on Vercel points to your live Render service.

---

## 🧪 4. Post-Deployment Verification

Once live, perform these 3 checks:

1. **Login Test**: Use `admin@curavet.com` / `admin123`.
2. **Media Test**: Try updating a pet photo in the Vet Dashboard (checks Cloudinary).
3. **Recovery Test**: Refresh the page on a sub-route (e.g. `/browse`). If it shows a 404, check your `vercel.json` exists in the frontend root.

---

### **Nuclear Ghost Check: ✅**
*   **Hardcoded URLs**: Removed.
*   **Secret Leaks**: Prevented via `.gitignore`.
*   **Schema Consistency**: Verified.

**Status: READY FOR PUSH**
