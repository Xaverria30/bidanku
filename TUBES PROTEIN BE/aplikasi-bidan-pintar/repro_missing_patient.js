require('dotenv').config({ path: '../../.env.docker' });
// Override DB_HOST for local testing BEFORE requiring database
process.env.DB_HOST = 'localhost';

const db = require('./src/config/database');
const pasienService = require('./src/services/pasien.service');

async function testMissingPatient() {
    console.log('=== Starting Test: Missing Patient ===');
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const uniqueNik = '999' + Date.now();
        const testData = {
            nama: 'Test Patient ' + Date.now(),
            nik: uniqueNik,
            umur: '25 Tahun',
            alamat: null, // Simulate Kunjungan Pasien input
            no_hp: null
        };

        console.log('1. Creating/Finding patient with data:', testData);
        const id_pasien = await pasienService.findOrCreatePasien(testData, connection);
        console.log('   -> Result ID:', id_pasien);

        await connection.commit(); // Commit transaction
        console.log('2. Transaction committed.');

        console.log('3. Fetching All Pasien List...');
        const allPasien = await pasienService.getAllPasien();

        const found = allPasien.find(p => p.id_pasien === id_pasien);

        if (found) {
            console.log('   [SUCCESS] Patient FOUND in list!');
            console.log('   Data:', found);
        } else {
            console.log('   [FAILURE] Patient NOT FOUND in list!');

            // Investigation: Check raw DB
            const [raw] = await db.query('SELECT * FROM pasien WHERE id_pasien = ?', [id_pasien]);
            console.log('   [DEBUG] Raw Record:', raw[0]);
        }

    } catch (error) {
        await connection.rollback();
        console.error('An error occurred:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

testMissingPatient();
