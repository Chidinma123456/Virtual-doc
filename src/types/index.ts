export type UserRole = 'patient' | 'worker' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface PatientSymptom {
  id: string;
  description: string;
  severity: number;
  timestamp: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  photos?: string[];
  notes?: string;
  aiAnalysis?: string;
  timestamp: Date;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  symptoms: PatientSymptom[];
  aiRecommendation?: string;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}