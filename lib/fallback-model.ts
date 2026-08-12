import { LanguageModelV4, LanguageModelV4CallOptions, LanguageModelV4StreamPart } from '@ai-sdk/provider';
import { getModelExhausted, setModelExhausted } from './rate-limit-bot';

export function createFallbackModel(models: LanguageModelV4[]): LanguageModelV4 {
  if (models.length === 0) throw new Error("No models provided for fallback");
  
  return {
    ...models[0],
    specificationVersion: 'v4',
    provider: 'fallback-provider',
    modelId: 'fallback-model',
    
    async doGenerate(options: LanguageModelV4CallOptions) {
      let lastError: any = null;
      for (const model of models) {
        try {
          const isExhausted = await getModelExhausted(model.modelId);
          if (isExhausted) {
             console.log(`Skipping exhausted model: ${model.modelId}`);
             continue;
          }
          return await model.doGenerate(options);
        } catch (error: any) {
          lastError = error;
          const statusCode = error?.statusCode || error?.lastError?.statusCode;
          if (statusCode === 429 || statusCode === 503 || statusCode === 403) {
            console.warn(`Model ${model.modelId} hit rate limit (${statusCode}). Falling back...`);
            await setModelExhausted(model.modelId, 60);
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    },

    async doStream(options: LanguageModelV4CallOptions) {
      let lastError: any = null;
      for (const model of models) {
        try {
          const isExhausted = await getModelExhausted(model.modelId);
          if (isExhausted) {
             console.log(`Skipping exhausted model: ${model.modelId}`);
             continue;
          }
          
          const streamResult = await model.doStream(options);
          
          // If we fell back, inject a notification chunk at the start of the stream
          if (model !== models[0]) {
             const originalStream = streamResult.stream;
             const reader = originalStream.getReader();
             
             const newStream = new ReadableStream<LanguageModelV4StreamPart>({
                async start(controller) {
                   controller.enqueue({ 
                      type: 'text-delta',
                      id: `fallback-${Date.now()}`,
                      delta: `[SYSTEM_NOTE: Primary model exhausted. Safely falling back to ${model.modelId}]\n\n` 
                   } as any);
                },
                async pull(controller) {
                   try {
                     const { done, value } = await reader.read();
                     if (done) {
                        controller.close();
                     } else {
                        controller.enqueue(value);
                     }
                   } catch (e) {
                     controller.error(e);
                   }
                },
                cancel(reason) {
                   reader.cancel(reason);
                }
             });
             
             return { ...streamResult, stream: newStream };
          }
          
          return streamResult;
        } catch (error: any) {
          lastError = error;
          const statusCode = error?.statusCode || error?.lastError?.statusCode;
          if (statusCode === 429 || statusCode === 503 || statusCode === 403) {
            console.warn(`Model ${model.modelId} hit rate limit (${statusCode}). Falling back...`);
            await setModelExhausted(model.modelId, 60);
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    }
  };
}
