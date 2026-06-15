import axios from 'axios';

const OLLAMA_API_URL = 'http://localhost:11434/api';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: Message[];
  stream?: boolean;
}

export interface ChatResponse {
  message: Message;
  done: boolean;
}

class OllamaService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: OLLAMA_API_URL,
      timeout: 60000,
    });
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    try {
      const response = await this.api.post('/chat', {
        model: options.model,
        messages: options.messages,
        stream: options.stream || false,
      });
      return response.data;
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw error;
    }
  }

  async chatStream(
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await this.api.post('/chat', {
        model: options.model,
        messages: options.messages,
        stream: true,
      }, {
        responseType: 'stream',
      });

      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const data = JSON.parse(line);
            if (data.message && data.message.content) {
              onChunk(data.message.content);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        });
      });
    } catch (error) {
      console.error('Ollama Stream Error:', error);
      throw error;
    }
  }

  async generate(prompt: string, model: string = 'llama3'): Promise<string> {
    try {
      const response = await this.api.post('/generate', {
        model,
        prompt,
        stream: false,
      });
      return response.data.response;
    } catch (error) {
      console.error('Ollama Generate Error:', error);
      throw error;
    }
  }

  async listModels(): Promise<any[]> {
    try {
      const response = await this.api.get('/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('Ollama List Models Error:', error);
      throw error;
    }
  }
}

export default new OllamaService();
