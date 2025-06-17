import { create } from 'zustand';
import { Case, SymptomSession, VitalsEntry } from '../types';

interface AppState {
  // Cases
  cases: Case[];
  selectedCase: Case | null;
  
  // Symptom Sessions
  symptomSessions: SymptomSession[];
  activeSession: SymptomSession | null;
  
  // Vitals
  vitalsEntries: VitalsEntry[];
  
  // UI State
  isConnected: boolean;
  notifications: Notification[];
  
  // Actions
  setCases: (cases: Case[]) => void;
  setSelectedCase: (case_: Case | null) => void;
  addCase: (case_: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  
  setSymptomSessions: (sessions: SymptomSession[]) => void;
  setActiveSession: (session: SymptomSession | null) => void;
  addSymptomSession: (session: SymptomSession) => void;
  
  setVitalsEntries: (entries: VitalsEntry[]) => void;
  addVitalsEntry: (entry: VitalsEntry) => void;
  
  setConnected: (connected: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cases: [],
  selectedCase: null,
  symptomSessions: [],
  activeSession: null,
  vitalsEntries: [],
  isConnected: false,
  notifications: [],
  
  // Case actions
  setCases: (cases) => set({ cases }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  addCase: (newCase) => set((state) => ({ 
    cases: [...state.cases, newCase] 
  })),
  updateCase: (id, updates) => set((state) => ({
    cases: state.cases.map(case_ => 
      case_.id === id ? { ...case_, ...updates } : case_
    ),
    selectedCase: state.selectedCase?.id === id 
      ? { ...state.selectedCase, ...updates }
      : state.selectedCase
  })),
  
  // Symptom session actions
  setSymptomSessions: (symptomSessions) => set({ symptomSessions }),
  setActiveSession: (activeSession) => set({ activeSession }),
  addSymptomSession: (session) => set((state) => ({
    symptomSessions: [...state.symptomSessions, session]
  })),
  
  // Vitals actions
  setVitalsEntries: (vitalsEntries) => set({ vitalsEntries }),
  addVitalsEntry: (entry) => set((state) => ({
    vitalsEntries: [...state.vitalsEntries, entry]
  })),
  
  // UI actions
  setConnected: (isConnected) => set({ isConnected }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));