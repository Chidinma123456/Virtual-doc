import { useAppStore } from '../stores/appStore';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  connect(userId: string) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    
    try {
      this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        useAppStore.getState().setConnected(true);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        useAppStore.getState().setConnected(false);
        this.attemptReconnect(userId);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private handleMessage(data: any) {
    const { addNotification, addCase, updateCase } = useAppStore.getState();

    switch (data.type) {
      case 'notification':
        addNotification({
          id: data.id || Date.now().toString(),
          type: data.level || 'info',
          title: data.title,
          message: data.message,
          timestamp: new Date(data.timestamp),
          read: false,
        });
        break;

      case 'case_created':
        addCase(data.case);
        break;

      case 'case_updated':
        updateCase(data.case.id, data.case);
        break;

      case 'vitals_submitted':
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: 'New Vitals Submitted',
          message: `Vitals submitted for patient ${data.patientName}`,
          timestamp: new Date(),
          read: false,
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private attemptReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const webSocketService = new WebSocketService();