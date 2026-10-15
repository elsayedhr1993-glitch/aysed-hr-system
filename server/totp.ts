import crypto from 'crypto';

const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = input.replace(/=+$/g, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = alphabet.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** DIGITS).padStart(DIGITS, '0');
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function totpCode(secretBase32: string, now = Date.now()): string {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  return hotp(secret, counter);
}

export function verifyTotp(secretBase32: string, token: string, now = Date.now()): boolean {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  const normalized = String(token || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  for (const drift of [-1, 0, 1]) {
    if (hotp(secret, counter + drift) === normalized) return true;
  }
  return false;
}

export function totpKeyUri(secret: string, account: string): string {
  const label = encodeURIComponent(`Aysed HR:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=Aysed%20HR&digits=${DIGITS}&period=${STEP_SECONDS}`;
}
