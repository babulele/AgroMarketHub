// Quick script to check if M-Pesa environment variables are loaded
require('dotenv').config();

console.log('\n=== M-Pesa Environment Variables Check ===\n');

const vars = {
  'MPESA_CONSUMER_KEY': process.env.MPESA_CONSUMER_KEY,
  'MPESA_CONSUMER_SECRET': process.env.MPESA_CONSUMER_SECRET,
  'MPESA_SHORTCODE': process.env.MPESA_SHORTCODE,
  'MPESA_PASSKEY': process.env.MPESA_PASSKEY,
  'MPESA_ENVIRONMENT': process.env.MPESA_ENVIRONMENT,
  'MPESA_CALLBACK_URL': process.env.MPESA_CALLBACK_URL,
};

let allSet = true;

for (const [key, value] of Object.entries(vars)) {
  if (value) {
    if (key === 'MPESA_CONSUMER_SECRET') {
      console.log(`✅ ${key}: SET (${value.length} characters)`);
    } else if (key === 'MPESA_PASSKEY') {
      console.log(`✅ ${key}: SET (${value.length} characters)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allSet = false;
  }
}

console.log('\n=== Summary ===');
if (allSet) {
  console.log('✅ All M-Pesa variables are set!');
} else {
  console.log('❌ Some M-Pesa variables are missing!');
  console.log('\nPlease check your backend/.env file:');
  console.log('1. File exists: backend/.env');
  console.log('2. Variable names are exact (case-sensitive)');
  console.log('3. No quotes around values');
  console.log('4. No spaces around = sign');
  console.log('5. Values are not empty');
}

console.log('\n');

