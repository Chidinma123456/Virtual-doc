import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Bot,
  AlertTriangle,
  Clock,
  FileText,
  Heart,
  Activity,
  Camera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { ChatMessage, SymptomSession } from '../types';
import { apiService } from '../services/apiService';
import { llmService } from '../services/llmService';
import { elevenLabsService } from '../services/elevenLabsService';
import toast from 'react-hot-toast';

const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currentSession, setCurrentSession, addSession } = useAppStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Dr. Ava, your AI health assistant. I'm here to help you understand your symptoms and guide you toward the best care. Please describe what you're experiencing, and I'll provide personalized guidance.",
      timestamp: new Date(),
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak now');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
      toast.success('Voice input captured');
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice recognition error. Please try again.');
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedImages(prev => [...prev, ...files]);
      toast.success(`${files.length} image(s) uploaded`);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const playAudioResponse = async (text: string) => {
    if (!audioEnabled || isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      await elevenLabsService.playAudio(text);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedImages.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || 'Shared medical images',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        for (const image of uploadedImages) {
          const uploadResult = await apiService.uploadFile('/upload/image', image, {
            patientId: user?.id,
            sessionId: currentSession?.id,
          });
          if (uploadResult.success) {
            imageUrls.push(uploadResult.data.url);
          }
        }
      }

      // Analyze symptoms with AI
      const analysisResult = await apiService.analyzeSymptoms(inputMessage, imageUrls[0]);
      
      let aiResponse = '';
      if (analysisResult.success) {
        aiResponse = analysisResult.data.response;
      } else {
        // Fallback to local LLM service
        aiResponse = await llmService.generateResponse(inputMessage, uploadedImages.length > 0);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Play audio response
      if (audioEnabled) {
        playAudioResponse(aiResponse);
      }

      // Update or create session
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          transcript: [...currentSession.transcript, userMessage, aiMessage],
          updatedAt: new Date(),
        };
        setCurrentSession(updatedSession);
        await apiService.updateSession(currentSession.id, updatedSession);
      } else {
        // Create new session
        const newSession: Partial<SymptomSession> = {
          patientId: user?.id || '',
          transcript: [userMessage, aiMessage],
          timestamp: new Date(),
          entities: [],
          aiSummary: aiResponse,
          urgencyLevel: 'low',
          status: 'active',
          language: 'en',
        };
        
        const sessionResult = await apiService.createSession(newSession);
        if (sessionResult.success) {
          setCurrentSession(sessionResult.data);
          addSession(sessionResult.data);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team if the issue persists.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setInputMessage('');
      setUploadedImages([]);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 h-[700px] flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Dr. Ava</h2>
                    <p className="text-sm text-gray-600">AI Health Assistant</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled 
                        ? 'text-primary-600 bg-primary-100 hover:bg-primary-200' 
                        : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={audioEnabled ? 'Disable audio responses' : 'Enable audio responses'}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  
                  {currentSession && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(currentSession.urgencyLevel)}`}>
                      {currentSession.urgencyLevel.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center mb-2">
                        <Bot className="w-4 h-4 mr-2 text-primary-500" />
                        <span className="text-xs font-medium text-primary-600">Dr. Ava</span>
                      </div>
                    )}
                    
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-primary-500" />
                      <span className="text-xs font-medium text-primary-600">Dr. Ava is analyzing...</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Images to send:</span>
                </div>
                <div className="flex space-x-2 overflow-x-auto">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative flex-shrink-0">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your symptoms in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                    title="Upload images"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-xl transition-colors ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() && uploadedImages.length === 0}
                    className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Info */}
          {currentSession && (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-500" />
                Current Session
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">{currentSession.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-medium">{currentSession.transcript.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgency:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(currentSession.urgencyLevel)}`}>
                    {currentSession.urgencyLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">
                <Heart className="w-4 h-4 mr-2" />
                Request Doctor Consultation
              </button>
              <button className="w-full flex items-center justify-center p-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                View Health Summary
              </button>
              <button className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Be specific about when symptoms started</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Describe pain level on a scale of 1-10</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Upload clear photos of visible symptoms</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use voice input for hands-free interaction</p>
              </div>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency?</h3>
                <p className="text-sm text-red-700 mb-4">
                  If you're experiencing a medical emergency, call 911 immediately or go to your nearest emergency room.
                </p>
                <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                  Emergency Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;