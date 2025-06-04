import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { message: 'No access token provided' },
        { status: 400 }
      );
    }

    // Forward the request to your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(
      `${backendUrl}/auth/verify-email?access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Check for specific error types
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