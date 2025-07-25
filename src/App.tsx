import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  BarChart2,
  Settings,
  Search 
} from 'lucide-react';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import FollowUpScheduler from './components/FollowUpScheduler';
import DocumentUpload from './components/DocumentUpload';
import AIRecommendations from './components/AIRecommendations';
import SmartTemplateBuilder from './components/SmartTemplateBuilder';
import SmartAnalyticsDashboard from './components/SmartAnalyticsDashboard';
import SmartSearch from './components/SmartSearch';
import DocumentComparison from './components/DocumentComparison';
import DocumentVersioning from './components/DocumentVersioning';
import DocumentPreview from './components/DocumentPreview';
import BatchOperations from './components/BatchOperations';
import WelcomeGuide from './components/WelcomeGuide';
import { Toaster } from 'react-hot-toast';
import { mockCustomers, mockDocuments } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocument, setSelectedDocument] = useState(Object.values(mockDocuments).flat()[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);

  // Check if it's the first visit
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenWelcomeGuide');
    setShowWelcomeGuide(!hasSeenGuide);
  }, []);

  const handleCloseWelcomeGuide = () => {
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
    setShowWelcomeGuide(false);
  };

  const handleBatchAction = (action: string, documents: any[], options?: any) => {
    console.log('Batch action:', action, documents, options);
    // Implement batch action handling
  };

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'followup', label: 'Follow-ups', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-xl">D</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold">DocFlow</h1>
                  <p className="text-xs text-gray-400">Smart Document Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Search */}
        <div className="mb-8">
          <SmartSearch 
            customers={mockCustomers} 
            documents={mockDocuments}
          />
        </div>

        {/* Main Navigation */}
        <div className="flex space-x-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Context-aware secondary navigation */}
          <div className="lg:col-span-1">
            {activeTab === 'documents' && <DocumentUpload />}
            {activeTab === 'customers' && <CustomerForm />}
            {activeTab === 'followup' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium mb-4">Follow-up Settings</h3>
                {/* Add follow-up settings content */}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'documents' && (
              <div className="space-y-8">
                <BatchOperations 
                  documents={Object.values(mockDocuments).flat()}
                  onBatchAction={handleBatchAction}
                />
                <DocumentComparison documents={Object.values(mockDocuments).flat()} />
                <DocumentVersioning document={selectedDocument} />
                <AIRecommendations documents={Object.values(mockDocuments).flat()} />
              </div>
            )}
            {activeTab === 'customers' && <CustomerList />}
            {activeTab === 'followup' && <FollowUpScheduler />}
            {activeTab === 'messages' && <SmartTemplateBuilder />}
            {activeTab === 'analytics' && <SmartAnalyticsDashboard />}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium mb-4">System Settings</h3>
                {/* Add settings content */}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Document Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <DocumentPreview
              document={selectedDocument}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}

      {/* Welcome Guide */}
      {showWelcomeGuide && <WelcomeGuide onClose={handleCloseWelcomeGuide} />}
      
      <Toaster position="top-right" />
    </div>
  );
}

export default App;