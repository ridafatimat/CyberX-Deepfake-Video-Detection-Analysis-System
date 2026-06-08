import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { analysisId, userId } = await request.json();

    if (!analysisId || !userId) {
      return NextResponse.json(
        { error: 'Analysis ID and User ID required' },
        { status: 400 }
      );
    }

    // In production, delete from database
    // For now, just confirm deletion - client will handle localStorage
    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
      analysisId
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
