import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ComprehendMedicalClient, DetectEntitiesV2Command } from '@aws-sdk/client-comprehendmedical';

// S3 Service for medical image storage
class S3Service {
  private client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    this.bucketName = import.meta.env.VITE_AWS_S3_BUCKET || '';
    this.initializeClient();
  }

  private initializeClient() {
    const region = import.meta.env.VITE_AWS_S3_REGION || import.meta.env.VITE_AWS_REGION;
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    if (region && accessKeyId && secretAccessKey && 
        accessKeyId !== 'your_aws_access_key_here' && 
        secretAccessKey !== 'your_aws_secret_key_here') {
      
      this.client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('☁️ S3 Service initialized');
      }
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.bucketName !== '';
  }

  async uploadMedicalImage(file: File, patientId: string): Promise<string | null> {
    if (!this.isConfigured() || !this.client) {
      console.warn('⚠️ S3 not configured');
      return null;
    }

    const key = `medical-images/${patientId}/${Date.now()}-${file.name}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
        Metadata: {
          'patient-id': patientId,
          'upload-timestamp': new Date().toISOString(),
          'hipaa-compliant': 'true'
        }
      });

      await this.client.send(command);
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('☁️ Medical image uploaded:', key);
      }

      return key;
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      return null;
    }
  }

  async getMedicalImageUrl(key: string): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    // In production, you'd generate a presigned URL
    // For now, return a placeholder
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}

// Comprehend Medical Service for NLP analysis
class ComprehendMedicalService {
  private client: ComprehendMedicalClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const region = import.meta.env.VITE_AWS_REGION;
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    if (region && accessKeyId && secretAccessKey && 
        accessKeyId !== 'your_aws_access_key_here' && 
        secretAccessKey !== 'your_aws_secret_key_here' &&
        import.meta.env.VITE_ENABLE_COMPREHEND_MEDICAL === 'true') {
      
      this.client = new ComprehendMedicalClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('🧠 Comprehend Medical Service initialized');
      }
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async analyzeMedicalText(text: string): Promise<any> {
    if (!this.isConfigured() || !this.client) {
      console.warn('⚠️ Comprehend Medical not configured');
      return null;
    }

    try {
      const command = new DetectEntitiesV2Command({
        Text: text
      });

      const response = await this.client.send(command);
      
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('🧠 Medical text analyzed');
      }

      return response.Entities;
    } catch (error) {
      console.error('❌ Comprehend Medical error:', error);
      return null;
    }
  }

  extractMedicalEntities(text: string): Promise<{
    conditions: string[];
    medications: string[];
    symptoms: string[];
    anatomy: string[];
  }> {
    return this.analyzeMedicalText(text).then(entities => {
      if (!entities) {
        return { conditions: [], medications: [], symptoms: [], anatomy: [] };
      }

      const conditions = entities.filter((e: any) => e.Category === 'MEDICAL_CONDITION').map((e: any) => e.Text);
      const medications = entities.filter((e: any) => e.Category === 'MEDICATION').map((e: any) => e.Text);
      const symptoms = entities.filter((e: any) => e.Category === 'SYMPTOM').map((e: any) => e.Text);
      const anatomy = entities.filter((e: any) => e.Category === 'ANATOMY').map((e: any) => e.Text);

      return { conditions, medications, symptoms, anatomy };
    });
  }
}

export const s3Service = new S3Service();
export const comprehendMedicalService = new ComprehendMedicalService();