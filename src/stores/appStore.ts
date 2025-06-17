import { create } from 'zustand';
import { Case, Notification, SymptomSession, VitalsEntry } from '../types';

interface AppState {
  // Cases
  cases: Case[];
  activeCases: Case[];
  selectedCase: Case | null;
  
  // Sessions
  currentSession: SymptomSession | null;
  sessions: SymptomSession[];
  
  // Vitals
  vitalsEntries: VitalsEntry[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Real-time connection
  isConnected: boolean;
  
  // Actions
  setCases: (cases: Case[]) => void;
  addCase: (case_: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  setSelectedCase: (case_: Case | null) => void;
  
  setCurrentSession: (session: SymptomSession | null) => void;
  addSession: (session: SymptomSession) => void;
  updateSession: (id: string, updates: Partial<SymptomSession>) => void;
  
  addVitalsEntry: (entry: VitalsEntry) => void;
  
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cases: [],
  activeCases: [],
  selectedCase: null,
  currentSession: null,
  sessions: [],
  vitalsEntries: [],
  notifications: [],
  unreadCount: 0,
  sidebarOpen: false,
  theme: 'light',
  isConnected: false,

  // Case actions
  setCases: (cases) => {
    const activeCases = cases.filter(c => 
      ['pending', 'in-review', 'escalated'].includes(c.status)
    );
    set({ cases, activeCases });
  },

  addCase: (case_) => {
    const cases = [...get().cases, case_];
    const activeCases = cases.filter(c => 
      ['pending', 'in-review', 'escalated'].includes(c.status)
    );
    set({ cases, activeCases });
  },

  updateCase: (id, updates) => {
    const cases = get().cases.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    const activeCases = cases.filter(c => 
      ['pending', 'in-review', 'escalated'].includes(c.status)
    );
    set({ cases, activeCases });
    
    // Update selected case if it's the one being updated
    const selectedCase = get().selectedCase;
    if (selectedCase?.id === id) {
      set({ selectedCase: { ...selectedCase, ...updates } });
    }
  },

  setSelectedCase: (selectedCase) => set({ selectedCase }),

  // Session actions
  setCurrentSession: (currentSession) => set({ currentSession }),

  addSession: (session) => {
    const sessions = [...get().sessions, session];
    set({ sessions });
  },

  updateSession: (id, updates) => {
    const sessions = get().sessions.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    set({ sessions });
    
    // Update current session if it's the one being updated
    const currentSession = get().currentSession;
    if (currentSession?.id === id) {
      set({ currentSession: { ...currentSession, ...updates } });
    }
  },

  // Vitals actions
  addVitalsEntry: (entry) => {
    const vitalsEntries = [...get().vitalsEntries, entry];
    set({ vitalsEntries });
  },

  // Notification actions
  addNotification: (notification) => {
    const notifications = [...get().notifications, notification];
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },

  markNotificationRead: (id) => {
    const notifications = get().notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  // UI actions
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setConnected: (isConnected) => set({ isConnected }),
}));