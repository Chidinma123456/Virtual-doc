import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

interface LLMConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  modelId?: string;
}

class LLMService {
  private client: BedrockRuntimeClient | null = null;
  private isConfigured = false;
  private modelId: string;

  constructor() {
    this.modelId = import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    const region = import.meta.env.VITE_AWS_REGION;
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('🔍 Checking environment variables:');
      console.log('- Region:', region ? '✅ Set' : '❌ Missing');
      console.log('- Access Key:', accessKeyId ? '✅ Set' : '❌ Missing');
      console.log('- Secret Key:', secretAccessKey ? '✅ Set' : '❌ Missing');
    }

    if (region && accessKeyId && secretAccessKey && 
        accessKeyId !== 'your_aws_access_key_here' && 
        secretAccessKey !== 'your_aws_secret_key_here' &&
        accessKeyId.length > 10 && 
        secretAccessKey.length > 10) {
      
      this.configure({
        region,
        accessKeyId,
        secretAccessKey,
        modelId: this.modelId
      });

      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('✅ Auto-configured from environment variables');
      }
    } else {
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('⚠️ Environment variables not properly set, manual configuration required');
      }
    }
  }

  configure(config: LLMConfig) {
    try {
      this.client = new BedrockRuntimeClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
      
      if (config.modelId) {
        this.modelId = config.modelId;
      }
      
      this.isConfigured = true;
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('✅ LLM Service configured successfully');
        console.log('- Region:', config.region);
        console.log('- Model:', this.modelId);
      }
    } catch (error) {
      console.error('❌ Failed to configure LLM service:', error);
      this.isConfigured = false;
    }
  }

  async generateResponse(userMessage: string, hasImages: boolean = false): Promise<string> {
    if (!this.isConfigured || !this.client) {
      return this.getFallbackResponse(userMessage, hasImages);
    }

    const drAvaPrompt = `You are Dr. Ava, an empathetic virtual health assistant. When a patient shares their symptoms, respond with:
- A friendly greeting addressing them personally
- A plain-language possible diagnosis or explanation
- Next steps (self-care recommendations or escalation to doctor)
- Reassurance and support

Keep responses concise (under 200 words), caring, and medically responsible. Always recommend seeing a doctor for serious symptoms.

Patient message: ${userMessage}${hasImages ? '\n\nNote: Patient has shared medical images for reference.' : ''}`;

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
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
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('🤖 Dr. Ava response generated successfully');
      }
      
      return responseBody.content[0].text || this.getFallbackResponse(userMessage, hasImages);
    } catch (error) {
      console.error('❌ LLM API error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('UnauthorizedOperation') || error.message?.includes('AccessDenied')) {
        return "I apologize, but I'm having trouble accessing my medical knowledge base due to authentication issues. Please ensure your AWS credentials have the necessary permissions for Bedrock access, or contact support for assistance.";
      } else if (error.message?.includes('ModelNotFound')) {
        return "I'm sorry, but the AI model I rely on isn't available right now. Please try again later or speak with one of our human healthcare providers.";
      }
      
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

  getConfiguration(): { region: string; hasCredentials: boolean; modelId: string; envConfigured: boolean } {
    const envConfigured = !!(
      import.meta.env.VITE_AWS_REGION &&
      import.meta.env.VITE_AWS_ACCESS_KEY_ID &&
      import.meta.env.VITE_AWS_SECRET_ACCESS_KEY &&
      import.meta.env.VITE_AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
      import.meta.env.VITE_AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here'
    );

    return {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      hasCredentials: this.isConfigured,
      modelId: this.modelId,
      envConfigured
    };
  }
}

export const llmService = new LLMService();