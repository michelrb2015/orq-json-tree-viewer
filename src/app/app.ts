import { Component, signal } from '@angular/core';
import { JsonTreeViewer } from './json-tree-viewer/json-tree-viewer';

@Component({
  selector: 'app-root',
  imports: [JsonTreeViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('orq-json-viewer');
  
  sampleData = {
    type: "reasoning",
    text: "**Defining LLM**\n\nI need to provide a concise definition of LLM, which stands for Large Language Model. It's an AI model designed to understand and generate natural language, trained on extensive datasets. I'll briefly mention the context of Langfuse, particularly regarding LLMs in evaluation and observability. There's no need to quote any documents, so I'll keep my response focused and clear. I can also offer to explain how Langfuse relates to LLMs if needed.",
    providerMetadata: {
      openai: {
        itemId: "rs_68b6fc25aaa88196a7a672e3da5dc2c9016f578e6d651fa0",
        reasoningEncryptedContent: null
      }
    },
    metadata: {
      gen_ai: {
        operation: 1,
        name: "OpenAI Chat Completion",
        usage: {
          prompt_tokens: 12,
          completion_tokens: 61,
          total_tokens: 73,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
            accepted_prediction_tokens: 0,
            rejected_prediction_tokens: 0,
            audio_tokens: 0
          }
        },
        system_fingerprint: "fp_560af6e559",
        object: "chat.completion"
      }
    },
    created: 1730779929,
    model: "gpt-4o-mini-2024-07-18",
    config: {
      temperature: 0.7,
      maxTokens: 150,
      topP: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1
    },
    features: ["streaming", "function_calling", "vision"],
    performance: {
      latency: 245.67,
      throughput: 1523.4,
      errorRate: 0.002
    },
    tags: ["production", "v2.1.0", "stable"],
    isActive: true,
    nullValue: null,
    arrayExample: [
      "LLM stands for Large Language Model",
      42,
      true,
      { nested: "value", depth: 2 },
      ["deeply", "nested", "array"]
    ]
  };
}
