import { env } from 'node:process';

export async function speechToText(
  audioBlob: Blob,
  filename: string,
  language?: string,
): Promise<string> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const formData = new FormData();
  formData.append('model', 'whisper-1');
  formData.append('file', audioBlob, filename);
  if (language) {
    formData.append('language', language);
  }


  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API Error:', errorText);
    throw new Error(
      `Speech-to-text API request failed with status ${response.status}: ${errorText}`,
    );
  }

  const result = await response.json();

  if (typeof result.text === 'string') {
    return result.text;
  } else {
    console.error('Unexpected response structure from OpenAI API:', result);
    throw new Error('Failed to extract text from speech-to-text API response.');
  }
}
