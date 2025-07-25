import React from 'react';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const documents = [
  {
    id: 1,
    name: "Driver's License",
    status: 'pending',
    dueDate: '2024-03-20',
  },
  {
    id: 2,
    name: 'Insurance Card',
    status: 'received',
    dueDate: '2024-03-15',
  },
  {
    id: 3,
    name: 'Proof of Address',
    status: 'overdue',
    dueDate: '2024-03-10',
  },
];

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  received: 'bg-green-50 text-green-800',
  overdue: 'bg-red-50 text-red-800',
};

const statusIcons = {
  pending: Clock,
  received: CheckCircle,
  overdue: AlertCircle,
};

function DocumentList() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
        <div className="space-y-4">
          {documents.map((doc) => {
            const StatusIcon = statusIcons[doc.status];
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">Due: {doc.dueDate}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[doc.status]
                  }`}
                >
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DocumentList;