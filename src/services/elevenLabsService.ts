interface VoiceConfig {
  voiceId: string;
  modelId: string;
  stability?: number;
  similarityBoost?: number;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceConfig: VoiceConfig;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.defaultVoiceConfig = {
      voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel
      modelId: import.meta.env.VITE_ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1',
      stability: 0.5,
      similarityBoost: 0.5
    };

    if (import.meta.env.VITE_DEBUG_MODE === 'true' && this.isConfigured()) {
      console.log('🔊 ElevenLabs Service initialized');
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== '' && this.apiKey !== 'your_elevenlabs_api_key_here';
  }

  async textToSpeech(text: string, voiceConfig?: Partial<VoiceConfig>): Promise<Blob | null> {
    if (!this.isConfigured()) {
      console.warn('⚠️ ElevenLabs not configured');
      return null;
    }

    const config = { ...this.defaultVoiceConfig, ...voiceConfig };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: config.modelId,
          voice_settings: {
            stability: config.stability,
            similarity_boost: config.similarityBoost
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('🔊 Audio generated successfully');
      }

      return audioBlob;
    } catch (error) {
      console.error('❌ ElevenLabs API error:', error);
      return null;
    }
  }

  async playAudio(text: string, voiceConfig?: Partial<VoiceConfig>): Promise<void> {
    const audioBlob = await this.textToSpeech(text, voiceConfig);
    
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play();
      });
    }
  }

  async getVoices(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('❌ Failed to fetch voices:', error);
      return [];
    }
  }
}

export const elevenLabsService = new ElevenLabsService();