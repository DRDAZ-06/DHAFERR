const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash for "admin123":');
  console.log(hash);
  console.log('\nAdd this to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

generateHash();
