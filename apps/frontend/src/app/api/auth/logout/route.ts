import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Forward the request to your backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Logout failed' },
        { status: response.status }
      );
    }

    // Clear the auth cookies
    const cookieOptions = 'Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
    const headers = new Headers();
    headers.append('Set-Cookie', `accessToken=; ${cookieOptions}`);
    headers.append('Set-Cookie', `refreshToken=; ${cookieOptions}`);

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { headers, status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}