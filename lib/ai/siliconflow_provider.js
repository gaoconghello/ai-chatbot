/**
 * SiliconFlow AI SDK Provider for Node.js
 *
 * @typedef {Object} SiliconFlowProviderSettings
 * @property {string} [baseURL] - Base URL for the SiliconFlow API calls
 * @property {string} [apiKey] - API key for authenticating requests
 * @property {Record<string, string>} [headers] - Custom headers to include in the requests
 * @property {typeof fetch} [fetch] - Custom fetch implementation
 *
 * @typedef {Object} SiliconFlowChatSettings
 * @property {boolean} [parallelToolCalls] - Whether to enable parallel function calling during tool use. Default to true
 * @property {string} [user] - A unique identifier representing your end-user
 * @property {boolean} [enableThinking] - Enable thinking process for reasoning models
 * @property {number} [thinkingBudget] - Budget for thinking process
 * @property {number} [minP] - Minimum probability for token selection
 * @property {number} [topK] - Top-k sampling parameter
 */

class SiliconFlowChatLanguageModel {
  constructor(modelId, settings, config) {
    this.specificationVersion = 'v1';
    this.defaultObjectGenerationMode = 'tool';
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  get provider() {
    return 'siliconflow';
  }

  async doGenerate(options) {
    const {
      prompt,
      maxTokens,
      temperature,
      topP,
      frequencyPenalty,
      presencePenalty,
      stopSequences,
      seed,
    } = options;

    const body = {
      model: this.modelId,
      messages: prompt,
      stream: false,
    };

    // 只添加非 undefined 的必要和可选参数
    if (maxTokens !== undefined) body.max_tokens = maxTokens;
    body.temperature = temperature ?? 0.7;
    if (topP !== undefined) body.top_p = topP;
    if (this.settings.topK !== undefined) body.top_k = this.settings.topK;
    if (frequencyPenalty !== undefined)
      body.frequency_penalty = frequencyPenalty;
    if (presencePenalty !== undefined) body.presence_penalty = presencePenalty;
    if (stopSequences !== undefined) body.stop = stopSequences;
    if (seed !== undefined) body.seed = seed;
    if (this.settings.user !== undefined) body.user = this.settings.user;
    if (this.settings.parallelToolCalls !== undefined)
      body.parallel_tool_calls = this.settings.parallelToolCalls;

    // SiliconFlow 特定参数 - 只有明确设置时才包含
    if (this.settings.enableThinking !== undefined)
      body.enable_thinking = this.settings.enableThinking;
    if (this.settings.thinkingBudget !== undefined)
      body.thinking_budget = this.settings.thinkingBudget;
    if (this.settings.minP !== undefined) body.min_p = this.settings.minP;

    const fetchImpl = this.config.fetch || globalThis.fetch;
    const response = await fetchImpl(
      `${this.config.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SiliconFlow API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestBody: body,
      });
      throw new Error(
        `SiliconFlow API error (${response.status}): ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format: no choices returned');
    }

    const choice = data.choices[0];

    return {
      text: choice.message?.content ?? '',
      toolCalls:
        choice.message?.tool_calls?.map((toolCall) => ({
          toolCallType: 'function',
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: toolCall.function.arguments,
        })) ?? [],
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
      rawCall: { rawPrompt: body, rawSettings: {} },
    };
  }

  async doStream(options) {
    const {
      prompt,
      maxTokens,
      temperature,
      topP,
      frequencyPenalty,
      presencePenalty,
      stopSequences,
      seed,
    } = options;

    const body = {
      model: this.modelId,
      messages: prompt,
      stream: true,
    };

    // 只添加非 undefined 的必要和可选参数
    if (maxTokens !== undefined) body.max_tokens = maxTokens;
    body.temperature = temperature ?? 0.7;
    if (topP !== undefined) body.top_p = topP;
    if (this.settings.topK !== undefined) body.top_k = this.settings.topK;
    if (frequencyPenalty !== undefined)
      body.frequency_penalty = frequencyPenalty;
    if (presencePenalty !== undefined) body.presence_penalty = presencePenalty;
    if (stopSequences !== undefined) body.stop = stopSequences;
    if (seed !== undefined) body.seed = seed;
    if (this.settings.user !== undefined) body.user = this.settings.user;
    if (this.settings.parallelToolCalls !== undefined)
      body.parallel_tool_calls = this.settings.parallelToolCalls;

    // SiliconFlow 特定参数 - 只有明确设置时才包含
    if (this.settings.enableThinking !== undefined)
      body.enable_thinking = this.settings.enableThinking;
    if (this.settings.thinkingBudget !== undefined)
      body.thinking_budget = this.settings.thinkingBudget;
    if (this.settings.minP !== undefined) body.min_p = this.settings.minP;

    const fetchImpl = this.config.fetch || globalThis.fetch;
    const response = await fetchImpl(
      `${this.config.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SiliconFlow API Stream Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestBody: body,
      });
      throw new Error(
        `SiliconFlow API error (${response.status}): ${response.statusText} - ${errorText}`,
      );
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return {
      stream: response.body.pipeThrough(new TextDecoderStream()).pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            const lines = chunk.split('\n');
            for (const line of lines) {
              const trimmedLine = line.trim();

              if (trimmedLine === '') continue;
              if (trimmedLine === 'data: [DONE]') continue;
              if (!trimmedLine.startsWith('data: ')) continue;

              try {
                const jsonStr = trimmedLine.slice(6); // 移除 "data: " 前缀
                const data = JSON.parse(jsonStr);

                if (data.choices?.[0]) {
                  const choice = data.choices[0];
                  const delta = choice.delta;

                  if (delta?.content) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: delta.content,
                    });
                  }

                  if (choice.finish_reason) {
                    controller.enqueue({
                      type: 'finish',
                      finishReason: choice.finish_reason,
                      usage: {
                        promptTokens: data.usage?.prompt_tokens ?? 0,
                        completionTokens: data.usage?.completion_tokens ?? 0,
                      },
                    });
                  }
                }
              } catch (error) {
                console.warn('Failed to parse SSE data:', trimmedLine, error);
              }
            }
          },
        }),
      ),
      rawCall: { rawPrompt: body, rawSettings: {} },
    };
  }
}

/**
 * Create a SiliconFlow provider instance.
 * @param {SiliconFlowProviderSettings} [options={}] - Provider settings
 * @returns {SiliconFlowProvider} SiliconFlow provider instance
 */
export function createSiliconFlow(options = {}) {
  const baseURL = options.baseURL ?? 'https://api.siliconflow.cn/v1';
  const apiKey = options.apiKey ?? process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    throw new Error(
      'SiliconFlow API key is required. Set SILICONFLOW_API_KEY environment variable or pass apiKey option.',
    );
  }

  const config = {
    baseURL,
    apiKey,
    headers: options.headers,
    fetch: options.fetch,
  };

  const createModel = (modelId, settings = {}) =>
    new SiliconFlowChatLanguageModel(modelId, settings, config);

  const provider = (modelId, settings) => createModel(modelId, settings);

  provider.chat = createModel;
  provider.languageModel = createModel;

  return provider;
}

/**
 * Default SiliconFlow provider instance.
 * Only available if SILICONFLOW_API_KEY environment variable is set.
 */
export const siliconflow = process.env.SILICONFLOW_API_KEY
  ? createSiliconFlow()
  : null;

/**
 * @deprecated Use `createSiliconFlow` instead.
 */
export class SiliconFlow {
  constructor(options = {}) {
    this.baseURL = options.baseURL ?? 'https://api.siliconflow.cn/v1';
    this.apiKey = options.apiKey ?? process.env.SILICONFLOW_API_KEY ?? '';
    this.headers = options.headers;

    if (!this.apiKey) {
      throw new Error('SiliconFlow API key is required');
    }
  }

  chat(modelId, settings = {}) {
    return new SiliconFlowChatLanguageModel(modelId, settings, {
      baseURL: this.baseURL,
      apiKey: this.apiKey,
      headers: this.headers,
    });
  }
}
