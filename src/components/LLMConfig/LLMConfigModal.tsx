import React, { useState } from 'react';
import { X, Key, Globe, Lock } from 'lucide-react';
import { llmService } from '../../services/llmService';

interface LLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const LLMConfigModal: React.FC<LLMConfigModalProps> = ({ isOpen, onClose, onConfigured }) => {
  const [config, setConfig] = useState({
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      llmService.configure(config);
      
      // Test the configuration with a simple request
      await llmService.generateResponse('Hello, this is a test message.');
      
      // Store configuration in localStorage (in production, use secure storage)
      localStorage.setItem('llm_config', JSON.stringify(config));
      
      onConfigured();
      onClose();
    } catch (err) {
      setError('Failed to configure LLM service. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Configure AWS Bedrock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              AWS Region
            </label>
            <select
              value={config.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Access Key ID
            </label>
            <input
              type="text"
              value={config.accessKeyId}
              onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
              placeholder="AKIA..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Secret Access Key
            </label>
            <input
              type="password"
              value={config.secretAccessKey}
              onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
              placeholder="Enter your secret access key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Your AWS credentials are stored locally and used only to connect to Bedrock Claude Haiku for Dr. Ava responses.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !config.accessKeyId || !config.secretAccessKey}
              className="flex-1 py-2 px-4 bg-medical-500 hover:bg-medical-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              {isLoading ? 'Testing...' : 'Configure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LLMConfigModal;