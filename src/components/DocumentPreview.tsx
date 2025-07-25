import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Share2
} from 'lucide-react';
import type { CustomerDocument } from '../types';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPreviewProps {
  document: CustomerDocument;
  onClose?: () => void;
}

function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Implement sharing functionality
    console.log('Share document:', document.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h3 className="text-xl font-semibold text-gray-900">{document.name}</h3>
            <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
              document.status === 'received' ? 'bg-green-100 text-green-800' :
              document.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {document.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 text-gray-600" />
              ) : (
                <Maximize2 className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Rotate"
            >
              <RotateCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pageNumber} of {numPages || '?'}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => {/* Implement download */}}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto max-h-[calc(100vh-300px)]">
          <Document
            file={`https://example.com/documents/${document.id}.pdf`} // Replace with actual URL
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-600 mb-2">Failed to load PDF</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreview;