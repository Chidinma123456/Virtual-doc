// User Roles
export type UserRole = 'patient' | 'worker' | 'doctor';

// Base User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  mfaEnabled?: boolean;
}

// Patient Profile
export interface PatientProfile extends User {
  role: 'patient';
  dateOfBirth: string;
  contactNumber: string;
  language: string;
  medicalHistory: MedicalHistoryEntry[];
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
}

export interface MedicalHistoryEntry {
  id: string;
  condition: string;
  diagnosedDate: string;
  medications: string[];
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
}

// Health Worker Profile
export interface HealthWorkerProfile extends User {
  role: 'worker';
  licenseNumber: string;
  specialization: string[];
  assignedFacility: string;
  certifications: Certification[];
}

export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
}

// Doctor Profile
export interface DoctorProfile extends User {
  role: 'doctor';
  medicalLicenseNumber: string;
  specialization: string[];
  yearsOfExperience: number;
  hospital: string;
  consultationRate: number;
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
}

// Symptom Session
export interface SymptomSession {
  id: string;
  patientId: string;
  transcript: ChatMessage[];
  timestamp: string;
  entities: MedicalEntity[];
  aiSummary: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'escalated';
  sessionDuration: number; // in minutes
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'ai' | 'doctor';
  message: string;
  timestamp: string;
  audioUrl?: string;
  isRead: boolean;
}

export interface MedicalEntity {
  text: string;
  type: 'symptom' | 'medication' | 'condition' | 'anatomy' | 'procedure';
  confidence: number;
  icd10Code?: string;
  category: string;
}

// Vitals Entry
export interface VitalsEntry {
  id: string;
  sessionId: string;
  patientId: string;
  healthWorkerId: string;
  timestamp: string;
  vitals: VitalSigns;
  images: MedicalImage[];
  notes?: string;
  location?: GeolocationData;
}

export interface VitalSigns {
  heartRate?: number; // BPM
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation?: number; // percentage
  temperature?: number; // Celsius
  respiratoryRate?: number; // breaths per minute
  weight?: number; // kg
  height?: number; // cm
}

export interface MedicalImage {
  id: string;
  url: string;
  type: 'photo' | 'xray' | 'scan' | 'document';
  description?: string;
  analysisResult?: ImageAnalysis;
  uploadedAt: string;
}

export interface ImageAnalysis {
  confidence: number;
  findings: string[];
  recommendations: string[];
  flagged: boolean;
  analysisType: 'aws-rekognition' | 'custom-cv';
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

// Case Management
export interface Case {
  id: string;
  sessionId: string;
  patientId: string;
  healthWorkerId?: string;
  doctorId?: string;
  status: 'pending' | 'in-review' | 'consultation-scheduled' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  completedAt?: string;
  aiRecommendation: AIRecommendation;
  doctorNotes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface AIRecommendation {
  summary: string;
  suggestedActions: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  differentialDiagnosis: string[];
  recommendedTests: string[];
  urgencyScore: number; // 1-10
}

// Video Consultation
export interface VideoConsultation {
  id: string;
  caseId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  roomId: string;
  recordingUrl?: string;
  consultationNotes?: string;
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  medications: Medication[];
  instructions: string;
  issuedAt: string;
  validUntil: string;
  doctorSignature: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'case-assigned' | 'consultation-scheduled' | 'urgent-case' | 'system-alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: 'case-update' | 'new-message' | 'consultation-started' | 'vitals-updated';
  payload: any;
  timestamp: string;
  userId?: string;
}

// Form Data Types
export interface SymptomFormData {
  symptoms: string;
  duration: string;
  severity: number; // 1-10
  additionalInfo?: string;
}

export interface VitalsFormData {
  heartRate?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  oxygenSaturation?: string;
  temperature?: string;
  notes?: string;
}

// UI State Types
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  urgentCases: number;
  averageResponseTime: number; // in minutes
}

export interface FilterOptions {
  status?: string[];
  priority?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string;
}