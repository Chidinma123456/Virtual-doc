import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { llmService } from '../../services/llmService';

interface LLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const LLMConfigModal: React.FC<LLMConfigModalProps> = ({ isOpen, onClose, onConfigured }) => {
  const [config, setConfig] = useState({
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [envStatus, setEnvStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const status = llmService.getConfiguration();
      setEnvStatus(status);
      
      // If already configured from env, show success
      if (status.envConfigured && status.hasCredentials) {
        setSuccess('Dr. Ava is already configured from your environment variables!');
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      llmService.configure(config);
      
      // Test the configuration with a simple request
      const testResponse = await llmService.generateResponse('Hello, this is a test message.');
      
      if (testResponse.includes('authentication') || testResponse.includes('credentials')) {
        throw new Error('Authentication failed');
      }
      
      // Store configuration in localStorage (in production, use secure storage)
      localStorage.setItem('llm_config', JSON.stringify(config));
      
      setSuccess('Dr. Ava is now ready to help patients!');
      
      setTimeout(() => {
        onConfigured();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Configuration error:', err);
      if (err.message?.includes('Authentication') || err.message?.includes('AccessDenied')) {
        setError('Authentication failed. Please check your AWS credentials and ensure Bedrock access is enabled in your AWS account.');
      } else if (err.message?.includes('Region')) {
        setError('Invalid region or Bedrock not available in this region. Please try a different region.');
      } else {
        setError('Failed to configure Dr. Ava. Please check your AWS credentials and ensure Bedrock access is enabled.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleUseEnvVars = () => {
    setConfig({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    });
    setError('');
    setSuccess('');
  };

  const isEnvConfigured = () => {
    return envStatus?.envConfigured;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Configure Dr. Ava</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Environment Status */}
        <div className="mb-4">
          {isEnvConfigured() ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-700">
                    AWS credentials detected from .env file
                  </p>
                </div>
                <button
                  onClick={handleUseEnvVars}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  Use These
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-700">
                  No valid AWS credentials found in environment variables
                </p>
              </div>
            </div>
          )}
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
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
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
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 mb-2">
              <strong>Required:</strong> AWS account with Bedrock access and Claude Haiku model enabled.
            </p>
            <p className="text-xs text-blue-600">
              💡 <strong>Tip:</strong> Add your credentials to the .env file for automatic configuration:
            </p>
            <div className="mt-2 p-2 bg-blue-100 rounded text-xs font-mono text-blue-800">
              VITE_AWS_REGION=us-east-1<br/>
              VITE_AWS_ACCESS_KEY_ID=your_key<br/>
              VITE_AWS_SECRET_ACCESS_KEY=your_secret
            </div>
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
              disabled={isLoading || (!config.accessKeyId || !config.secretAccessKey)}
              className="flex-1 py-2 px-4 bg-medical-500 hover:bg-medical-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Configure Dr. Ava'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LLMConfigModal;