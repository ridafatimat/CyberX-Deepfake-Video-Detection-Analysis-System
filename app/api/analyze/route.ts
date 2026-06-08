import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock ML analysis service - will be replaced with actual model
async function analyzeVideoForDeepfake(videoPath: string, videoBuffer: Buffer): Promise<{
  deepfakeScore: number;
  confidence: number;
  frameAnalysis: Array<{ frame: number; score: number }>;
  detectedArtifacts: string[];
}> {
  // Simulate ML processing delay with shorter time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate realistic mock results
  const deepfakeScore = Math.random();
  const confidence = 0.85 + Math.random() * 0.14;
  
  const detectedArtifacts = [];
  if (deepfakeScore > 0.6) {
    detectedArtifacts.push('Facial blending artifacts');
    if (Math.random() > 0.5) detectedArtifacts.push('Unnatural eye movement');
  }

  const frameAnalysis = Array.from({ length: 10 }, (_, i) => ({
    frame: (i + 1) * 10,
    score: Math.random() * 0.3 + (deepfakeScore * 0.7)
  }));

  return {
    deepfakeScore: Math.round(deepfakeScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    frameAnalysis,
    detectedArtifacts
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for embedded environment)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please upload a smaller video.` },
        { status: 413 }
      );
    }

    const analysisId = uuidv4();
    
    try {
      // Don't actually read the buffer for the embedded version
      // Just use the file metadata since we're mocking the analysis anyway
      // In production, this would process the actual video buffer

      // Analyze video
      const analysis = await analyzeVideoForDeepfake(
        file.name,
        Buffer.alloc(0) // Mock buffer for embedded environment
      );

      const result = {
        id: analysisId,
        userId,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        analysisId,
        deepfakeScore: analysis.deepfakeScore,
        confidence: analysis.confidence,
        frameAnalysis: analysis.frameAnalysis,
        detectedArtifacts: analysis.detectedArtifacts,
        status: analysis.deepfakeScore > 0.6 ? 'threat' : 'clean',
        metadata: {
          fileType: file.type,
          duration: '~3 seconds (mock)',
          resolution: '1920x1080 (mock)'
        }
      };

      // Store in localStorage (client will handle this)
      // In production, this would be stored in a database
      return NextResponse.json(result, { status: 200 });
    } catch (analysisError) {
      console.error('[v0] Analysis processing error:', analysisError);
      return NextResponse.json(
        { error: 'Failed to process video analysis' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[v0] Request parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse request' },
      { status: 400 }
    );
  }
}
