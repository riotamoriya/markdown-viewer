const crypto = require('crypto');

const password = process.argv[2];
if (!password) {
  console.error('使用方法: node generate-password-hash.js YOUR_PASSWORD');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Generated hash:', hash);
console.log('Add this to your .env.local:');
console.log(`NEXT_PUBLIC_HASHED_PASSWORD=${hash}`);