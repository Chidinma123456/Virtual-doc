import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2025 VirtuDoc. All rights reserved. HIPAA Compliant Healthcare Platform.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Built with</span>
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              ⚡ Bolt.new
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;