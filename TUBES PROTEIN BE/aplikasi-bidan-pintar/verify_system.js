const axios = require('axios');
const db = require('./src/config/database');

const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let pasienId = '';

// Test Data
const testUsername = 'test_auto_admin';
const testEmail = 'test_auto@example.com';
const testPassword = 'password123';

const testPasien = {
    nama: 'Test Pasien Otomatis',
    NIK: '9999999999999999',
    umur: 30,
    alamat: 'Jl. Testing Otomatis',
    no_hp: '081234567890'
};

const testANC = {
    // Service Info
    jenis_layanan: 'ANC',
    tanggal: new Date().toISOString().split('T')[0],

    // Mother Info (Matches testPasien)
    nama_istri: 'Test Pasien Otomatis',
    nik_istri: '9999999999999999',
    umur_istri: 30,
    alamat: 'Jl. Testing Otomatis',
    no_hp: '081234567890',

    // Medical Data
    hpht: '2024-01-01',
    hpl: '2024-10-08',
    hasil_pemeriksaan: 'Normal',
    tindakan: 'Vitamin',
    keterangan: 'Sehat',

    // Optional but good for completeness
    nama_suami: 'Suami Test',
    nik_suami: '8888888888888888',
    umur_suami: 35
};

const testKB = {
    jenis_layanan: 'KB',
    tanggal: new Date().toISOString().split('T')[0],
    metode: 'Suntik KB',
    nama_ibu: 'Test Pasien Otomatis',
    nik_ibu: '9999999999999999',
    umur_ibu: 30,
    alamat: 'Jl. Testing Otomatis',
    nomor_hp: '081234567890',
    nama_ayah: 'Suami Test',
    nik_ayah: '8888888888888888',
    umur_ayah: 35,
    kunjungan_ulang: new Date(Date.now() + 86400000 * 28).toISOString().split('T')[0],
    jam_kunjungan_ulang: '09:00',
    nomor_registrasi_baru: 'KB-2025-001'
};

const testImunisasi = {
    jenis_layanan: 'Imunisasi',
    tanggal: new Date().toISOString().split('T')[0],
    jenis_imunisasi: 'BCG',
    nama_istri: 'Test Pasien Otomatis', /* Validator requires nama_istri */
    nik_istri: '9999999999999999',
    umur_istri: 30,
    alamat: 'Jl. Testing Otomatis',
    no_hp: '081234567890',
    nama_suami: 'Suami Test',
    nik_suami: '8888888888888888',
    umur_suami: 35,
    nama_bayi_balita: 'Bayi Test', /* Validator requires nama_bayi_balita */
    tanggal_lahir_bayi: '2024-01-01',
    tb_bayi: 50, /* Validator: tb_bayi */
    bb_bayi: 3.5, /* Validator: bb_bayi */
    jadwal_selanjutnya: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    jam_jadwal_selanjutnya: '09:00'
};

const testPersalinan = {
    jenis_layanan: 'Persalinan',
    tanggal: new Date().toISOString().split('T')[0],
    nama_istri: 'Test Pasien Otomatis',
    nik_istri: '9999999999999999',
    umur_istri: 30,
    alamat: 'Jl. Testing Otomatis',
    no_hp: '081234567890',
    nama_suami: 'Suami Test',
    nik_suami: '8888888888888888',
    umur_suami: 35,
    jenis_partus: 'Spontan Normal',
    penolong: 'Bidan',
    tanggal_lahir: new Date().toISOString().split('T')[0],
    jenis_kelamin: 'L',
    anak_ke: 1, /* Required field */
    bb_bayi: 3000,
    pb_bayi: 48,
    as_bayi: '8/9',
    imd_dilakukan: true
};

async function runTests() {
    console.log('🚀 Starting Automated Verification...\n');

    try {
        // 0. Register (Ensure user exists)
        console.log('0. Testing Register...');
        const newUser = {
            nama_lengkap: 'Test Admin',
            username: testUsername,
            email: testEmail,
            password: testPassword
        };
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, newUser);
            userId = regRes.data.data.id_user;
            console.log('✅ Registration Successful. ID:', userId);
        } catch (error) {
            if (error.response?.data?.message?.includes('sudah digunakan') || error.response?.data?.message?.includes('terdaftar')) {
                console.log('⚠️ User already exists, proceeding to fetch ID from DB...');
                const [rows] = await db.query('SELECT id_user FROM users WHERE username = ?', [testUsername]);
                if (rows.length > 0) {
                    userId = rows[0].id_user;
                    console.log('✅ User ID retrieved from DB:', userId);
                } else {
                    throw new Error('User exists but cannot retrieve ID from DB');
                }
            } else {
                console.error('❌ Registration Failed:', error.response?.data?.message || error.message);
                process.exit(1);
            }
        }

        // 1. Login (Trigger OTP)
        console.log('\n1. Testing Login (Trigger OTP)...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                usernameOrEmail: testUsername,
                password: testPassword
            });
            console.log('✅ Login Request Successful (OTP Sent)');
        } catch (error) {
            console.error('❌ Login Request Failed:', error.response?.data?.message || error.message);
            process.exit(1);
        }

        // 1.5 Retrieve OTP from DB
        console.log('\n1.5 Retrieving OTP from DB...');
        let otpCode = '';
        try {
            const [rows] = await db.query('SELECT otp_code FROM otp_codes WHERE id_user = ?', [userId]);
            if (rows.length > 0) {
                otpCode = rows[0].otp_code;
                console.log('✅ OTP Code Found:', otpCode);
            } else {
                throw new Error('OTP Code NOT FOUND in DB');
            }
        } catch (error) {
            console.error('❌ OTP Retrieval Failed:', error.message);
            process.exit(1);
        }

        // 1.8 Verify OTP
        console.log('\n1.8 Verifying OTP...');
        try {
            const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
                usernameOrEmail: testUsername,
                otp_code: otpCode
            });
            token = verifyRes.data.data.token;
            console.log('✅ OTP Verified. Token Received.');
        } catch (error) {
            console.error('❌ OTP Verification Failed:', error.response?.data?.message || error.message);
            process.exit(1);
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Pasien
        console.log('\n2. Testing Create Pasien...');
        try {
            const createPasienRes = await axios.post(`${API_URL}/pasien`, testPasien, config);
            pasienId = createPasienRes.data.data.id_pasien;
            console.log('✅ Create Pasien Successful. ID:', pasienId);
        } catch (error) {
            if (error.response?.data?.message?.includes('Duplicate') || error.response?.data?.message?.includes('terdaftar')) {
                console.log('⚠️ Pasien already exists, trying to find it...');
                const searchRes = await axios.get(`${API_URL}/pasien?search=${testPasien.NIK}`, config);
                if (searchRes.data.data.length > 0) {
                    pasienId = searchRes.data.data[0].id_pasien;
                    console.log('✅ Found existing Pasien. ID:', pasienId);
                } else {
                    console.error('❌ Failed to create and find Pasien');
                    process.exit(1);
                }
            } else {
                console.error('❌ Create Pasien Failed:', error.response?.data?.message || error.message);
                process.exit(1);
            }
        }

        // 3. Create ANC Record (to verify relationship deletion/hiding)
        console.log('\n3. Testing Create ANC Record...');
        try {
            const ancData = { ...testANC, id_pasien: pasienId };
            const createAncRes = await axios.post(`${API_URL}/anc`, ancData, config);
            console.log('✅ Create ANC Record Successful');
        } catch (error) {
            console.error('❌ Create ANC Failed:', error.response?.data?.message || error.message);
        }

        // 3.1 Create KB Record
        console.log('\n3.1 Testing Create KB Record...');
        try {
            await axios.post(`${API_URL}/kb`, testKB, config);
            console.log('✅ Create KB Record Successful');
        } catch (error) {
            console.error('❌ Create KB Failed:', error.response?.data?.message || error.message);
        }

        // 3.2 Create Imunisasi Record
        console.log('\n3.2 Testing Create Imunisasi Record...');
        try {
            await axios.post(`${API_URL}/imunisasi`, testImunisasi, config);
            console.log('✅ Create Imunisasi Record Successful');
        } catch (error) {
            console.error('❌ Create Imunisasi Failed:', error.response?.data?.message || error.message);
        }

        // 3.3 Create Persalinan Record
        console.log('\n3.3 Testing Create Persalinan Record...');
        try {
            await axios.post(`${API_URL}/persalinan`, testPersalinan, config);
            console.log('✅ Create Persalinan Record Successful');
        } catch (error) {
            console.error('❌ Create Persalinan Failed:', error.response?.data?.message || error.message);
        }

        // 3.4 Verify Jadwal Auto-Creation
        console.log('\n3.4 Verifying Auto-Created Jadwal...');
        try {
            const jadwalRes = await axios.get(`${API_URL}/jadwal`, config);
            // We expect schedules from ANC (HPL), KB (Kunjungan Ulang), Imunisasi (Jadwal Selanjutnya)
            const schedules = jadwalRes.data.data;
            const hasANC = schedules.some(s => s.jenis_layanan === 'ANC' && s.tanggal === testANC.hpl);
            const hasKB = schedules.some(s => s.jenis_layanan === 'KB' && s.tanggal === testKB.kunjungan_ulang);
            const hasImunisasi = schedules.some(s => s.jenis_layanan === 'Imunisasi' && s.tanggal === testImunisasi.jadwal_selanjutnya);

            if (hasANC) console.log('✅ ANC Schedule Found');
            else console.warn('⚠️ ANC Schedule NOT Found (Check HPL logic)');

            if (hasKB) console.log('✅ KB Schedule Found');
            else console.warn('⚠️ KB Schedule NOT Found');

            if (hasImunisasi) console.log('✅ Imunisasi Schedule Found');
            else console.warn('⚠️ Imunisasi Schedule NOT Found');

        } catch (error) {
            console.error('❌ Verify Jadwal Failed:', error.message);
        }

        // ==========================================
        // CRUD: READ, UPDATE, DELETE for Services
        // ==========================================

        // --- ANC ---
        console.log('\n--- Verifying CRUD ANC ---');
        try {
            // Read
            const listANC = await axios.get(`${API_URL}/anc?search=${testPasien.NIK}`, config);
            const ancRecord = listANC.data.data[0];
            if (ancRecord) {
                console.log('✅ READ ANC Success');

                // Update
                const updateData = { ...testANC, tindakan: 'Pemberian Vitamin Update', id_pasien: pasienId };
                await axios.put(`${API_URL}/anc/${ancRecord.id_pemeriksaan}`, updateData, config);
                console.log('✅ UPDATE ANC Success');

                // Verify Update
                const updatedANC = await axios.get(`${API_URL}/anc/${ancRecord.id_pemeriksaan}`, config);
                if (updatedANC.data.data.tindakan === 'Pemberian Vitamin Update') {
                    console.log('✅ UPDATE Verification Passed');
                } else {
                    console.error('❌ UPDATE Verification Failed');
                }

                // Delete
                await axios.delete(`${API_URL}/anc/${ancRecord.id_pemeriksaan}`, config);
                console.log('✅ DELETE ANC Success');
            } else {
                console.error('❌ READ ANC Failed: No record found');
            }
        } catch (error) {
            console.error('❌ CRUD ANC Failed:', error.response?.data?.message || error.message);
        }

        // --- KB ---
        console.log('\n--- Verifying CRUD KB ---');
        try {
            // Read
            const listKB = await axios.get(`${API_URL}/kb?search=${testPasien.NIK}`, config);
            const kbRecord = listKB.data.data[0];
            if (kbRecord) {
                console.log('✅ READ KB Success');

                // Update
                const updateData = { ...testKB, catatan: 'Catatan Update', id_pasien: pasienId };
                await axios.put(`${API_URL}/kb/${kbRecord.id_pemeriksaan}`, updateData, config);
                console.log('✅ UPDATE KB Success');

                // Delete
                await axios.delete(`${API_URL}/kb/${kbRecord.id_pemeriksaan}`, config);
                console.log('✅ DELETE KB Success');
            } else {
                console.error('❌ READ KB Failed: No record found');
            }
        } catch (error) {
            console.error('❌ CRUD KB Failed:', error.response?.data?.message || error.message);
        }

        // --- Imunisasi ---
        console.log('\n--- Verifying CRUD Imunisasi ---');
        try {
            // Read
            const listImun = await axios.get(`${API_URL}/imunisasi?search=${testPasien.NIK}`, config);
            const imunRecord = listImun.data.data[0];
            if (imunRecord) {
                console.log('✅ READ Imunisasi Success');

                // Update
                const updateData = { ...testImunisasi, pengobatan: 'Paracetamol', id_pasien: pasienId };
                await axios.put(`${API_URL}/imunisasi/${imunRecord.id_pemeriksaan}`, updateData, config);
                console.log('✅ UPDATE Imunisasi Success');

                // Delete
                await axios.delete(`${API_URL}/imunisasi/${imunRecord.id_pemeriksaan}`, config);
                console.log('✅ DELETE Imunisasi Success');
            } else {
                console.error('❌ READ Imunisasi Failed: No record found');
            }
        } catch (error) {
            console.error('❌ CRUD Imunisasi Failed:', error.response?.data?.message || error.message);
        }

        // --- Persalinan ---
        console.log('\n--- Verifying CRUD Persalinan ---');
        try {
            // Read
            const listPers = await axios.get(`${API_URL}/persalinan?search=${testPasien.NIK}`, config);
            const persRecord = listPers.data.data[0];
            if (persRecord) {
                console.log('✅ READ Persalinan Success');

                // Update
                const updateData = { ...testPersalinan, penolong: 'Dokter Kandungan', id_pasien: pasienId };
                await axios.put(`${API_URL}/persalinan/${persRecord.id_pemeriksaan}`, updateData, config);
                console.log('✅ UPDATE Persalinan Success');

                // Delete
                await axios.delete(`${API_URL}/persalinan/${persRecord.id_pemeriksaan}`, config);
                console.log('✅ DELETE Persalinan Success');
            } else {
                console.error('❌ READ Persalinan Failed: No record found');
            }
        } catch (error) {
            console.error('❌ CRUD Persalinan Failed:', error.response?.data?.message || error.message);
        }

        // 4. Soft Delete Pasien
        console.log('\n4. Testing Soft Delete Pasien...');
        try {
            await axios.delete(`${API_URL}/pasien/${pasienId}`, config);
            console.log('✅ Delete Request Successful');
        } catch (error) {
            console.error('❌ Delete Failed:', error.response?.data?.message || error.message);
            process.exit(1);
        }

        // 5. Verify Pasien is Hidden from Main List
        console.log('\n5. Verifying Pasien Hidden from Main List...');
        try {
            const listRes = await axios.get(`${API_URL}/pasien`, config);
            const found = listRes.data.data.find(p => p.id_pasien === pasienId);
            if (!found) {
                console.log('✅ Verification Passed: Pasien NOT found in main list.');
            } else {
                console.error('❌ Verification Failed: Pasien STILL FOUND in main list.');
            }
        } catch (error) {
            console.error('❌ Verify Hidden Failed:', error.message);
        }

        // 6. Verify Pasien is in Deleted List (Recovery)
        console.log('\n6. Verifying Pasien in Deleted List (Trash Bin)...');
        try {
            const deletedRes = await axios.get(`${API_URL}/pasien/deleted`, config);
            const foundDeleted = deletedRes.data.data.find(p => p.id_pasien === pasienId);
            if (foundDeleted) {
                console.log('✅ Verification Passed: Pasien FOUND in deleted list.');
            } else {
                console.error('❌ Verification Failed: Pasien NOT FOUND in deleted list.');
            }
        } catch (error) {
            console.error('❌ Verify Trash Bin Failed:', error.message);
        }

        // 7. Restore Pasien
        console.log('\n7. Testing Restore Pasien...');
        try {
            await axios.put(`${API_URL}/pasien/${pasienId}/restore`, {}, config);
            console.log('✅ Restore Request Successful');
        } catch (error) {
            console.error('❌ Restore Failed:', error.response?.data?.message || error.message);
        }

        // 8. Verify Pasien is Back in Main List
        console.log('\n8. Verifying Pasien Back in Main List...');
        try {
            const listResBack = await axios.get(`${API_URL}/pasien`, config);
            const foundBack = listResBack.data.data.find(p => p.id_pasien === pasienId);
            if (foundBack) {
                console.log('✅ Verification Passed: Pasien FOUND in main list after restore.');
            } else {
                console.error('❌ Verification Failed: Pasien NOT FOUND after restore.');
            }
        } catch (error) {
            console.error('❌ Verify Restore Failed:', error.message);
        }

        // Cleanup: Exit process to close DB connection
        console.log('\n🏁 Automated Verification Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected Error:', err);
        process.exit(1);
    }
}

runTests();
