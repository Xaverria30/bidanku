/**
 * Test script to debug pemeriksaan search functionality
 */

require('dotenv').config();
const db = require('./src/config/database');

async function testSearch() {
  try {
    console.log('=== Testing Search Functionality ===\n');

    // Test 1: Get all pemeriksaan
    console.log('1. All pemeriksaan:');
    const [allRows] = await db.query(`
      SELECT p.id_pemeriksaan, p.jenis_layanan, pas.nama AS nama_pasien
      FROM pemeriksaan p
      LEFT JOIN pasien pas ON p.id_pasien = pas.id_pasien
      ORDER BY p.tanggal_pemeriksaan DESC
      LIMIT 10
    `);
    console.log('Total rows:', allRows.length);
    allRows.forEach(row => {
      console.log(`  - ${row.nama_pasien || 'No name'} | ${row.jenis_layanan}`);
    });

    // Test 2: Filter by jenis_layanan
    console.log('\n2. Filter by jenis_layanan = "Kunjungan Pasien":');
    const jenisLayanan = 'Kunjungan Pasien';
    const [filteredRows] = await db.query(`
      SELECT p.id_pemeriksaan, p.jenis_layanan, pas.nama AS nama_pasien
      FROM pemeriksaan p
      LEFT JOIN pasien pas ON p.id_pasien = pas.id_pasien
      WHERE p.jenis_layanan = ?
      ORDER BY p.tanggal_pemeriksaan DESC
    `, [jenisLayanan]);
    console.log('Total rows:', filteredRows.length);
    filteredRows.forEach(row => {
      console.log(`  - ${row.nama_pasien || 'No name'} | ${row.jenis_layanan}`);
    });

    // Test 3: Search by name
    console.log('\n3. Search by name containing "nurul":');
    const searchTerm = 'nurul';
    const [searchRows] = await db.query(`
      SELECT p.id_pemeriksaan, p.jenis_layanan, pas.nama AS nama_pasien
      FROM pemeriksaan p
      LEFT JOIN pasien pas ON p.id_pasien = pas.id_pasien
      WHERE pas.nama LIKE ?
      ORDER BY p.tanggal_pemeriksaan DESC
    `, [`%${searchTerm}%`]);
    console.log('Total rows:', searchRows.length);
    searchRows.forEach(row => {
      console.log(`  - ${row.nama_pasien || 'No name'} | ${row.jenis_layanan}`);
    });

    // Test 4: Combined filter
    console.log('\n4. Combined: jenis_layanan = "Kunjungan Pasien" AND name contains "nurul":');
    const [combinedRows] = await db.query(`
      SELECT p.id_pemeriksaan, p.jenis_layanan, pas.nama AS nama_pasien
      FROM pemeriksaan p
      LEFT JOIN pasien pas ON p.id_pasien = pas.id_pasien
      WHERE p.jenis_layanan = ? AND pas.nama LIKE ?
      ORDER BY p.tanggal_pemeriksaan DESC
    `, [jenisLayanan, `%${searchTerm}%`]);
    console.log('Total rows:', combinedRows.length);
    combinedRows.forEach(row => {
      console.log(`  - ${row.nama_pasien || 'No name'} | ${row.jenis_layanan}`);
    });

    // Test 5: Check distinct jenis_layanan values
    console.log('\n5. Distinct jenis_layanan values in database:');
    const [distinctValues] = await db.query(`
      SELECT DISTINCT jenis_layanan, COUNT(*) as count
      FROM pemeriksaan
      GROUP BY jenis_layanan
      ORDER BY jenis_layanan
    `);
    distinctValues.forEach(row => {
      console.log(`  - "${row.jenis_layanan}" (${row.count} records)`);
    });

    console.log('\n=== Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSearch();
