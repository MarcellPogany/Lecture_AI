import React from 'react';
import { UserSettings } from '../hooks/useSettings';

interface SettingsPageProps {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, updateSettings }) => {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.5px' }}>Settings</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Default Transcription Language
          </label>
          <select
            value={settings.transcriptionLanguage}
            onChange={(e) => updateSettings({ transcriptionLanguage: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">🌐 Auto-Detect (Multilingual)</option>
            <optgroup label="Common Languages">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="hu-HU">Hungarian</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="pt-PT">Portuguese (Portugal)</option>
              <option value="ru-RU">Russian</option>
              <option value="pl-PL">Polish</option>
              <option value="nl-NL">Dutch</option>
              <option value="sv-SE">Swedish</option>
              <option value="da-DK">Danish</option>
              <option value="fi-FI">Finnish</option>
              <option value="nb-NO">Norwegian</option>
              <option value="cs-CZ">Czech</option>
              <option value="sk-SK">Slovak</option>
              <option value="ro-RO">Romanian</option>
              <option value="uk-UA">Ukrainian</option>
            </optgroup>
            <optgroup label="Asian Languages">
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="zh-TW">Chinese (Traditional)</option>
              <option value="th-TH">Thai</option>
              <option value="vi-VN">Vietnamese</option>
              <option value="id-ID">Indonesian</option>
            </optgroup>
            <optgroup label="Middle East &amp; Africa">
              <option value="ar-SA">Arabic</option>
              <option value="he-IL">Hebrew</option>
              <option value="tr-TR">Turkish</option>
              <option value="fa-IR">Persian (Farsi)</option>
              <option value="hi-IN">Hindi</option>
            </optgroup>
          </select>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong>Auto-Detect</strong> handles code-switching between languages (e.g., English ↔ Hungarian) automatically.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Text-to-Speech Voice
          </label>
          <select
            value={settings.ttsVoice}
            onChange={(e) => updateSettings({ ttsVoice: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Kore">Kore (Female)</option>
            <option value="Puck">Puck (Male)</option>
            <option value="Charon">Charon (Male)</option>
            <option value="Fenrir">Fenrir (Male)</option>
            <option value="Zephyr">Zephyr (Female)</option>
          </select>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            The voice used when generating audio from text.
          </span>
        </div>
      </div>
    </div>
  );
};
