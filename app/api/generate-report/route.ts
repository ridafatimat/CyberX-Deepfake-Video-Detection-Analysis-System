import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, PDFPage } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const analysisData = await request.json();

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();

    let yPosition = height - 50;

    // Title
    page.drawText('CyberX Analysis Report', {
      x: 50,
      y: yPosition,
      size: 24,
      color: rgb(0, 240, 255)
    });

    yPosition -= 40;

    // File Info
    page.drawText(`File: ${analysisData.fileName}`, {
      x: 50,
      y: yPosition,
      size: 12
    });
    yPosition -= 25;

    page.drawText(`Analysis Date: ${new Date(analysisData.uploadedAt).toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12
    });
    yPosition -= 40;

    // Results
    page.drawText('Analysis Results', {
      x: 50,
      y: yPosition,
      size: 16,
      color: rgb(0, 240, 255)
    });
    yPosition -= 30;

    const statusColor = analysisData.status === 'clean' 
      ? rgb(34, 197, 94)
      : rgb(239, 68, 68);

    page.drawText(`Status: ${analysisData.status.toUpperCase()}`, {
      x: 50,
      y: yPosition,
      size: 14,
      color: statusColor
    });
    yPosition -= 25;

    page.drawText(`Deepfake Score: ${(analysisData.deepfakeScore * 100).toFixed(2)}%`, {
      x: 50,
      y: yPosition,
      size: 12
    });
    yPosition -= 20;

    page.drawText(`Confidence: ${(analysisData.confidence * 100).toFixed(2)}%`, {
      x: 50,
      y: yPosition,
      size: 12
    });
    yPosition -= 30;

    if (analysisData.detectedArtifacts.length > 0) {
      page.drawText('Detected Artifacts:', {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(239, 68, 68)
      });
      yPosition -= 20;

      analysisData.detectedArtifacts.forEach((artifact: string) => {
        page.drawText(`• ${artifact}`, {
          x: 70,
          y: yPosition,
          size: 10
        });
        yPosition -= 15;
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CyberX-Report-${analysisData.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
