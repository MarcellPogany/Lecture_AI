import { useState, useEffect } from 'react';

export interface UserSettings {
  transcriptionLanguage: string;
  ttsVoice: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  transcriptionLanguage: 'en-US',
  ttsVoice: 'Kore',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lectureai_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('lectureai_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
