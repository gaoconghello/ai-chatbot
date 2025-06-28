import { speechToText } from '@/lib/ai/speechToText';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio, language = 'zh' } = body;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio data received.' },
        { status: 400 },
      );
    }

    // Convert base64 to Blob
    const matches = audio.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid audio data format.' },
        { status: 400 },
      );
    }
    const mimeType = matches[1];
    const base64Data = matches[2];
    const audioBuffer = Buffer.from(base64Data, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType });

    const extension = mimeType.split('/')[1]?.split(';')[0] ?? 'webm';

    const fileName = `audio.${extension}`;

    const transcribedText = await speechToText(audioBlob, fileName, language);
    console.log('Transcribed text:', transcribedText);

    return NextResponse.json({ text: transcribedText });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio.' },
      { status: 500 },
    );
  }
}
