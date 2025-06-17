// Core User Types
export type UserRole = 'patient' | 'healthworker' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cognitoId?: string;
  isVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Profile
export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  language: string;
  medicalHistory: MedicalHistoryItem[];
  allergies: string[];
  medications: string[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

// Symptom Session
export interface SymptomSession {
  id: string;
  patientId: string;
  transcript: ChatMessage[];
  timestamp: Date;
  entities: MedicalEntity[];
  aiSummary: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'escalated';
  language: string;
  audioFiles?: string[]; // S3 URLs
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  metadata?: {
    confidence?: number;
    entities?: MedicalEntity[];
  };
}

export interface MedicalEntity {
  text: string;
  category: 'MEDICATION' | 'MEDICAL_CONDITION' | 'ANATOMY' | 'SYMPTOM' | 'TIME_EXPRESSION';
  type: string;
  score: number;
  beginOffset: number;
  endOffset: number;
  attributes?: {
    type: string;
    score: number;
    relationshipScore?: number;
    id?: number;
  }[];
}

// Vitals Entry
export interface VitalsEntry {
  id: string;
  sessionId: string;
  healthWorkerId: string;
  patientId: string;
  vitals: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    oxygenSaturation?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    respiratoryRate?: number;
  };
  images: MedicalImage[];
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalImage {
  id: string;
  s3Key: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  analysisResults?: ImageAnalysisResult;
  metadata: {
    capturedAt: Date;
    deviceInfo?: string;
    location?: string;
  };
}

export interface ImageAnalysisResult {
  labels: {
    name: string;
    confidence: number;
  }[];
  medicalFindings?: {
    finding: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  flagged: boolean;
  flagReason?: string;
}

// Case Management
export interface Case {
  id: string;
  sessionId: string;
  patientId: string;
  healthWorkerId?: string;
  doctorId?: string;
  status: 'pending' | 'in-review' | 'reviewed' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  aiAnalysis: AIAnalysis;
  doctorNotes?: string;
  recommendations?: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  estimatedConsultTime?: number; // minutes
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface AIAnalysis {
  summary: string;
  possibleConditions: {
    condition: string;
    probability: number;
    reasoning: string;
  }[];
  recommendedActions: {
    action: string;
    urgency: 'immediate' | 'within-24h' | 'within-week' | 'routine';
    reasoning: string;
  }[];
  redFlags: string[];
  confidence: number;
  generatedAt: Date;
}

// Video Consultation
export interface VideoConsultation {
  id: string;
  caseId: string;
  patientId: string;
  doctorId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // minutes
  roomId: string;
  recordingUrl?: string;
  notes?: string;
  prescription?: Prescription[];
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refills: number;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'case-assigned' | 'urgent-case' | 'consultation-scheduled' | 'system-alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  expiresAt?: Date;
}

// Real-time Events
export interface WebSocketEvent {
  type: 'case-created' | 'case-updated' | 'vitals-submitted' | 'consultation-started' | 'notification';
  data: any;
  timestamp: Date;
  userId?: string;
  role?: UserRole;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface SymptomFormData {
  symptoms: string;
  duration: string;
  severity: number;
  additionalInfo?: string;
}

export interface VitalsFormData {
  patientId: string;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

// Configuration Types
export interface AppConfig {
  aws: {
    region: string;
    cognitoUserPoolId: string;
    cognitoClientId: string;
    s3Bucket: string;
    apiGatewayUrl: string;
  };
  integrations: {
    elevenLabs: {
      apiKey: string;
      voiceId: string;
    };
    tavus: {
      apiKey: string;
      avatarId: string;
    };
  };
  features: {
    mfaRequired: boolean;
    videoConsultEnabled: boolean;
    voiceInputEnabled: boolean;
    imageAnalysisEnabled: boolean;
  };
}

// Error Types
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;