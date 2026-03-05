import React, { useState } from 'react';
import { Settings, Save, Upload, X, ChevronDown, ChevronUp, FileText, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { ClassroomConfig } from '../types';
import { GRADE_OPTIONS, STANDARDS_OPTIONS } from '../utils/constants';
import { saveConfig, savePreset, getPresets, deletePreset } from '../utils/storage';
import { OutputSection } from './OutputSection';
import { ArtifactType } from '../types';

interface ConfigPanelProps {
  config: ClassroomConfig;
  onConfigChange: (config: ClassroomConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  artifacts: Record<ArtifactType, string>;
  onClearAllArtifacts: () => void;
  onRemoveArtifact: (type: ArtifactType) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onConfigChange,
  isOpen,
  onToggle,
  artifacts,
  onClearAllArtifacts,
  onRemoveArtifact
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [userPresets, setUserPresets] = useState(getPresets());
  const [customSubjects, setCustomSubjects] = useState(() => {
    const saved = localStorage.getItem('classroomCopilot.customSubjects');
    return saved ? JSON.parse(saved) : [
      'Business', 'Technology', 'Economics', 'ELA', 'Math', 'Science', 
      'Social Studies', 'CTE', 'Computer Science', 'Art', 'Music', 'PE'
    ];
  });
  const [newSubject, setNewSubject] = useState('');

  const updateConfig = (updates: Partial<ClassroomConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
    saveConfig(newConfig);
  };

  const saveCustomSubjects = (subjects: string[]) => {
    setCustomSubjects(subjects);
    localStorage.setItem('classroomCopilot.customSubjects', JSON.stringify(subjects));
  };

  const addSubject = () => {
    if (newSubject.trim() && !customSubjects.includes(newSubject.trim())) {
      const updatedSubjects = [...customSubjects, newSubject.trim()].sort();
      saveCustomSubjects(updatedSubjects);
      setNewSubject('');
    }
  };

  const deleteSubject = (subjectToDelete: string) => {
    const updatedSubjects = customSubjects.filter(subject => subject !== subjectToDelete);
    saveCustomSubjects(updatedSubjects);
    // If the deleted subject was selected, clear the selection
    if (config.subjects === subjectToDelete) {
      updateConfig({ subjects: '' });
    }
  };
  const handleShowSettings = (show: boolean) => {
    setShowSettings(show);
    if (show) {
      setShowDeliverables(false);
    }
  };

  const handleShowDeliverables = (show: boolean) => {
    setShowDeliverables(show);
    if (show) {
      setShowSettings(false);
    }
  };

  const loadPreset = (preset: ClassroomConfig) => {
    onConfigChange(preset);
    saveConfig(preset);
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName, config);
      setUserPresets(getPresets());
      setPresetName('');
      setShowPresetModal(false);
    }
  };

  const handleDeletePreset = (name: string) => {
    deletePreset(name);
    setUserPresets(getPresets());
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen 
          ? 'fixed lg:relative inset-y-0 left-0 w-full sm:w-96 z-50 lg:z-auto shadow-xl lg:shadow-none' 
          : 'w-12'
      }`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:static"
            aria-label="Toggle configuration panel"
          >
            <Settings className="h-5 w-5" />
          </button>
          {isOpen && (
            <div className="flex items-center justify-between flex-1 ml-3">
              <h2 className="text-lg font-semibold text-gray-900">Classroom Settings</h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Current Configuration Display - Always Visible */}
            <div className="bg-blue-50 p-3 rounded-lg m-4 mb-0 sticky top-0 z-10 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Settings</h3>
              <div className="space-y-1 text-xs text-blue-800">
                <div><span className="font-medium">Level:</span> {config.level}</div>
                <div><span className="font-medium">Grade:</span> {config.grades || 'Not selected'}</div>
                <div><span className="font-medium">Subject:</span> {config.subjects || 'Not selected'}</div>
                <div><span className="font-medium">Standards:</span> {config.standards.type || 'None'}</div>
                <div><span className="font-medium">Depth:</span> {config.outputDepth}</div>
                <div><span className="font-medium">Reading Level:</span> Grade {config.readingLevel}</div>
                {(config.differentiation.ell || config.differentiation.iep504 || config.differentiation.extension) && (
                  <div><span className="font-medium">Differentiation:</span> {
                    [
                      config.differentiation.ell && 'ELL',
                      config.differentiation.iep504 && 'IEP/504',
                      config.differentiation.extension && 'Extension'
                    ].filter(Boolean).join(', ')
                  }</div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Classroom Settings Section */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => handleShowSettings(!showSettings)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium text-gray-900">Classroom Settings</span>
                  </div>
                  {showSettings ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {showSettings && (
                  <div className="p-4 pt-0 space-y-6">
                    {/* User Presets */}
                    {Object.keys(userPresets).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Saved Presets
                        </label>
                        <div className="space-y-2">
                          {Object.entries(userPresets).map(([name, preset]) => (
                            <div key={name} className="flex items-center gap-2">
                              <button
                                onClick={() => loadPreset(preset)}
                                className="flex-1 text-left p-2 text-sm bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                              >
                                {name}
                              </button>
                              <button
                                onClick={() => handleDeletePreset(name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        onClick={() => setShowPresetModal(true)}
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Save className="h-4 w-4" />
                        Save Current as Preset
                      </button>
                    </div>

                    {/* School Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Level
                      </label>
                      <select
                        value={config.level}
                        onChange={(e) => updateConfig({ level: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Elementary">Elementary</option>
                        <option value="Middle">Middle</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    {/* Grades */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <select
                        value={config.grades || ''}
                        onChange={(e) => updateConfig({ grades: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Grade</option>
                        {GRADE_OPTIONS.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        value={config.subjects || ''}
                        onChange={(e) => updateConfig({ subjects: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Subject</option>
                        {customSubjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                      
                      {/* Add New Subject */}
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSubject();
                              }
                            }}
                            placeholder="Add new subject..."
                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={addSubject}
                            disabled={!newSubject.trim() || customSubjects.includes(newSubject.trim())}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Subject Management */}
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                          {customSubjects.map(subject => (
                            <div key={subject} className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                              <span className="text-sm text-gray-700">{subject}</span>
                              <button
                                onClick={() => deleteSubject(subject)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title={`Delete ${subject}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Standards */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standards
                      </label>
                      <select
                        value={config.standards.type || ''}
                        onChange={(e) => updateConfig({ 
                          standards: { 
                            type: e.target.value as any || null,
                            customText: config.standards.customText 
                          } 
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">None</option>
                        {STANDARDS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {config.standards.type === 'Custom' && (
                        <textarea
                          value={config.standards.customText || ''}
                          onChange={(e) => updateConfig({
                            standards: { ...config.standards, customText: e.target.value }
                          })}
                          placeholder="Enter custom standards or descriptors..."
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      )}
                    </div>

                    {/* Output Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output Depth
                      </label>
                      <select
                        value={config.outputDepth}
                        onChange={(e) => updateConfig({ outputDepth: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Quick">Quick</option>
                        <option value="Standard">Standard</option>
                        <option value="Detailed">Detailed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reading Level: Grade {config.readingLevel}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={config.readingLevel}
                        onChange={(e) => updateConfig({ readingLevel: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Differentiation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Differentiation
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.differentiation.ell}
                            onChange={(e) => updateConfig({
                              differentiation: { ...config.differentiation, ell: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">ELL Supports</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.differentiation.iep504}
                            onChange={(e) => updateConfig({
                              differentiation: { ...config.differentiation, iep504: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">IEP/504 Accommodations</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.differentiation.extension}
                            onChange={(e) => updateConfig({
                              differentiation: { ...config.differentiation, extension: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Extension for Advanced</span>
                        </label>
                      </div>
                    </div>

                    {/* Academic Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Include Features
                      </label>
                      <div className="space-y-2">
                        {Object.entries({
                          objectives: 'Learning Objectives (Bloom verbs)',
                          materials: 'Materials List',
                          timing: 'Timing/Sequence',
                          checks: 'Formative Checks',
                          rubrics: 'Rubrics',
                          citations: 'Cite Sources'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={config.include[key as keyof typeof config.include]}
                              onChange={(e) => updateConfig({
                                include: { ...config.include, [key]: e.target.checked }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deliverables Section */}
              <div>
                <button
                  onClick={() => handleShowDeliverables(!showDeliverables)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-gray-900">Deliverables</span>
                    {Object.values(artifacts).filter(content => content.trim()).length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {Object.values(artifacts).filter(content => content.trim()).length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {Object.values(artifacts).filter(content => content.trim()).length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearAllArtifacts();
                        }}
                        className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                        title="Clear all artifacts"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                    {showDeliverables ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {showDeliverables && (
                  <div className="border-t border-gray-200">
                    <OutputSection
                      artifacts={artifacts}
                      onClearAll={onClearAllArtifacts}
                      onRemoveArtifact={onRemoveArtifact}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Save Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Configuration Preset</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};