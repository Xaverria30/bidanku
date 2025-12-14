/**
 * Test API endpoint with search parameters
 */

const baseURL = 'http://localhost:5000/api';

// You need to replace this token with a valid token from your login
const token = 'YOUR_AUTH_TOKEN_HERE';

async function testEndpoint() {
  try {
    console.log('=== Testing API Endpoint ===\n');

    // Test 1: Without filters
    console.log('1. GET /api/pemeriksaan (no filters)');
    let url = `${baseURL}/pemeriksaan`;
    console.log('   URL:', url);
    let response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Results:', data.data?.length || 0, 'records\n');

    // Test 2: With jenis_layanan only
    console.log('2. GET /api/pemeriksaan?jenis_layanan=Kunjungan+Pasien');
    url = `${baseURL}/pemeriksaan?jenis_layanan=Kunjungan+Pasien`;
    console.log('   URL:', url);
    response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Results:', data.data?.length || 0, 'records');
    if (data.data) {
      data.data.forEach(item => {
        console.log('     -', item.nama_pasien, '|', item.jenis_layanan);
      });
    }
    console.log();

    // Test 3: With search only
    console.log('3. GET /api/pemeriksaan?search=nurul');
    url = `${baseURL}/pemeriksaan?search=nurul`;
    console.log('   URL:', url);
    response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Results:', data.data?.length || 0, 'records');
    if (data.data) {
      data.data.forEach(item => {
        console.log('     -', item.nama_pasien, '|', item.jenis_layanan);
      });
    }
    console.log();

    // Test 4: Combined
    console.log('4. GET /api/pemeriksaan?jenis_layanan=Kunjungan+Pasien&search=nurul');
    url = `${baseURL}/pemeriksaan?jenis_layanan=Kunjungan+Pasien&search=nurul`;
    console.log('   URL:', url);
    response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Results:', data.data?.length || 0, 'records');
    if (data.data) {
      data.data.forEach(item => {
        console.log('     -', item.nama_pasien, '|', item.jenis_layanan);
      });
    }

    console.log('\n=== Check server console for debug logs ===');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Note: This test requires Node.js 18+ for fetch API
// Or install node-fetch: npm install node-fetch
testEndpoint();
