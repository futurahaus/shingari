import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all query parameters
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const expiresIn = searchParams.get('expires_in');
    const expiresAt = searchParams.get('expires_at');
    const tokenType = searchParams.get('token_type');

    if (!accessToken) {
      return NextResponse.json(
        { message: 'No access token provided' },
        { status: 400 }
      );
    }

    // Construct backend URL with all parameters
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendApiUrl = new URL(`${backendUrl}/auth/verify-email`);

    // Add all parameters to the backend URL
    if (accessToken) backendApiUrl.searchParams.append('access_token', accessToken);
    if (refreshToken) backendApiUrl.searchParams.append('refresh_token', refreshToken);
    if (type) backendApiUrl.searchParams.append('type', type);
    if (expiresIn) backendApiUrl.searchParams.append('expires_in', expiresIn);
    if (expiresAt) backendApiUrl.searchParams.append('expires_at', expiresAt);
    if (tokenType) backendApiUrl.searchParams.append('token_type', tokenType);

    const response = await fetch(backendApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === 'otp_expired') {
        return NextResponse.json(
          { message: 'Verification link has expired. Please request a new one.' },
          { status: 403 }
        );
      }
      throw new Error(data.message || 'Failed to verify email');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      {
        message: error instanceof Error
          ? error.message
          : 'Failed to verify email. Please try again or request a new verification link.'
      },
      { status: 500 }
    );
  }
}