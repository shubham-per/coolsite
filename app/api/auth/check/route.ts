import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const jwtSecret: string = JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = verify(token, jwtSecret) as any;

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401 }
    );
  }
}
