
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const resetDatabase = async () => {
    console.log('🔄 Memulai Reset Database...');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aplikasi_bidan',
        multipleStatements: true // Enable multiple statements for SQL script
    };

    try {
        // 1. Create connection without database selected (to allow CREATE DATABASE)
        const connection = await mysql.createConnection(config);
        console.log('✅ Terhubung ke MySQL Server');

        // 2. Read init.sql
        const sqlPath = path.join(__dirname, 'database', 'init.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('📄 Membaca script database/init.sql...');

        // 3. Execute script
        console.log('🚀 Mengeksekusi script inisialisasi...');
        await connection.query(sqlContent);

        console.log('✅ Database berhasil dibuat ulang dan data sample telah diisi.');
        console.log('   Tabel Pasien sekarang memiliki Unique constraint pada NIK.');

        await connection.end();
    } catch (error) {
        console.error('❌ Gagal mereset database:', error.message);
        process.exit(1);
    }
};

resetDatabase();
