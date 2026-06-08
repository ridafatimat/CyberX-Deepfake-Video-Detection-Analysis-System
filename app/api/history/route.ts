import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'date';
    const filterStatus = request.nextUrl.searchParams.get('filterStatus');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return empty array - client will manage localStorage
    const analyses = [];

    return NextResponse.json({
      analyses,
      total: 0,
      sortBy,
      filterStatus
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
