import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mic, MicOff, Send, Upload, Image as ImageIcon, X, Settings, Bot, AlertTriangle } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import LLMConfigModal from '../components/LLMConfig/LLMConfigModal';
import { llmService } from '../services/llmService';

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  images?: string[];
}

const PatientPage: React.FC = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm Dr. Ava, your empathetic virtual health assistant. I'm here to help you understand your symptoms and guide you toward the best care. Please describe what you're experiencing, and I'll provide personalized guidance. You can type, speak, or upload images to help me understand your condition better.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLLMConfig, setShowLLMConfig] = useState(false);
  const [isLLMConfigured, setIsLLMConfigured] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check configuration status
    const status = llmService.getConfiguration();
    setConfigStatus(status);
    setIsLLMConfigured(llmService.isReady());

    // If not configured but env vars are available, show a helpful message
    if (!llmService.isReady() && status.envConfigured) {
      // Try to auto-configure
      setTimeout(() => {
        const newStatus = llmService.getConfiguration();
        setIsLLMConfigured(llmService.isReady());
        setConfigStatus(newStatus);
      }, 1000);
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!symptomInput.trim() && uploadedImages.length === 0) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: symptomInput || 'Shared medical images',
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    };

    setChatMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      let aiResponse: string;
      
      if (isLLMConfigured) {
        // Use Dr. Ava LLM service
        aiResponse = await llmService.generateResponse(symptomInput, uploadedImages.length > 0);
      } else {
        // Provide configuration guidance
        aiResponse = configStatus?.envConfigured 
          ? "I can see your AWS credentials are configured, but I need to be properly initialized. Please click the settings button (⚙️) to complete my setup so I can provide you with personalized medical guidance."
          : "I'd love to provide you with personalized medical guidance, but I need to be configured first. Please click the settings button (⚙️) to set up my connection to AWS Bedrock so I can help you with the best possible care.";
      }

      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: "I apologize, but I'm having trouble processing your request right now. This might be due to a configuration issue. Please try clicking the settings button (⚙️) to check my configuration, or try again in a moment.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }

    setSymptomInput('');
    setUploadedImages([]);
  };

  const toggleListening = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSymptomInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        alert('Speech recognition is not supported in your browser. Please type your symptoms instead.');
      }
    } else {
      setIsListening(false);
    }
  };

  const handleLLMConfigured = () => {
    setIsLLMConfigured(true);
    const status = llmService.getConfiguration();
    setConfigStatus(status);
    
    // Add a welcome message from Dr. Ava
    const welcomeMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'ai',
      message: "Perfect! I'm now fully configured and ready to help you with your health concerns. My AI is powered by AWS Bedrock Claude Haiku, which allows me to provide empathetic, personalized medical guidance. How can I assist you today?",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, welcomeMessage]);
  };

  const getStatusDisplay = () => {
    if (isLLMConfigured) {
      return { text: 'Dr. Ava Ready', color: 'bg-green-100 text-green-800' };
    } else if (configStatus?.envConfigured) {
      return { text: 'Setup Required', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Configuration Needed', color: 'bg-red-100 text-red-800' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Bot className="w-8 h-8 mr-3 text-medical-500" />
                Dr. Ava - AI Health Assistant
              </h1>
              <p className="text-gray-600">Powered by AWS Bedrock Claude Haiku for empathetic, personalized health guidance</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.text}
              </div>
              <button
                onClick={() => setShowLLMConfig(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isLLMConfigured 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                    : 'bg-red-100 hover:bg-red-200 text-red-600 animate-pulse'
                }`}
                title="Configure LLM Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Configuration Alert */}
          {!isLLMConfigured && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Dr. Ava needs configuration</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {configStatus?.envConfigured 
                      ? "Your AWS credentials are detected but Dr. Ava needs to be initialized. Click the settings button to complete setup."
                      : "To provide personalized medical guidance, Dr. Ava needs AWS Bedrock access. Click the settings button to configure your credentials."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[700px] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-medical-500" />
                  Chat with Dr. Ava
                  {isLLMConfigured && (
                    <span className="ml-3 px-2 py-1 bg-medical-100 text-medical-700 text-xs rounded-full">
                      Claude Haiku Powered
                    </span>
                  )}
                </h2>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-medical-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center mb-2">
                          <Bot className="w-4 h-4 mr-2 text-medical-500" />
                          <span className="text-xs font-medium text-medical-600">Dr. Ava</span>
                        </div>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      
                      {/* Display images if present */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {message.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Medical image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-medical-100' : 'text-gray-500'
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
                        <Bot className="w-4 h-4 text-medical-500" />
                        <span className="text-xs font-medium text-medical-600">Dr. Ava is thinking...</span>
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
                          src={image}
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
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder="Describe your symptoms in detail to Dr. Ava..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
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
                      <Upload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleListening}
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
                      disabled={!symptomInput.trim() && uploadedImages.length === 0}
                      className="p-3 bg-medical-500 hover:bg-medical-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
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
            {/* Dr. Ava Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-medical-500" />
                About Dr. Ava
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Dr. Ava is powered by AWS Bedrock Claude Haiku, providing:</p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Empathetic, personalized responses</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Plain-language medical guidance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Responsible escalation recommendations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Image analysis capabilities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-medical-50 rounded-lg cursor-pointer hover:bg-medical-100 transition-colors">
                  <p className="text-sm font-medium text-gray-900">Headache consultation</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-900">Stomach pain inquiry</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-900">Skin rash photos</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be specific about when symptoms started</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Describe pain level on a scale of 1-10</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Upload clear photos of visible symptoms</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use voice input for hands-free interaction</p>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
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
      </main>

      <Footer />
      
      <LLMConfigModal
        isOpen={showLLMConfig}
        onClose={() => setShowLLMConfig(false)}
        onConfigured={handleLLMConfigured}
      />
    </div>
  );
};

export default PatientPage;