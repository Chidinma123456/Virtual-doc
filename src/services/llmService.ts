import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

interface LLMConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

class LLMService {
  private client: BedrockRuntimeClient | null = null;
  private isConfigured = false;

  configure(config: LLMConfig) {
    try {
      this.client = new BedrockRuntimeClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure LLM service:', error);
      this.isConfigured = false;
    }
  }

  async generateResponse(userMessage: string, hasImages: boolean = false): Promise<string> {
    if (!this.isConfigured || !this.client) {
      return this.getFallbackResponse(userMessage, hasImages);
    }

    const drAvaPrompt = `You are Dr. Ava, an empathetic virtual health assistant. When a patient shares their symptoms, respond with:
- A friendly greeting
- A plain-language possible diagnosis
- Next steps (self-care or escalation to doctor)

Keep responses concise, caring, and medically responsible. Always recommend seeing a doctor for serious symptoms.

Patient message: ${userMessage}${hasImages ? '\n\nNote: Patient has shared medical images for reference.' : ''}`;

    try {
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: drAvaPrompt
            }
          ]
        })
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.content[0].text || this.getFallbackResponse(userMessage, hasImages);
    } catch (error) {
      console.error('LLM API error:', error);
      return this.getFallbackResponse(userMessage, hasImages);
    }
  }

  private getFallbackResponse(userMessage: string, hasImages: boolean): string {
    const responses = [
      "Hello! I'm Dr. Ava, your virtual health assistant. Thank you for sharing your symptoms with me. Based on what you've described, this could be related to several common conditions. I recommend monitoring your symptoms closely and considering a consultation with one of our healthcare providers if they persist or worsen.",
      
      "Hi there! I understand your concerns about these symptoms. While I can provide general guidance, it's important to have a proper medical evaluation. Based on your description, this might be something that would benefit from professional medical attention. Would you like me to help you schedule a consultation?",
      
      hasImages ? "Thank you for sharing those images along with your symptom description. Visual information can be very helpful for assessment. Based on what you've shared, I'd recommend having this evaluated by a healthcare professional who can provide a proper diagnosis and treatment plan." : "I appreciate you taking the time to describe your symptoms in detail. While these could be related to several conditions, a proper medical examination would be the best way to determine the exact cause and appropriate treatment.",
      
      "Hello! As Dr. Ava, I want to help you understand your symptoms better. What you're experiencing could have various causes, and while some might be manageable with self-care, others may require medical attention. I'd be happy to help you connect with one of our doctors for a more thorough evaluation."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

export const llmService = new LLMService();