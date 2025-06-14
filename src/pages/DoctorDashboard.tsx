import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, Eye, Video, User, Activity } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

interface CaseData {
  id: string;
  patientName: string;
  age: number;
  mrn: string;
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis: string;
  vitals?: {
    heartRate?: string;
    bloodPressure?: string;
    oxygenSaturation?: string;
  };
  symptoms?: string[];
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'completed';
  hasImages: boolean;
}

const DoctorDashboard: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  const cases: CaseData[] = [
    {
      id: '1',
      patientName: 'John Doe',
      age: 45,
      mrn: 'MRN001',
      summary: 'Chest pain with elevated heart rate and blood pressure',
      urgency: 'critical',
      aiAnalysis: 'Patient presents with chest pain and elevated vital signs. Heart rate of 110 bpm and blood pressure of 150/95 suggest possible cardiac event. Immediate medical attention recommended. Consider ECG and cardiac enzymes.',
      vitals: { heartRate: '110', bloodPressure: '150/95', oxygenSaturation: '96' },
      symptoms: ['Chest pain', 'Shortness of breath', 'Sweating'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      hasImages: false
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      age: 32,
      mrn: 'MRN002',
      summary: 'Persistent headache with normal vitals',
      urgency: 'medium',
      aiAnalysis: 'Patient reports persistent headache for 3 days. Vital signs are within normal limits. Blood pressure 120/80, heart rate 75 bpm. Possible tension headache or migraine. Monitor symptoms and consider pain management.',
      vitals: { heartRate: '75', bloodPressure: '120/80', oxygenSaturation: '99' },
      symptoms: ['Headache', 'Light sensitivity', 'Nausea'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'pending',
      hasImages: true
    },
    {
      id: '3',
      patientName: 'Robert Johnson',
      age: 67,
      mrn: 'MRN003',
      summary: 'Joint pain and fatigue with stable vitals',
      urgency: 'low',
      aiAnalysis: 'Elderly patient with joint pain and fatigue. Vital signs stable - heart rate 68 bpm, blood pressure 130/85. Symptoms consistent with arthritis or age-related joint issues. Recommend routine follow-up and pain management evaluation.',
      vitals: { heartRate: '68', bloodPressure: '130/85', oxygenSaturation: '98' },
      symptoms: ['Joint pain', 'Fatigue', 'Morning stiffness'],
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'reviewed',
      hasImages: true
    },
    {
      id: '4',
      patientName: 'Maria Garcia',
      age: 28,
      mrn: 'MRN004',
      summary: 'Skin rash with photos uploaded',
      urgency: 'medium',
      aiAnalysis: 'Patient presents with skin rash documented in uploaded photos. Vital signs normal. Rash appears to be localized with no systemic symptoms. Possible allergic reaction or contact dermatitis. Consider antihistamines and topical treatment.',
      vitals: { heartRate: '72', bloodPressure: '115/75', oxygenSaturation: '99' },
      symptoms: ['Skin rash', 'Itching', 'Redness'],
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: 'pending',
      hasImages: true
    },
    {
      id: '5',
      patientName: 'David Wilson',
      age: 55,
      mrn: 'MRN005',
      summary: 'Respiratory symptoms with low oxygen saturation',
      urgency: 'high',
      aiAnalysis: 'Patient reports cough and shortness of breath. Oxygen saturation at 94% is concerning. Heart rate elevated at 95 bpm. Possible respiratory infection or exacerbation of underlying condition. Recommend immediate evaluation and possible oxygen therapy.',
      vitals: { heartRate: '95', bloodPressure: '140/88', oxygenSaturation: '94' },
      symptoms: ['Cough', 'Shortness of breath', 'Fatigue'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'pending',
      hasImages: false
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredCases = filterUrgency === 'all' 
    ? cases 
    : cases.filter(case_ => case_.urgency === filterUrgency);

  const handleReviewCase = (caseId: string) => {
    setSelectedCase(caseId);
  };

  const selectedCaseData = cases.find(case_ => case_.id === selectedCase);

  const urgencyCounts = {
    critical: cases.filter(c => c.urgency === 'critical').length,
    high: cases.filter(c => c.urgency === 'high').length,
    medium: cases.filter(c => c.urgency === 'medium').length,
    low: cases.filter(c => c.urgency === 'low').length,
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
                <p className="text-sm text-gray-600">Critical Cases</p>
                <p className="text-2xl font-bold text-red-600">{urgencyCounts.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{urgencyCounts.high}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{urgencyCounts.medium}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Priority</p>
                <p className="text-2xl font-bold text-green-600">{urgencyCounts.low}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Case List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-medical-500" />
                    AI-Reviewed Cases
                  </h2>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                  >
                    <option value="all">All Cases</option>
                    <option value="critical">Critical</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredCases.map((case_) => (
                  <div
                    key={case_.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedCase === case_.id ? 'bg-medical-50 border-l-4 border-medical-500' : ''
                    }`}
                    onClick={() => setSelectedCase(case_.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {case_.patientName}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getUrgencyColor(case_.urgency)}`}>
                            {getUrgencyIcon(case_.urgency)}
                            <span>{case_.urgency.toUpperCase()}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Age: {case_.age} • MRN: {case_.mrn} • {case_.timestamp.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">{case_.summary}</p>
                        
                        {case_.vitals && (
                          <div className="flex space-x-4 text-xs text-gray-600 mb-3">
                            {case_.vitals.heartRate && <span>HR: {case_.vitals.heartRate} bpm</span>}
                            {case_.vitals.bloodPressure && <span>BP: {case_.vitals.bloodPressure}</span>}
                            {case_.vitals.oxygenSaturation && <span>O2: {case_.vitals.oxygenSaturation}%</span>}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewCase(case_.id);
                            }}
                            className="flex items-center px-3 py-2 bg-medical-500 hover:bg-medical-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review Case
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Starting video consultation with ${case_.patientName}`);
                            }}
                            className="flex items-center px-3 py-2 bg-health-500 hover:bg-health-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Video Call
                          </button>
                          
                          {case_.hasImages && (
                            <span className="flex items-center text-xs text-blue-600">
                              <FileText className="w-3 h-3 mr-1" />
                              Has Images
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Case Details Sidebar */}
          <div className="space-y-6">
            {selectedCaseData ? (
              <>
                {/* Selected Case Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-medical-500" />
                    Case Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Patient</p>
                      <p className="text-lg text-gray-900">{selectedCaseData.patientName}</p>
                      <p className="text-sm text-gray-600">Age: {selectedCaseData.age} • MRN: {selectedCaseData.mrn}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCaseData.symptoms?.map((symptom, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {selectedCaseData.vitals && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Vital Signs</p>
                        <div className="space-y-2">
                          {selectedCaseData.vitals.heartRate && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Heart Rate:</span>
                              <span className="text-sm font-medium">{selectedCaseData.vitals.heartRate} bpm</span>
                            </div>
                          )}
                          {selectedCaseData.vitals.bloodPressure && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Blood Pressure:</span>
                              <span className="text-sm font-medium">{selectedCaseData.vitals.bloodPressure}</span>
                            </div>
                          )}
                          {selectedCaseData.vitals.oxygenSaturation && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Oxygen Saturation:</span>
                              <span className="text-sm font-medium">{selectedCaseData.vitals.oxygenSaturation}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-medical-500" />
                    AI Analysis
                  </h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{selectedCaseData.aiAnalysis}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center p-3 bg-medical-500 hover:bg-medical-600 text-white rounded-lg transition-colors">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video Consultation
                    </button>
                    <button className="w-full flex items-center justify-center p-3 bg-health-500 hover:bg-health-600 text-white rounded-lg transition-colors">
                      <FileText className="w-4 h-4 mr-2" />
                      Add Doctor Notes
                    </button>
                    <button className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Reviewed
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a case to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;