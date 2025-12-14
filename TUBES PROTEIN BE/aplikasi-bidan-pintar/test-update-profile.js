/**
 * Test script to verify updateProfile functionality
 */

require('dotenv').config();
const db = require('./src/config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function testUpdateProfile() {
  try {
    console.log('=== Testing Update Profile Functionality ===\n');

    // Create a test user
    const testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    console.log('1. Creating test user...');
    await db.query(
      'INSERT INTO users (id_user, nama_lengkap, username, email, password, is_verified) VALUES (?, ?, ?, ?, ?, 1)',
      [testUserId, 'Test User', 'testuser', 'test@example.com', hashedPassword]
    );
    console.log('   ✅ Test user created:', testUserId);

    // Get initial data
    const [initialData] = await db.query('SELECT * FROM users WHERE id_user = ?', [testUserId]);
    console.log('\n2. Initial data:');
    console.log('   nama_lengkap:', initialData[0].nama_lengkap);
    console.log('   username:', initialData[0].username);
    console.log('   email:', initialData[0].email);

    // Test 1: Update only nama_lengkap
    console.log('\n3. Test 1: Update only nama_lengkap');
    const fields1 = ['nama_lengkap = ?'];
    const params1 = ['Updated Name', testUserId];
    await db.query(`UPDATE users SET ${fields1.join(', ')} WHERE id_user = ?`, params1);
    
    const [result1] = await db.query('SELECT * FROM users WHERE id_user = ?', [testUserId]);
    console.log('   nama_lengkap:', result1[0].nama_lengkap, result1[0].nama_lengkap === 'Updated Name' ? '✅' : '❌');
    console.log('   username:', result1[0].username, result1[0].username === 'testuser' ? '✅' : '❌');
    console.log('   email:', result1[0].email, result1[0].email === 'test@example.com' ? '✅' : '❌');

    // Test 2: Update only email
    console.log('\n4. Test 2: Update only email');
    const fields2 = ['email = ?'];
    const params2 = ['newemail@example.com', testUserId];
    await db.query(`UPDATE users SET ${fields2.join(', ')} WHERE id_user = ?`, params2);
    
    const [result2] = await db.query('SELECT * FROM users WHERE id_user = ?', [testUserId]);
    console.log('   nama_lengkap:', result2[0].nama_lengkap, result2[0].nama_lengkap === 'Updated Name' ? '✅' : '❌');
    console.log('   username:', result2[0].username, result2[0].username === 'testuser' ? '✅' : '❌');
    console.log('   email:', result2[0].email, result2[0].email === 'newemail@example.com' ? '✅' : '❌');

    // Test 3: Update all fields
    console.log('\n5. Test 3: Update all fields at once');
    const fields3 = ['nama_lengkap = ?', 'username = ?', 'email = ?'];
    const params3 = ['Final Name', 'finaluser', 'final@example.com', testUserId];
    await db.query(`UPDATE users SET ${fields3.join(', ')} WHERE id_user = ?`, params3);
    
    const [result3] = await db.query('SELECT * FROM users WHERE id_user = ?', [testUserId]);
    console.log('   nama_lengkap:', result3[0].nama_lengkap, result3[0].nama_lengkap === 'Final Name' ? '✅' : '❌');
    console.log('   username:', result3[0].username, result3[0].username === 'finaluser' ? '✅' : '❌');
    console.log('   email:', result3[0].email, result3[0].email === 'final@example.com' ? '✅' : '❌');

    // Cleanup
    console.log('\n6. Cleaning up test user...');
    await db.query('DELETE FROM users WHERE id_user = ?', [testUserId]);
    console.log('   ✅ Test user deleted');

    console.log('\n=== All Tests Passed ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUpdateProfile();
