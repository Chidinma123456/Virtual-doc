import React, { useState } from 'react';
import { Activity, Upload, Send, User, Camera, FileText, AlertCircle } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const HealthWorkerPage: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressure: '',
    oxygenSaturation: ''
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const simulateAIAnalysis = () => {
    const analyses = [
      "Vital signs appear within normal ranges. Heart rate and blood pressure are stable. Oxygen saturation is excellent. Recommend routine monitoring.",
      "Slightly elevated heart rate detected. Blood pressure is within acceptable range. Consider monitoring stress levels and physical activity.",
      "All vital signs are normal. Patient appears healthy based on current measurements. Continue regular health monitoring.",
      "Blood pressure reading suggests mild hypertension. Recommend lifestyle modifications and follow-up monitoring. Consider dietary changes.",
      "Oxygen saturation is optimal. Heart rate and blood pressure readings are normal for patient's age group. No immediate concerns."
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
  };

  const handleSubmitAnalysis = () => {
    if (!selectedPatient || (!vitals.heartRate && !vitals.bloodPressure && !vitals.oxygenSaturation && uploadedPhotos.length === 0)) {
      alert('Please select a patient and enter at least one vital sign or upload a photo.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate AI analysis processing time
    setTimeout(() => {
      const result = simulateAIAnalysis();
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2000 + Math.random() * 2000);
  };

  const patients = [
    { id: '1', name: 'John Doe', age: 45, mrn: 'MRN001' },
    { id: '2', name: 'Jane Smith', age: 32, mrn: 'MRN002' },
    { id: '3', name: 'Robert Johnson', age: 67, mrn: 'MRN003' },
    { id: '4', name: 'Maria Garcia', age: 28, mrn: 'MRN004' },
    { id: '5', name: 'David Wilson', age: 55, mrn: 'MRN005' }
  ];

  const getVitalStatus = (vital: string, value: string) => {
    if (!value) return 'normal';
    
    switch (vital) {
      case 'heartRate':
        const hr = parseInt(value);
        if (hr < 60 || hr > 100) return 'warning';
        return 'normal';
      case 'oxygenSaturation':
        const os = parseInt(value);
        if (os < 95) return 'critical';
        if (os < 98) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Worker Dashboard</h1>
          <p className="text-gray-600">Enter patient vitals and medical photos for AI-powered analysis</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-health-500" />
                Patient Selection
              </h2>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
              >
                <option value="">Select a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} (Age: {patient.age}, MRN: {patient.mrn})
                  </option>
                ))}
              </select>
            </div>

            {/* Vital Signs Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-health-500" />
                Vital Signs
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                      placeholder="72"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                    />
                    {vitals.heartRate && (
                      <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(getVitalStatus('heartRate', vitals.heartRate))}`}>
                        {getVitalStatus('heartRate', vitals.heartRate)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    value={vitals.bloodPressure}
                    onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                    placeholder="120/80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={vitals.oxygenSaturation}
                      onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                      placeholder="98"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                    />
                    {vitals.oxygenSaturation && (
                      <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(getVitalStatus('oxygenSaturation', vitals.oxygenSaturation))}`}>
                        {getVitalStatus('oxygenSaturation', vitals.oxygenSaturation)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Photos Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-health-500" />
                Medical Photos
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload medical photos</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                </label>
              </div>
              
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Medical photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitAnalysis}
              disabled={!selectedPatient || isAnalyzing || (!vitals.heartRate && !vitals.bloodPressure && !vitals.oxygenSaturation && uploadedPhotos.length === 0)}
              className="w-full py-4 px-6 bg-health-500 hover:bg-health-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit for AI Analysis
                </>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-health-500" />
                AI Analysis
              </h3>
              
              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Analyzing patient data...</p>
                  </div>
                </div>
              )}
              
              {analysisResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-2">AI Analysis Result</p>
                      <p className="text-sm text-blue-700">{analysisResult}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!isAnalyzing && !analysisResult && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Submit patient data to receive AI analysis</p>
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
              <div className="space-y-3">
                {patients.slice(0, 4).map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">Age: {patient.age} • {patient.mrn}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(patient.id)}
                      className="text-health-600 hover:text-health-700 text-sm font-medium"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Patients Processed</span>
                  <span className="text-lg font-semibold text-gray-900">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vitals Recorded</span>
                  <span className="text-lg font-semibold text-gray-900">36</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Photos Uploaded</span>
                  <span className="text-lg font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Analyses</span>
                  <span className="text-lg font-semibold text-gray-900">18</span>
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

export default HealthWorkerPage;