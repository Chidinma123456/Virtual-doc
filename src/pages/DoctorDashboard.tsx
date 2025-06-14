import React, { useState } from 'react';
import { Video, FileText, Clock, AlertCircle, CheckCircle, Users, Calendar } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const DoctorDashboard: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const pendingCases = [
    {
      id: '1',
      patientName: 'John Doe',
      age: 45,
      symptoms: 'Chest pain, shortness of breath',
      priority: 'high',
      aiRecommendation: 'Possible cardiac event. Recommend immediate consultation.',
      timestamp: '2 hours ago',
      vitals: { bp: '140/90', hr: '95', temp: '99.2°F' }
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      age: 32,
      symptoms: 'Persistent headache, nausea',
      priority: 'medium',
      aiRecommendation: 'Possible migraine or tension headache. Monitor symptoms.',
      timestamp: '4 hours ago',
      vitals: { bp: '120/80', hr: '72', temp: '98.6°F' }
    },
    {
      id: '3',
      patientName: 'Robert Johnson',
      age: 67,
      symptoms: 'Fatigue, joint pain',
      priority: 'low',
      aiRecommendation: 'Possible arthritis flare-up. Routine consultation recommended.',
      timestamp: '6 hours ago',
      vitals: { bp: '130/85', hr: '68', temp: '98.4°F' }
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const startVideoConsultation = (caseId: string) => {
    // In a real app, this would integrate with Tavus for video avatar
    alert(`Starting video consultation for case ${caseId}. Tavus avatar will be initialized.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Review AI-analyzed cases and manage patient consultations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Cases</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Clock className="w-8 h-8 text-medical-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Consultations</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Video className="w-8 h-8 text-health-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <Users className="w-8 h-8 text-medical-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Case List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-medical-500" />
                  Pending Cases
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {pendingCases.map((case_) => (
                  <div
                    key={case_.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedCase === case_.id ? 'bg-medical-50 border-l-4 border-medical-500' : ''
                    }`}
                    onClick={() => setSelectedCase(case_.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {case_.patientName}
                        </h3>
                        <p className="text-sm text-gray-600">Age: {case_.age} • {case_.timestamp}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(case_.priority)}`}>
                        {case_.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Symptoms:</strong> {case_.symptoms}
                      </p>
                      <div className="flex space-x-4 text-xs text-gray-600">
                        <span>BP: {case_.vitals.bp}</span>
                        <span>HR: {case_.vitals.hr}</span>
                        <span>Temp: {case_.vitals.temp}</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-800 mb-1">AI Recommendation</p>
                          <p className="text-sm text-blue-700">{case_.aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startVideoConsultation(case_.id);
                        }}
                        className="flex items-center px-4 py-2 bg-medical-500 hover:bg-medical-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Video Call
                      </button>
                      <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-medical-500" />
                Today's Schedule
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-medical-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Video Consultation</p>
                    <p className="text-xs text-gray-600">Sarah Wilson</p>
                  </div>
                  <span className="text-xs text-medical-600 font-medium">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-health-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Case Review</p>
                    <p className="text-xs text-gray-600">Multiple patients</p>
                  </div>
                  <span className="text-xs text-health-600 font-medium">3:30 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                    <p className="text-xs text-gray-600">Weekly sync</p>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">5:00 PM</span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">High Priority Alert</p>
                  <p className="text-xs text-red-700">3 cases require immediate attention</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Pattern Detected</p>
                  <p className="text-xs text-blue-700">Increased respiratory symptoms in your area</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">Efficiency Tip</p>
                  <p className="text-xs text-green-700">Average consultation time decreased by 15%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center p-3 bg-medical-500 hover:bg-medical-600 text-white rounded-lg transition-colors">
                  <Video className="w-4 h-4 mr-2" />
                  Start Emergency Call
                </button>
                <button className="w-full flex items-center justify-center p-3 bg-health-500 hover:bg-health-600 text-white rounded-lg transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
                <button className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <Users className="w-4 h-4 mr-2" />
                  View All Patients
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;