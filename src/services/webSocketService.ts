import { io, Socket } from 'socket.io-client';
import { WebSocketEvent, UserRole } from '../types';
import { useAppStore } from '../stores/appStore';
import toast from 'react-hot-toast';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, role: UserRole) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
    
    this.socket = io(wsUrl, {
      auth: {
        userId,
        role,
        token: localStorage.getItem('accessToken'),
      },
      transports: ['websocket'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      useAppStore.getState().setConnected(true);
      this.reconnectAttempts = 0;
      
      toast.success('Connected to real-time updates', {
        duration: 2000,
        position: 'bottom-right',
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      useAppStore.getState().setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      useAppStore.getState().setConnected(false);
      this.handleReconnect();
    });

    // Case events
    this.socket.on('case-created', (data) => {
      console.log('📋 New case created:', data);
      useAppStore.getState().addCase(data.case);
      
      toast.success(`New case assigned: ${data.case.summary}`, {
        duration: 5000,
        position: 'top-right',
      });
    });

    this.socket.on('case-updated', (data) => {
      console.log('📋 Case updated:', data);
      useAppStore.getState().updateCase(data.caseId, data.updates);
    });

    this.socket.on('vitals-submitted', (data) => {
      console.log('📊 Vitals submitted:', data);
      useAppStore.getState().addVitalsEntry(data.vitals);
      
      toast.success('New vitals data received', {
        duration: 3000,
        position: 'top-right',
      });
    });

    this.socket.on('consultation-started', (data) => {
      console.log('🎥 Consultation started:', data);
      
      toast.success(`Video consultation started for case ${data.caseId}`, {
        duration: 5000,
        position: 'top-right',
      });
    });

    this.socket.on('urgent-alert', (data) => {
      console.log('🚨 Urgent alert:', data);
      
      toast.error(`URGENT: ${data.message}`, {
        duration: 10000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          color: '#991B1B',
        },
      });
      
      // Play notification sound
      this.playNotificationSound('urgent');
    });

    this.socket.on('notification', (data) => {
      console.log('🔔 Notification:', data);
      useAppStore.getState().addNotification(data.notification);
      
      if (data.notification.priority === 'high' || data.notification.priority === 'critical') {
        toast.error(data.notification.message, {
          duration: 7000,
          position: 'top-right',
        });
        this.playNotificationSound('high');
      } else {
        toast.success(data.notification.message, {
          duration: 4000,
          position: 'bottom-right',
        });
        this.playNotificationSound('normal');
      }
    });

    // Room-based events for video consultations
    this.socket.on('user-joined-room', (data) => {
      console.log('👤 User joined room:', data);
      toast.success(`${data.userName} joined the consultation`, {
        duration: 3000,
        position: 'bottom-right',
      });
    });

    this.socket.on('user-left-room', (data) => {
      console.log('👤 User left room:', data);
      toast.info(`${data.userName} left the consultation`, {
        duration: 3000,
        position: 'bottom-right',
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      toast.error('Connection lost. Please refresh the page.', {
        duration: 0, // Don't auto-dismiss
        position: 'top-center',
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  private playNotificationSound(type: 'normal' | 'high' | 'urgent') {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'urgent':
          audio.src = '/sounds/urgent-alert.mp3';
          break;
        case 'high':
          audio.src = '/sounds/high-priority.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }

  // Emit events
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', { roomId });
  }

  sendMessage(roomId: string, message: any) {
    this.socket?.emit('room-message', { roomId, message });
  }

  updateCaseStatus(caseId: string, status: string) {
    this.socket?.emit('update-case-status', { caseId, status });
  }

  requestUrgentConsultation(caseId: string) {
    this.socket?.emit('urgent-consultation-request', { caseId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useAppStore.getState().setConnected(false);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();