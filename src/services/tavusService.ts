interface AvatarConfig {
  avatarId: string;
  voiceId?: string;
  background?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface VideoGenerationRequest {
  script: string;
  avatarId: string;
  voiceId?: string;
  background?: string;
  callback_url?: string;
}

class TavusService {
  private apiKey: string;
  private baseUrl = 'https://tavusapi.com/v2';
  private defaultAvatarConfig: AvatarConfig;

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_API_KEY || '';
    this.defaultAvatarConfig = {
      avatarId: import.meta.env.VITE_TAVUS_AVATAR_ID || '',
      background: '#f8fafc',
      dimensions: {
        width: 512,
        height: 512
      }
    };

    if (import.meta.env.VITE_DEBUG_MODE === 'true' && this.isConfigured()) {
      console.log('🎥 Tavus Service initialized');
    }
  }

  isConfigured(): boolean {
    return this.apiKey !== '' && 
           this.apiKey !== 'your_tavus_api_key_here' &&
           this.defaultAvatarConfig.avatarId !== '' &&
           this.defaultAvatarConfig.avatarId !== 'your_avatar_id_here';
  }

  async generateVideo(script: string, config?: Partial<AvatarConfig>): Promise<string | null> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Tavus not configured');
      return null;
    }

    const avatarConfig = { ...this.defaultAvatarConfig, ...config };

    const requestBody: VideoGenerationRequest = {
      script: script,
      avatarId: avatarConfig.avatarId,
      background: avatarConfig.background
    };

    if (avatarConfig.voiceId) {
      requestBody.voiceId = avatarConfig.voiceId;
    }

    try {
      const response = await fetch(`${this.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('🎥 Video generation started:', data.video_id);
      }

      return data.video_id;
    } catch (error) {
      console.error('❌ Tavus API error:', error);
      return null;
    }
  }

  async getVideoStatus(videoId: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get video status:', error);
      return null;
    }
  }

  async getAvatars(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/avatars`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return data.avatars || [];
    } catch (error) {
      console.error('❌ Failed to fetch avatars:', error);
      return [];
    }
  }

  async generateDrAvaVideo(medicalResponse: string): Promise<string | null> {
    const script = `Hello, I'm Dr. Ava, your virtual health assistant. ${medicalResponse}`;
    
    return await this.generateVideo(script, {
      background: '#f0f9ff', // Medical blue background
    });
  }
}

export const tavusService = new TavusService();