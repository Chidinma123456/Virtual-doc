import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

interface BedrockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BedrockResponse {
  content: string;
  medicalEntities?: { text: string; type: string; confidence: number }[];
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

class BedrockService {
  private client: BedrockRuntimeClient | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const config: BedrockConfig = {
        region: (import.meta as any).env.VITE_AWS_REGION || 'us-east-1',
        accessKeyId: (import.meta as any).env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: (import.meta as any).env.VITE_AWS_SECRET_ACCESS_KEY || ''
      };

      console.log('🔧 AWS Bedrock Configuration:', {
        region: config.region,
        hasAccessKey: !!config.accessKeyId,
        hasSecretKey: !!config.secretAccessKey,
        accessKeyLength: config.accessKeyId.length,
        secretKeyLength: config.secretAccessKey.length
      });

      if (config.accessKeyId && config.secretAccessKey) {
        this.client = new BedrockRuntimeClient({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
          }
        });
        this.isConfigured = true;
        console.log('✅ AWS Bedrock initialized successfully');
        console.log('🌍 Region:', config.region);
      } else {
        console.warn('⚠️ AWS Bedrock credentials not found in environment variables');
        console.log('📋 Expected environment variables:');
        console.log('   - VITE_AWS_REGION');
        console.log('   - VITE_AWS_ACCESS_KEY_ID');
        console.log('   - VITE_AWS_SECRET_ACCESS_KEY');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AWS Bedrock:', error);
      this.isConfigured = false;
    }
  }

  async generateMedicalResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[] = [],
    hasImages: boolean = false
  ): Promise<BedrockResponse> {
    console.log('🔍 Bedrock Service - Attempting to generate response...');
    console.log('🔧 Service configured:', this.isConfigured);
    console.log('🔧 Client exists:', !!this.client);
    
    if (!this.isConfigured || !this.client) {
      console.warn('⚠️ AWS Bedrock not configured, using fallback response');
      return this.getFallbackResponse(userMessage);
    }

    try {
      console.log('🚀 Making AWS Bedrock API call...');
      
      const systemPrompt = `You are Dr. Ava, an empathetic AI health assistant for VirtuDoc telemedicine platform. 

GUIDELINES:
- Provide compassionate, personalized medical guidance
- Use plain language, avoid complex medical jargon
- Always recommend professional medical care for serious symptoms
- Assess urgency levels: low, medium, high, critical
- Be supportive and reassuring while being medically responsible
- Ask follow-up questions to better understand symptoms
- Never provide definitive diagnoses - only guidance and recommendations

RESPONSE FORMAT:
- Start with empathy and acknowledgment
- Ask clarifying questions when needed
- Provide clear, actionable guidance
- Include urgency assessment
- Recommend next steps (self-care, doctor visit, emergency care)

Current conversation context: The user is describing their symptoms through our telemedicine platform.`;

      // Build conversation context
      const messages: ChatMessage[] = [
        { role: 'user', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const prompt = this.buildClaudePrompt(messages, hasImages);
      console.log('📝 Built prompt for Claude');

      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      console.log('📡 Sending request to AWS Bedrock...');
      const response = await this.client.send(command);
      console.log('✅ Received response from AWS Bedrock');
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      console.log('📄 Parsed response body:', responseBody);
      
      const content = responseBody.content[0].text;
      const urgencyLevel = this.extractUrgencyLevel(content, userMessage);

      console.log('🎯 Generated AI response successfully');
      return {
        content,
        urgencyLevel,
        medicalEntities: this.extractMedicalEntities(userMessage)
      };

    } catch (error) {
      console.error('❌ Bedrock API error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Return fallback response on error
      console.warn('🔄 Falling back to hardcoded response due to API error');
      return this.getFallbackResponse(userMessage);
    }
  }

  private buildClaudePrompt(messages: ChatMessage[], hasImages: boolean): string {
    let prompt = '';
    
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });

    if (hasImages) {
      prompt += 'Note: The user has shared medical images. Please acknowledge this and provide guidance based on the described symptoms.\n\n';
    }

    prompt += 'Assistant: ';
    return prompt;
  }

  private extractUrgencyLevel(aiResponse: string, userMessage: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();

    // Critical keywords
    const criticalKeywords = [
      'chest pain', 'difficulty breathing', 'severe pain', 'blood', 'unconscious',
      'emergency', 'call 911', 'immediate medical attention', 'life-threatening'
    ];

    // High priority keywords
    const highKeywords = [
      'fever', 'vomiting', 'severe headache', 'dizziness', 'shortness of breath',
      'see a doctor soon', 'medical attention', 'concerning'
    ];

    // Medium priority keywords
    const mediumKeywords = [
      'headache', 'nausea', 'fatigue', 'cough', 'monitor', 'watch'
    ];

    if (criticalKeywords.some(keyword => 
      lowerResponse.includes(keyword) || lowerMessage.includes(keyword)
    )) {
      return 'critical';
    }

    if (highKeywords.some(keyword => 
      lowerResponse.includes(keyword) || lowerMessage.includes(keyword)
    )) {
      return 'high';
    }

    if (mediumKeywords.some(keyword => 
      lowerResponse.includes(keyword) || lowerMessage.includes(keyword)
    )) {
      return 'medium';
    }

    return 'low';
  }

  private extractMedicalEntities(text: string): { text: string; type: string; confidence: number }[] {
    // Simple keyword extraction - in production, use AWS Comprehend Medical
    const entities: { text: string; type: string; confidence: number }[] = [];
    const symptoms = ['headache', 'fever', 'cough', 'nausea', 'pain', 'fatigue', 'dizziness'];
    const lowerText = text.toLowerCase();

    symptoms.forEach(symptom => {
      if (lowerText.includes(symptom)) {
        entities.push({
          text: symptom,
          type: 'symptom',
          confidence: 0.8
        });
      }
    });

    return entities;
  }

  private getFallbackResponse(userMessage: string): BedrockResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart')) {
      return {
        content: "I understand you're experiencing chest pain. This could be serious. Can you describe the pain more? Is it sharp, dull, or crushing? Does it radiate to your arm, jaw, or back? I recommend seeking immediate medical attention if the pain is severe.",
        urgencyLevel: 'high'
      };
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head')) {
      return {
        content: "I see you have a headache. Can you tell me more about it? How long have you had it? Is it throbbing, sharp, or dull? Any nausea or sensitivity to light? This will help me provide better guidance.",
        urgencyLevel: 'medium'
      };
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return {
        content: "A fever can indicate your body is fighting an infection. Have you taken your temperature? Any other symptoms like chills, body aches, or fatigue? How long have you had the fever?",
        urgencyLevel: 'medium'
      };
    }
    
    return {
      content: "Thank you for sharing that information. Can you provide more details about your symptoms? When did they start? How severe are they on a scale of 1-10? Any other symptoms you've noticed? I'm here to help guide you toward the best care.",
      urgencyLevel: 'low'
    };
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      service: 'AWS Bedrock Claude 3 Haiku',
      region: (import.meta as any).env.VITE_AWS_REGION || 'us-east-1'
    };
  }
}

export const bedrockService = new BedrockService();
export default bedrockService;
