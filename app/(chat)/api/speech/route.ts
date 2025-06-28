import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio } = body;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio data received.' },
        { status: 400 },
      );
    }

    // 在这里，我们将模拟语音转文本的过程
    // 并将转换后的文本打印到控制台
    const transcribedText = `[Simulated STT]: ${audio.substring(0, 30)}...`;
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
