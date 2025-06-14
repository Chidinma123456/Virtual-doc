import React, { useState } from 'react';
import { MessageCircle, Calendar, FileText, Activity, Send, Mic, MicOff } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const PatientPage: React.FC = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hello! I'm your AI health assistant. Please describe your symptoms and I'll help analyze them.",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!symptomInput.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: symptomInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: "Thank you for describing your symptoms. Based on what you've told me, I recommend monitoring your condition. If symptoms persist or worsen, please consider scheduling a consultation with one of our doctors.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setSymptomInput('');
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Describe your symptoms and get AI-powered health guidance</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-medical-500" />
                  AI Health Assistant
                </h2>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-medical-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-medical-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder="Describe your symptoms in detail..."
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
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-xl transition-colors ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!symptomInput.trim()}
                      className="p-3 bg-medical-500 hover:bg-medical-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
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
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-xl transition-colors">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-health-50 hover:bg-health-100 text-health-700 rounded-xl transition-colors">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    View Medical History
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Health Tracking
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">AI consultation completed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-health-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Symptoms logged</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientPage;