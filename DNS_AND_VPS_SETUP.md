# Panduan Setup DNS & VPS (Deployment)

Panduan ini akan membantumu melakukan deployment aplikasi **Bidanku** ke VPS dengan domain `bidanku.site` menggunakan HTTPS (SSL).

## Prasyarat
-   Sudah membeli domain `bidanku.site`.
-   Sudah membeli VPS dengan IP `145.79.15.211`.
-   Punya file `.env.docker` yang sudah diisi lengkap (termasuk config OAuth2).

---

## Tahap 1: Konfigurasi DNS (Domain)
Lakukan ini pertama kali agar DNS menyebar (propagate).

1.  Login ke panel domain manager kamu (tempat beli domain).
2.  Masuk ke menu **DNS Management**.
3.  Buat/Edit 2 Record ini:

| Type | Host / Name | Value / Target |
| :--- | :--- | :--- |
| **A** | `@` | `145.79.15.211` |
| **CNAME** | `www` | `bidanku.site` |

> **Pastikan:** Hapus record lama (default parking page) jika ada yang bertabrakan.

---

## Tahap 2: Persiapan di VPS
Sekarang kita masuk ke dalam server VPS kamu.

### 1. Login SSH
Buka terminal (PowerShell/CMD) di laptopmu:
```powershell
ssh root@145.79.15.211
```
*(Masukkan password VPS kamu saat diminta)*

### 2. Update Sistem & Install Docker
Salin dan jalankan perintah ini satu per satu:

```bash
# Update server
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose (plugin)
apt install docker-compose-plugin -y
```

### 3. Clone Repository
Kita ambil kodingan dari GitHub kamu:

```bash
git clone https://github.com/Xaverria30/bidanku.git
cd bidanku
```

---

## Tahap 3: Konfigurasi Environment & SSL

### 1. Buat File `.env`
Kita copy template `.env.docker` ke `.env` asli:

```bash
cp .env.docker .env
nano .env
```
*   Silakan edit isinya (masukkan `EMAIL_USER`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` yang asli).
*   Tekan `Ctrl+O` -> `Enter` untuk Save.
*   Tekan `Ctrl+X` untuk Exit.

### 2. Jalankan Script SSL (Hanya Pertama Kali)
Karena kita pakai HTTPS, kita perlu merequest sertifikat dulu. Saya sudah buatkan script otomatisnya:

```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```
*   Script ini akan mendownload sertifikat SSL gratis dari Let's Encrypt.
*   Tunggu sampai selesai dan muncul tulisan sukses.

---

## Tahap 4: Menjalankan Aplikasi

Setelah sertifikat berhasil didapat, jalankan aplikasi:

```bash
docker compose up -d
```

### Cek Status
```bash
docker compose ps
```
Pastikan semua container (`bidanku-app`, `nginx`, `mariadb`, `phpmyadmin`) berstatus **Up**.

---

## Tahap 5: Verifikasi
Buka browser dan akses:
*   Website: **[https://bidanku.site](https://bidanku.site)** (Harus ada gembok hijau 🔒)
*   API: `https://bidanku.site/api`
*   PhpMyAdmin: `http://145.79.15.211:8081` (Login: `root` / `bismillah`)

**Selesai! Aplikasi kamu sudah live.** 🚀
