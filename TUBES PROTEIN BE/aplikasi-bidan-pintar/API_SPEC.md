# Spesifikasi API Lengkap - Aplikasi Bidan Pintar

Dokumen ini berisi spesifikasi teknis lengkap untuk endpoint API backend.
Setiap endpoint mencakup URL, Metode HTTP, Header, dan Struktur Data (Request Body & Response).

**Base URL**: `http://localhost:5000/api`

---

## 1. Autentikasi & Pengguna (`/auth`)
Menangani pendaftaran, login, dan manajemen profil bidan.

### 1.1 Registrasi Pengguna
Mendaftarkan akun baru.
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "nama_lengkap": "string (required)",
    "username": "string (min 3 chars, required)",
    "email": "string (email valid, required)",
    "password": "string (min 6 chars, required)"
  }
  ```
- **Response Sukses (201)**: `User created`

### 1.2 Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "usernameOrEmail": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response Sukses (200)**: Mengirim OTP ke email.

### 1.3 Verifikasi OTP (Dapatkan Token)
- **URL**: `/auth/verify-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "usernameOrEmail": "string (required)",
    "otp_code": "string (6 digit angka, required)"
  }
  ```
- **Response Sukses (200)**:
  ```json
  {
    "success": true,
    "message": "Verifikasi berhasil. Anda berhasil login.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": { ... }
    }
  }
  ```

### 1.4 Profil Saya
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Header**: `Authorization: Bearer <token>`

### 1.5 Update Profil
- **URL**: `/auth/me`
- **Method**: `PUT`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "nama_lengkap": "string (optional)",
    "username": "string (optional)",
    "email": "string (optional)",
    "password": "string (optional - password baru)",
    "passwordLama": "string (required jika ganti password)"
  }
  ```

---

## 2. Manajemen Pasien (`/pasien`)
Mengelola data induk pasien.

### 2.1 Tambah Pasien
- **URL**: `/pasien`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "nama": "string (required)",
    "NIK": "string (16 digit angka, required)",
    "umur": "number (required)",
    "alamat": "string (required)",
    "no_hp": "string (min 8 chars, required)"
  }
  ```

### 2.2 List Pasien
- **URL**: `/pasien`
- **Method**: `GET`
- **Query**: `?search=nama`

### 2.3 Hapus Permanen
- **URL**: `/pasien/permanent/:id`
- **Method**: `DELETE`

---

## 3. Layanan ANC (Kehamilan) (`/anc`)

### 3.1 Registrasi ANC Baru
- **URL**: `/anc`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jenis_layanan": "ANC",
    "tanggal": "YYYY-MM-DD (required)",
    
    // Data Ibu
    "nama_istri": "string (required)",
    "nik_istri": "string (16 digit, required)",
    "umur_istri": "number/string (optional)",
    "alamat": "string (required)",
    "no_hp": "string (optional)",

    // Info Kehamilan
    "hpht": "YYYY-MM-DD (optional)",
    "hpl": "YYYY-MM-DD (optional)",
    
    // Data Suami (Optional)
    "nama_suami": "string",
    "nik_suami": "string",
    "umur_suami": "number/string",

    // Pemeriksaan & Hasil
    "hasil_pemeriksaan": "string (optional)",
    "keterangan": "string (optional)"
  }
  ```

---

## 4. Layanan KB (Keluarga Berencana) (`/kb`)

### 4.1 Registrasi KB Baru
- **URL**: `/kb`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jenis_layanan": "KB",
    "tanggal": "YYYY-MM-DD (required)",
    "metode": "string (Suntik/Pil/Implan, required)",

    // Data Ibu
    "nama_ibu": "string (required)",
    "nik_ibu": "string (16 digit, required)",
    "td_ibu": "string (optional)",
    "bb_ibu": "number/string (optional)",
    "alamat": "string (required)",

    // Data Suami
    "nama_ayah": "string (required)",
    
    // Kunjungan Ulang
    "kunjungan_ulang": "YYYY-MM-DD (optional)"
  }
  ```

---

## 5. Layanan Imunisasi (`/imunisasi`)

### 5.1 Registrasi Imunisasi
- **URL**: `/imunisasi`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jenis_layanan": "Imunisasi",
    "tanggal": "YYYY-MM-DD (required)",
    "jenis_imunisasi": "string (required)",

    // Data Bayi
    "nama_bayi_balita": "string (required)",
    "tanggal_lahir_bayi": "YYYY-MM-DD (required)",
    "tb_bayi": "number (optional)",
    "bb_bayi": "number (optional)",

    // Data Orang Tua
    "nama_istri": "string (required)",
    "nik_istri": "string (16 digit, required)",
    "alamat": "string (required)",
    
    // Info Tambahan
    "jadwal_selanjutnya": "YYYY-MM-DD (optional)"
  }
  ```

---

## 6. Layanan Persalinan (`/persalinan`)

### 6.1 Registrasi Persalinan
- **URL**: `/persalinan`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jenis_layanan": "Persalinan",
    "tanggal": "YYYY-MM-DD (required)",
    "penolong": "string (required)",

    // Data Ibu
    "nama_istri": "string (required)",
    "nik_istri": "string (16 digit, required)",
    "alamat": "string (required)",

    // Data Bayi Lahir
    "tanggal_lahir": "YYYY-MM-DD (required)",
    "jenis_kelamin": "L/P (required)",
    "anak_ke": "number (required)",
    "bb_bayi": "number (optional)",
    "pb_bayi": "number (optional)",
    "jenis_partus": "string (optional)"
  }
  ```

---

## 7. Layanan Kunjungan Pasien (`/kunjungan-pasien`)
Layanan umum untuk pemeriksaan kesehatan selain KIA/KB.

### 7.1 Registrasi Kunjungan
- **URL**: `/kunjungan-pasien`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "jenis_layanan": "Kunjungan Pasien",
    "tanggal": "YYYY-MM-DD (required)",
    "jenis_kunjungan": "Bayi|Anak|Lansia|Umum (required)",

    // Data Pasien
    "nama_pasien": "string (required)",
    "nik_pasien": "string (16 digit, required)",
    "umur_pasien": "string/number (required)",
    
    // Klinis
    "keluhan": "string (required)",
    "diagnosa": "string (required)",
    "terapi_obat": "string (optional)",
    
    // Fisik
    "td_pasien": "string (optional)",
    "bb_pasien": "number (optional)"
  }
  ```

---

## 8. Pemeriksaan SOAP (`/pemeriksaan`)
Endpoint untuk menyimpan detail klinis Subjective, Objective, Analisa, dan Penatalaksanaan.

### 8.1 Simpan SOAP
- **URL**: `/pemeriksaan`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "id_registrasi": "UUID (ID dari layanan ANC/KB/dll)",
    "jenis_layanan": "ANC",
    "subjektif": "string",
    "objektif": "string",
    "analisa": "string",
    "tatalaksana": "string"
  }
  ```

---

## 9. Laporan (`/laporan`)
Fitur export data ke Excel.

### 9.1 Download Laporan
- **URL**: `/laporan`
- **Method**: `GET`
- **Query Params**:
  - `format`: `excel`
  - `bulan`: `1-12`
  - `tahun`: `yyyy`
  - `jenis_layanan`: `ANC`, `KB`, `Imunisasi`, `Persalinan`, `Kunjungan Pasien` (atau `Semua`)
- **Response**: File stream `.xlsx`

---

## 10. Jadwal Praktik (`/jadwal`)

### 10.1 Lihat Jadwal
- **URL**: `/jadwal`
- **Method**: `GET`
- **Query**: `?bulan=1&tahun=2025`

### 10.2 Tambah/Edit Jadwal
- **URL**: `/jadwal` atau `/jadwal/:id`
- **Method**: `POST` / `PUT`
- **Body**:
  ```json
  {
    "tanggal": "YYYY-MM-DD",
    "jam_mulai": "HH:mm",
    "jam_selesai": "HH:mm",
    "keterangan": "string"
  }
  ```
