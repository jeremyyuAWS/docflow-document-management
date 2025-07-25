import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History,
  GitBranch,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import type { CustomerDocument } from '../types';

interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    type: 'update' | 'add' | 'remove';
  }>;
  metadata: {
    createdAt: Date;
    createdBy: string;
    comment: string;
    tags: string[];
  };
  status: 'current' | 'archived' | 'draft';
}

interface DocumentVersioningProps {
  document: CustomerDocument;
  onVersionChange?: (version: DocumentVersion) => void;
  onRestore?: (version: DocumentVersion) => void;
}

function DocumentVersioning({ document, onVersionChange, onRestore }: DocumentVersioningProps) {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [versionComment, setVersionComment] = useState('');
  const [versionTags, setVersionTags] = useState<string[]>([]);

  // Mock version history
  const versions: DocumentVersion[] = [
    {
      id: 'v1',
      documentId: document.id,
      version: '1.0.0',
      changes: [
        {
          field: 'status',
          oldValue: 'draft',
          newValue: 'pending',
          type: 'update'
        }
      ],
      metadata: {
        createdAt: new Date(),
        createdBy: 'John Doe',
        comment: 'Initial version',
        tags: ['initial']
      },
      status: 'archived'
    },
    {
      id: 'v2',
      documentId: document.id,
      version: '1.1.0',
      changes: [
        {
          field: 'due_date',
          oldValue: '2024-03-01',
          newValue: '2024-03-15',
          type: 'update'
        }
      ],
      metadata: {
        createdAt: new Date(),
        createdBy: 'Jane Smith',
        comment: 'Updated due date',
        tags: ['deadline']
      },
      status: 'current'
    }
  ];

  const handleVersionSelect = (version: DocumentVersion) => {
    setSelectedVersion(version);
    if (onVersionChange) {
      onVersionChange(version);
    }
  };

  const handleRestore = async (version: DocumentVersion) => {
    setIsComparing(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (onRestore) {
        onRestore(version);
      }
    } finally {
      setIsComparing(false);
    }
  };

  const createNewVersion = async () => {
    // Simulate version creation
    const newVersion: DocumentVersion = {
      id: `v${versions.length + 1}`,
      documentId: document.id,
      version: `1.${versions.length}.0`,
      changes: [
        {
          field: 'content',
          oldValue: 'Previous content',
          newValue: 'Updated content',
          type: 'update'
        }
      ],
      metadata: {
        createdAt: new Date(),
        createdBy: 'Current User',
        comment: versionComment,
        tags: versionTags
      },
      status: 'draft'
    };

    setShowVersionForm(false);
    setVersionComment('');
    setVersionTags([]);
    handleVersionSelect(newVersion);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Version History</h3>
        </div>
        <button
          onClick={() => setShowVersionForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <GitBranch className="h-5 w-5 mr-2" />
          Create Version
        </button>
      </div>

      <AnimatePresence>
        {showVersionForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gray-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-gray-900 mb-4">Create New Version</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Comment
                </label>
                <textarea
                  value={versionComment}
                  onChange={(e) => setVersionComment(e.target.value)}
                  className="w-full rounded-lg"
                  rows={3}
                  placeholder="Describe your changes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (comma separated)"
                  className="w-full rounded-lg"
                  value={versionTags.join(', ')}
                  onChange={(e) => setVersionTags(e.target.value.split(',').map(t => t.trim()))}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowVersionForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewVersion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Version
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Version Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative pl-10 ${
                  selectedVersion?.id === version.id ? 'bg-blue-50 rounded-lg' : ''
                }`}
              >
                <div className="absolute left-0 p-2 rounded-full bg-white border-2 border-gray-200">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">Version {version.version}</span>
                      <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                        version.status === 'current'
                          ? 'bg-green-100 text-green-800'
                          : version.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVersionSelect(version)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 text-gray-600" />
                      </button>
                      {version.status !== 'current' && (
                        <button
                          onClick={() => handleRestore(version)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          disabled={isComparing}
                        >
                          {isComparing ? (
                            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          ) : (
                            <ArrowLeft className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(version.metadata.createdAt, 'MMM d, yyyy h:mm a')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {version.metadata.createdBy}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-gray-500">{version.metadata.comment}</div>
                  </div>

                  <div className="space-y-2">
                    {version.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="flex items-start text-sm"
                      >
                        <div className="mt-1">
                          {change.type === 'update' && (
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                          )}
                          {change.type === 'add' && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {change.type === 'remove' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="ml-2">
                          <span className="font-medium text-gray-900">{change.field}: </span>
                          <span className="text-red-600">{change.oldValue}</span>
                          <ArrowRight className="h-4 w-4 inline mx-1" />
                          <span className="text-green-600">{change.newValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {version.metadata.tags.length > 0 && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {version.metadata.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentVersioning;