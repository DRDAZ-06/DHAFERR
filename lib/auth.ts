import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const ADMIN_USERNAME_HASH = process.env.ADMIN_USERNAME_HASH || '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Hash a password (use this to generate the hash for .env.local)
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Check if user is authenticated (server-side)
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    return false;
  }
  
  const payload = verifyToken(token.value);
  return !!payload;
}

// Verify admin credentials (username + password)
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  // For development without env vars set
  if (!ADMIN_USERNAME_HASH || !ADMIN_PASSWORD_HASH) {
    console.warn('WARNING: No ADMIN credentials set in environment variables!');
    const fallbackUsername = 'daz';
    const fallbackPassword = 'daz';
    return username === fallbackUsername && password === fallbackPassword;
  }
  
  // Verify both username and password
  const usernameValid = await verifyPassword(username, ADMIN_USERNAME_HASH);
  const passwordValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  
  return usernameValid && passwordValid;
}
