import { env } from 'node:process';
import { ProxyAgent } from 'undici';

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

  const proxy = 'http://127.0.0.1:7890';

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
      // @ts-expect-error - The `dispatcher` property is not in the default `fetch` type, but it's used by undici.
      dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
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
