# QUICK START GUIDE

## ⚡ 5 Menit Setup

### Step 1: Backend Setup (2 menit)

```bash
# 1. Navigate ke backend folder
cd "TUBES PROTEIN BE\aplikasi-bidan-pintar"

# 2. Install dependencies
npm install

# 3. Setup .env file (copy dari template)
# src/.env harus ada dengan:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET
# - SMTP_* untuk email

# 4. Start backend
npm start
```

✅ Backend running di `http://localhost:5000`

---

### Step 2: Frontend Setup (2 menit)

```bash
# 1. Navigate ke frontend folder
cd "TUBES PROTEIN FE\Aplikasi-Bidan"

# 2. Install dependencies
npm install

# 3. Start frontend
npm start
```

✅ Frontend running di `http://localhost:3000`

---

### Step 3: Test Integration (1 menit)

1. **Open browser:** `http://localhost:3000`
2. **Click "Buat Akun"**
3. **Fill form:**
   - Nama Lengkap: John Doe
   - Username: johndoe
   - Email: test@example.com
   - Password: password123

4. **Click "Buat Akun"**
5. **Cek email untuk OTP**
6. **Masukkan OTP code**
7. **Login berhasil! 🎉**

---

## 📋 Prerequisites

- ✅ Node.js v14+
- ✅ MySQL/MariaDB running
- ✅ Gmail account (untuk OTP)
- ✅ Git (optional)

---

## ❌ Troubleshooting

### Backend won't start
```bash
# Check port 5000 not in use
netstat -ano | findstr :5000

# Or change port in .env
PORT=5001
```

### Frontend can't connect to API
```bash
# Check apiConfig.js
# src/config/apiConfig.js harus:
BASE_URL_DEV: 'http://localhost:5000/api'

# Check backend running
curl http://localhost:5000/api/auth/login
```

### OTP not received
1. Check .env SMTP settings
2. Check Gmail app password
3. Check email spam folder
4. Check Gmail "Less secure apps" enabled

---

## 🚀 You're Ready!

- Backend ✅
- Frontend ✅
- Integration ✅
- Testing ✅

Enjoy! 🎉

---

For detailed docs, see:
- `INTEGRATION_SUMMARY.md` - Complete overview
- `INTEGRATION_GUIDE.md` - Frontend details
- `BACKEND_SETUP.md` - Backend details
