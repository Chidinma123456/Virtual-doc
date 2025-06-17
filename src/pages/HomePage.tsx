import React from 'react';
import { Heart, Stethoscope, UserCheck, Shield, Clock, Users, ArrowRight, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'AI-Powered Diagnosis',
      description: 'Advanced AI analyzes symptoms and provides preliminary health assessments',
      color: 'text-red-500'
    },
    {
      icon: Stethoscope,
      title: 'Expert Consultations',
      description: 'Connect with certified doctors for professional medical advice',
      color: 'text-blue-500'
    },
    {
      icon: UserCheck,
      title: 'Health Worker Support',
      description: 'Trained health workers assist with data collection and basic care',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security',
      color: 'text-purple-500'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access healthcare services anytime, anywhere you need them',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Comprehensive Care',
      description: 'Complete healthcare ecosystem from symptoms to treatment',
      color: 'text-teal-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'VirtuDoc helped me get quick medical advice when I needed it most. The AI diagnosis was surprisingly accurate!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Doctor',
      content: 'The platform streamlines patient consultations and the AI reports help me make better diagnoses.',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'Health Worker',
      content: 'Easy to use interface for recording patient data. The AI analysis helps me provide better care.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-8">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">VirtuDoc</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionary AI-powered telemedicine platform connecting patients with healthcare professionals. 
              Get instant health guidance, professional consultations, and comprehensive care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with human expertise to deliver exceptional healthcare experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-6`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone in Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a patient seeking care, a health worker providing support, or a doctor delivering expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Patients</h3>
              <p className="text-gray-600 mb-6">
                Describe symptoms, get AI-powered health insights, and connect with healthcare professionals for personalized care.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• AI symptom analysis</li>
                <li>• Virtual consultations</li>
                <li>• Health tracking</li>
                <li>• Secure messaging</li>
              </ul>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Health Workers</h3>
              <p className="text-gray-600 mb-6">
                Record patient vitals, capture medical photos, and leverage AI assistance for better patient care delivery.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Patient data entry</li>
                <li>• Vital signs recording</li>
                <li>• Photo documentation</li>
                <li>• AI-assisted analysis</li>
              </ul>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-6">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Doctors</h3>
              <p className="text-gray-600 mb-6">
                Review AI-generated reports, conduct virtual consultations, and provide expert medical guidance to patients.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Case management</li>
                <li>• AI report reviews</li>
                <li>• Video consultations</li>
                <li>• Patient monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users are saying about their VirtuDoc experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust VirtuDoc for their healthcare needs.
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center mx-auto">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">V</span>
                </div>
                <span className="text-xl font-bold">VirtuDoc</span>
              </div>
              <p className="text-gray-400">
                AI-powered telemedicine platform revolutionizing healthcare access.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>For Patients</li>
                <li>For Health Workers</li>
                <li>For Doctors</li>
                <li>AI Technology</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VirtuDoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
