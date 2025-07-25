import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare,
  Square,
  Tag,
  Calendar,
  Send,
  Archive,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import type { CustomerDocument } from '../types';
import { format } from 'date-fns';

interface BatchOperationsProps {
  documents: CustomerDocument[];
  onBatchAction?: (action: string, documents: CustomerDocument[]) => void;
}

function BatchOperations({ documents, onBatchAction }: BatchOperationsProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<string>('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleSelectAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map(doc => doc.id)));
    }
  };

  const handleSelectDocument = (docId: string) => {
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocs(newSelection);
  };

  const handleBatchAction = (action: string) => {
    if (selectedDocs.size === 0) return;

    if (['delete', 'archive'].includes(action)) {
      setConfirmationAction(action);
      setShowConfirmation(true);
      return;
    }

    if (action === 'tag') {
      setShowTagInput(true);
      return;
    }

    if (action === 'schedule') {
      setShowDatePicker(true);
      return;
    }

    const selectedDocuments = documents.filter(doc => selectedDocs.has(doc.id));
    if (onBatchAction) {
      onBatchAction(action, selectedDocuments);
    }
  };

  const confirmAction = () => {
    const selectedDocuments = documents.filter(doc => selectedDocs.has(doc.id));
    if (onBatchAction) {
      onBatchAction(confirmationAction, selectedDocuments);
    }
    setShowConfirmation(false);
    setSelectedDocs(new Set());
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const selectedDocuments = documents.filter(doc => selectedDocs.has(doc.id));
    if (onBatchAction) {
      onBatchAction('tag', selectedDocuments, { tag: newTag.trim() });
    }
    setShowTagInput(false);
    setNewTag('');
  };

  const handleSchedule = () => {
    if (!selectedDate) return;
    
    const selectedDocuments = documents.filter(doc => selectedDocs.has(doc.id));
    if (onBatchAction) {
      onBatchAction('schedule', selectedDocuments, { date: selectedDate });
    }
    setShowDatePicker(false);
    setSelectedDate('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CheckSquare className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Batch Operations</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">
            {selectedDocs.size} selected
          </span>
          <button
            onClick={handleSelectAll}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            {selectedDocs.size === documents.length ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Select All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
        {documents.map(doc => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selectedDocs.has(doc.id)
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSelectDocument(doc.id)}
          >
            {selectedDocs.has(doc.id) ? (
              <CheckSquare className="h-5 w-5 text-blue-600 mr-3" />
            ) : (
              <Square className="h-5 w-5 text-gray-400 mr-3" />
            )}
            <div className="flex-1">
              <div className="font-medium text-gray-900">{doc.name}</div>
              <div className="text-sm text-gray-500">
                {doc.type} • Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              doc.status === 'received' ? 'bg-green-100 text-green-800' :
              doc.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {doc.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleBatchAction('tag')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Tag className="h-4 w-4 mr-2" />
          Add Tags
        </button>
        <button
          onClick={() => handleBatchAction('schedule')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </button>
        <button
          onClick={() => handleBatchAction('send')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </button>
        <button
          onClick={() => handleBatchAction('archive')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </button>
        <button
          onClick={() => handleBatchAction('download')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </button>
        <button
          onClick={() => handleBatchAction('delete')}
          disabled={selectedDocs.size === 0}
          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Confirm {confirmationAction}
                </h4>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {confirmationAction} {selectedDocs.size} selected documents?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tag Input Modal */}
        {showTagInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Tag className="h-6 w-6 text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Add Tags</h4>
                </div>
                <button
                  onClick={() => setShowTagInput(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name..."
                className="w-full mb-4 rounded-lg"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTagInput(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">Schedule Documents</h4>
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full mb-4 rounded-lg"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BatchOperations;