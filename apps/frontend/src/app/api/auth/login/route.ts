import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Login request received:', { email: body.email });

    // Forward the request to your backend server
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
    console.log('Forwarding request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);

    const data = await response.json();
    console.log('Backend response:', {
      success: response.ok,
      status: response.status,
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
      hasUser: !!data.user
    });

    if (!response.ok) {
      console.error('Login failed:', data);
      return NextResponse.json(
        { message: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Set cookies for the tokens
    const cookieOptions = 'Path=/; HttpOnly; SameSite=Strict';
    const headers = new Headers();
    headers.append('Set-Cookie', `accessToken=${data.accessToken}; ${cookieOptions}`);
    headers.append('Set-Cookie', `refreshToken=${data.refreshToken}; ${cookieOptions}`);

    return NextResponse.json(data, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}