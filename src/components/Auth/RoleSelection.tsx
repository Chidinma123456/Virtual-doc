import React from 'react';
import { UserCheck, Stethoscope, Heart } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'patient' as UserRole,
      title: 'Patient',
      description: 'Describe symptoms, receive AI guidance, and connect with doctors',
      icon: Heart,
      color: 'medical',
      features: [
        'AI-powered symptom analysis',
        'Virtual consultations',
        'Health tracking',
        'Secure messaging'
      ]
    },
    {
      id: 'worker' as UserRole,
      title: 'Health Worker',
      description: 'Enter vitals and medical photos for AI analysis',
      icon: UserCheck,
      color: 'health',
      features: [
        'Patient data entry',
        'Vital signs recording',
        'Photo documentation',
        'AI-assisted analysis'
      ]
    },
    {
      id: 'doctor' as UserRole,
      title: 'Doctor',
      description: 'Review cases, view AI reports, and perform live consultations',
      icon: Stethoscope,
      color: 'medical',
      features: [
        'Case management',
        'AI report reviews',
        'Video consultations',
        'Patient monitoring'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-health-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-medical-500 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to VirtuDoc</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access personalized healthcare tools powered by AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const colorClass = role.color === 'medical' ? 'medical' : 'health';
            
            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
                onClick={() => onRoleSelect(role.id)}
              >
                <div className="p-8">
                  <div className={`flex items-center justify-center w-16 h-16 bg-${colorClass}-500 rounded-xl mb-6 mx-auto`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {role.title}
                  </h3>
                  
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 bg-${colorClass}-500 rounded-full mr-3 flex-shrink-0`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 px-6 bg-${colorClass}-500 hover:bg-${colorClass}-600 text-white font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-${colorClass}-200`}
                  >
                    Continue as {role.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Secure • HIPAA Compliant • AI-Powered Healthcare
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;