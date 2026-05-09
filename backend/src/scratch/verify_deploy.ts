async function checkHealth() {
  const url = 'https://curavet-backend.onrender.com/api/health';
  console.log(`Checking health at: ${url}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('✅ DEPLOYMENT LIVE!');
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error: any) {
    console.error('❌ COULD NOT REACH SERVER:', error.message);
  }
}

checkHealth();
