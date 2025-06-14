import React, { useState } from 'react';
import { Camera, Upload, Activity, FileText, Save, User } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const HealthWorkerPage: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });
  const [notes, setNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you'd upload to AWS S3 here
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleSaveRecord = () => {
    // In a real app, this would save to the database and trigger AI analysis
    alert('Patient record saved successfully! AI analysis will be available shortly.');
  };

  const patients = [
    { id: '1', name: 'John Doe', age: 45 },
    { id: '2', name: 'Jane Smith', age: 32 },
    { id: '3', name: 'Robert Johnson', age: 67 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Worker Dashboard</h1>
          <p className="text-gray-600">Enter patient vitals and medical documentation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
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
                    {patient.name} (Age: {patient.age})
                  </option>
                ))}
              </select>
            </div>

            {/* Vital Signs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-health-500" />
                Vital Signs
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
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
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                    placeholder="72"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    placeholder="98.6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    placeholder="150"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={vitals.height}
                    onChange={(e) => handleVitalChange('height', e.target.value)}
                    placeholder="68"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    type="number"
                    value={vitals.oxygenSaturation}
                    onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                    placeholder="98"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-health-500" />
                Medical Photos
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
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
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Medical photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-health-500" />
                Clinical Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical observations, patient complaints, or additional notes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveRecord}
              disabled={!selectedPatient}
              className="w-full py-4 px-6 bg-health-500 hover:bg-health-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Patient Record
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    AI analysis will be available after saving patient data
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
              <div className="space-y-3">
                {patients.slice(0, 3).map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">Age: {patient.age}</p>
                    </div>
                    <button className="text-health-600 hover:text-health-700 text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patients Seen</span>
                  <span className="text-sm font-semibold text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Records Created</span>
                  <span className="text-sm font-semibold text-gray-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Photos Uploaded</span>
                  <span className="text-sm font-semibold text-gray-900">24</span>
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