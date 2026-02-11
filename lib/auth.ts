import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const jwtSecret: string = JWT_SECRET;

export function requireAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const decoded = verify(token, jwtSecret) as any;
    if (!decoded || !decoded.email) {
      throw new Error('Invalid token');
    }
    return decoded;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

export function createAuthError() {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}
