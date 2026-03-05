import React, { useState } from 'react';
import { Download, Copy, FileText, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { ArtifactType } from '../types';
import { exportToDocx, exportToPdf, copyToClipboard } from '../utils/documentExport';

interface OutputSectionProps {
  artifacts: Record<ArtifactType, string>;
  onClearAll: () => void;
  onRemoveArtifact: (type: ArtifactType) => void;
}

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  lessonPlan: 'Lesson Plan',
  quiz: 'Quiz',
  test: 'Test',
  project: 'Project',
  worksheet: 'Worksheet',
  rubric: 'Rubric',
  parentNote: 'Parent Note'
};

export const OutputSection: React.FC<OutputSectionProps> = ({
  artifacts,
  onClearAll,
  onRemoveArtifact
}) => {
  const [activeTab, setActiveTab] = useState<ArtifactType>('lessonPlan');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const availableArtifacts = Object.entries(artifacts).filter(([_, content]) => content.trim());
  const currentContent = artifacts[activeTab];

  const handleCopy = async () => {
    if (currentContent) {
      await copyToClipboard(currentContent);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleExportDocx = () => {
    if (currentContent) {
      exportToDocx(currentContent, `${ARTIFACT_LABELS[activeTab]}-${Date.now()}`);
    }
  };

  const handleExportPdf = () => {
    if (currentContent) {
      exportToPdf(currentContent, `${ARTIFACT_LABELS[activeTab]}-${Date.now()}`);
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setShowClearConfirm(false);
  };

  const handleRemoveCurrent = () => {
    onRemoveArtifact(activeTab);
    // Switch to first available artifact or default to lessonPlan
    const remaining = Object.entries(artifacts).filter(([key, content]) => 
      key !== activeTab && content.trim()
    );
    if (remaining.length > 0) {
      setActiveTab(remaining[0][0] as ArtifactType);
    } else {
      setActiveTab('lessonPlan');
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown to HTML conversion
    return content
      .replace(/###\s*/g, '') // Remove ### headings
      .replace(/\//g, '') // Remove forward slashes
      .replace(/\\/g, '') // Remove backslashes
      .replace(/"/g, '') // Remove quotes
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-3 text-gray-900">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div>
      {availableArtifacts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No deliverables generated yet.</p>
          <p className="text-xs mt-1">Start a conversation to generate content!</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max px-4">
              {Object.entries(ARTIFACT_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as ArtifactType)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${artifacts[key as ArtifactType]?.trim() ? '' : 'opacity-50'}`}
                  disabled={!artifacts[key as ArtifactType]?.trim()}
                >
                  {label}
                  {artifacts[key as ArtifactType]?.trim() && (
                    <span className="ml-1 inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Content */}
          {currentContent && (
            <div>
              {/* Actions */}
              <div className="sticky top-0 z-10 bg-white flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 shadow-sm">
                <button
                  onClick={handleRemoveCurrent}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  title="Remove this artifact"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {copySuccess || 'Copy'}
                </button>
                <button
                  onClick={handleExportDocx}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  <Download className="h-3 w-3" />
                  .docx
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  <Download className="h-3 w-3" />
                  .pdf
                </button>
              </div>

              {/* Content Display */}
              <div className="p-3 max-h-96 overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p class="mb-2">${formatContent(currentContent)}</p>` 
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Clear All Artifacts?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently remove all generated content from the deliverables panel. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};