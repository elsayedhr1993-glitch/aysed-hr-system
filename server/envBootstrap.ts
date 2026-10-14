import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

if (process.env.VITE_USE_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}
