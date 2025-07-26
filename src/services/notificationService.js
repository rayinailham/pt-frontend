import io from 'socket.io-client';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.callbacks = {
      onAuthenticated: null,
      onAuthError: null,
      onAnalysisStarted: null,
      onAnalysisComplete: null,
      onAnalysisFailed: null,
      onConnect: null,
      onDisconnect: null
    };
  }

  connect(token, options = {}) {
    // Prevent multiple connections
    if (this.socket && this.socket.connected) {
      return this;
    }

    if (this.socket) {
      this.disconnect();
    }

    const socketUrl = options.url || 'https://api.chhrone.web.id';

    this.socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      ...options.socketOptions
    });

    this.token = token;
    this.setupEventListeners();
    this.socket.connect();

    return this;
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
      this.socket = null;
    } else if (this.socket) {
      // Socket exists but not connected, just clean up
      this.socket = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
  }

  authenticate() {
    if (this.socket && this.socket.connected && this.token) {
      this.socket.emit('authenticate', { token: this.token });
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.authenticate();
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isAuthenticated = false;
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      // Connection failed - handled silently
    });

    this.socket.on('reconnect_failed', () => {
      // Failed to reconnect after maximum attempts - handled silently
    });

    // Authentication events
    this.socket.on('authenticated', (data) => {
      this.isAuthenticated = true;
      this.callbacks.onAuthenticated?.(data);
    });

    this.socket.on('auth_error', (error) => {
      this.isAuthenticated = false;
      this.callbacks.onAuthError?.(error);
    });

    // Notification events
    this.socket.on('analysis-started', (data) => {
      this.callbacks.onAnalysisStarted?.(data);
    });

    this.socket.on('analysis-complete', (data) => {
      this.callbacks.onAnalysisComplete?.(data);
    });

    this.socket.on('analysis-failed', (data) => {
      this.callbacks.onAnalysisFailed?.(data);
    });
  }

  // Callback setters
  onAuthenticated(callback) {
    this.callbacks.onAuthenticated = callback;
    return this;
  }

  onAuthError(callback) {
    this.callbacks.onAuthError = callback;
    return this;
  }

  onAnalysisStarted(callback) {
    this.callbacks.onAnalysisStarted = callback;
    return this;
  }

  onAnalysisComplete(callback) {
    this.callbacks.onAnalysisComplete = callback;
    return this;
  }

  onAnalysisFailed(callback) {
    this.callbacks.onAnalysisFailed = callback;
    return this;
  }

  onConnect(callback) {
    this.callbacks.onConnect = callback;
    return this;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
    return this;
  }

  // Status getters
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
