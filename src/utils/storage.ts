import { ClassroomConfig } from '../types';
import { DEFAULT_CONFIG } from './constants';

const STORAGE_KEY = 'classroomCopilot.settings';

export const saveConfig = (config: ClassroomConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save configuration:', error);
  }
};

export const loadConfig = (): ClassroomConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
  return DEFAULT_CONFIG;
};

export const savePreset = (name: string, config: ClassroomConfig): void => {
  try {
    const presets = getPresets();
    presets[name] = config;
    localStorage.setItem('classroomCopilot.presets', JSON.stringify(presets));
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
};

export const getPresets = (): Record<string, ClassroomConfig> => {
  try {
    const saved = localStorage.getItem('classroomCopilot.presets');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load presets:', error);
  }
  return {};
};

export const deletePreset = (name: string): void => {
  try {
    const presets = getPresets();
    delete presets[name];
    localStorage.setItem('classroomCopilot.presets', JSON.stringify(presets));
  } catch (error) {
    console.error('Failed to delete preset:', error);
  }
};