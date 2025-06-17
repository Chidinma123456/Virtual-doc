import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Camera, 
  Upload, 
  Send, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  LogOut,
  Bell,
  Settings,
  Activity,
  Volume2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { ChatMessage, SymptomSession, MedicalImage } from '../types';
import bedrockService from '../services/bedrockService';
import { elevenLabsService } from '../services/elevenLabsService';
import { tavusService } from '../services/tavusService';

const PatientPage: React.FC = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'chat' | 'upload' | 'summary' | 'history'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      message: "Hello! I'm Dr. Ava, your AI health assistant powered by AWS Bedrock. I'm here to help you understand your symptoms and provide personalized medical guidance. How are you feeling today?",
      timestamp: new Date().toISOString(),
      isRead: true
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [uploadedImages, setUploadedImages] = useState<MedicalImage[]>([]);
  const [currentSession, setCurrentSession] = useState<SymptomSession | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'patient',
      message: currentMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Use AWS Bedrock for AI response
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'patient' ? 'user' as const : 'assistant' as const,
        content: msg.message
      }));

      const bedrockResponse = await bedrockService.generateMedicalResponse(
        messageToProcess,
        conversationHistory,
        uploadedImages.length > 0
      );

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: bedrockResponse.content,
        timestamp: new Date().toISOString(),
        isRead: true
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update urgency level from AI analysis
      if (bedrockResponse.urgencyLevel) {
        setUrgencyLevel(bedrockResponse.urgencyLevel);
      }

      // Generate audio response using ElevenLabs
      if (elevenLabsService.isConfigured()) {
        try {
          const audioBlob = await elevenLabsService.textToSpeech(bedrockResponse.content);
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            // Update the message with audio URL
            setMessages(prev => prev.map(msg => 
              msg.id === aiResponse.id 
                ? { ...msg, audioUrl }
                : msg
            ));
          }
        } catch (audioError) {
          console.warn('Audio generation failed:', audioError);
        }
      }

    } catch (error) {
      console.error('AI response error:', error);
      
      // Fallback response
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team if the issue persists.",
        timestamp: new Date().toISOString(),
        isRead: true
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioResponse = async (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(false);
    }

    try {
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        console.error('Audio playback failed');
      };

      await audio.play();
    } catch (error) {
      setIsPlayingAudio(false);
      setCurrentAudio(null);
      console.error('Audio playback error:', error);
    }
  };

  const generateVideoAvatar = async (message: string) => {
    if (!tavusService.isConfigured()) {
      console.warn('Tavus not configured for video generation');
      return;
    }

    try {
      setIsLoading(true);
      const videoUrl = await tavusService.generateVideo(message);
      if (videoUrl) {
        // Add video message to chat
        const videoMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          message: `I've created a personalized video response for you: ${videoUrl}`,
          timestamp: new Date().toISOString(),
          isRead: true
        };
        setMessages(prev => [...prev, videoMessage]);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: MedicalImage = {
            id: Date.now().toString(),
            url: e.target?.result as string,
            type: 'photo',
            description: file.name,
            uploadedAt: new Date().toISOString()
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">VirtuDoc</h1>
                <p className="text-sm text-gray-500">AI Health Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <User className="h-3 w-3 mr-1" />
                Patient
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Dashboard</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Chat with Dr. Ava
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'upload'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Camera className="h-4 w-4 mr-3" />
                  Upload Photos
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  AI Summary
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Activity className="h-4 w-4 mr-3" />
                  Health History
                </button>
              </nav>

              {/* Urgency Meter */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Status</h3>
                <div className={`p-3 rounded-lg border ${getUrgencyColor(urgencyLevel)}`}>
                  <div className="flex items-center">
                    {getUrgencyIcon(urgencyLevel)}
                    <span className="ml-2 text-sm font-medium capitalize">{urgencyLevel} Priority</span>
                  </div>
                  <p className="text-xs mt-1 opacity-75">
                    {urgencyLevel === 'critical' && 'Seek immediate medical attention'}
                    {urgencyLevel === 'high' && 'Consider consulting a doctor soon'}
                    {urgencyLevel === 'medium' && 'Monitor symptoms closely'}
                    {urgencyLevel === 'low' && 'Continue normal activities'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'chat' && (
              <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Chat with Dr. Ava</h2>
                  <p className="text-sm text-gray-600">Describe your symptoms and get AI-powered health guidance</p>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        
                        {/* Audio playback button for AI messages */}
                        {message.sender === 'ai' && message.audioUrl && (
                          <button
                            onClick={() => playAudioResponse(message.audioUrl!)}
                            className="mt-2 flex items-center text-xs text-blue-600 hover:text-blue-800"
                            disabled={isPlayingAudio}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            {isPlayingAudio ? 'Playing...' : 'Listen to Dr. Ava'}
                          </button>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                          
                          {/* Video generation button for AI messages */}
                          {message.sender === 'ai' && tavusService.isConfigured() && (
                            <button
                              onClick={() => generateVideoAvatar(message.message)}
                              className="text-xs text-purple-600 hover:text-purple-800 ml-2"
                              disabled={isLoading}
                            >
                              📹 Video
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-600">Dr. Ava is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Describe your symptoms..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={toggleRecording}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                            isRecording ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Medical Photos</h2>
                <p className="text-gray-600 mb-6">Upload photos of rashes, wounds, or other visible symptoms for AI analysis</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Photos</h3>
                  <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </button>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt={image.description}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                            <p className="text-xs truncate">{image.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Health Summary</h2>
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg border ${getUrgencyColor(urgencyLevel)}`}>
                    <div className="flex items-center mb-2">
                      {getUrgencyIcon(urgencyLevel)}
                      <h3 className="ml-2 font-medium">Current Assessment</h3>
                    </div>
                    <p className="text-sm">
                      Based on your symptoms, this appears to be a {urgencyLevel} priority case. 
                      {urgencyLevel === 'critical' && ' Please seek immediate medical attention.'}
                      {urgencyLevel === 'high' && ' Consider scheduling a consultation with a healthcare provider.'}
                      {urgencyLevel === 'medium' && ' Monitor your symptoms and consider consulting a doctor if they worsen.'}
                      {urgencyLevel === 'low' && ' Continue to monitor your symptoms and maintain normal activities.'}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Recommended Actions</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Continue describing your symptoms in detail</li>
                      <li>• Upload any relevant photos if applicable</li>
                      <li>• Monitor your symptoms for changes</li>
                      <li>• Consider scheduling a video consultation if symptoms persist</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">General Health Tips</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Stay hydrated by drinking plenty of water</li>
                      <li>• Get adequate rest and sleep</li>
                      <li>• Maintain a balanced diet</li>
                      <li>• Take medications as prescribed</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Health History</h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">Previous Consultation</h3>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Symptoms: Headache, mild fever</p>
                    <p className="text-sm text-gray-600">Status: Resolved</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">Annual Checkup</h3>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Routine health screening</p>
                    <p className="text-sm text-gray-600">Status: Normal results</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HIPAA Compliance Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span className="inline-flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              HIPAA Compliant
            </span>
            <span>•</span>
            <span>End-to-End Encrypted</span>
            <span>•</span>
            <span>Secure Medical Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientPage;