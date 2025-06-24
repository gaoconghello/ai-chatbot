import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openrouter('deepseek/deepseek-chat'), // 支持视觉和工具调用的主要聊天模型
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouter('deepseek/deepseek-chat'), // 推理模型，适合复杂思考任务
          middleware: extractReasoningMiddleware({ tagName: 'thinking' }),
        }),
        'title-model': openrouter('deepseek/deepseek-chat'), // 轻量级模型，适合生成标题
        'artifact-model': openrouter('deepseek/deepseek-chat'), // 代码和结构化输出生成
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'), // 保留 OpenAI 图像生成模型
      },
    });
