import React, { RefObject, useRef } from 'react';
import { Session } from '../types';
import { TranscriptHeader } from './transcript/TranscriptHeader';
import { LiveIndicator } from './transcript/LiveIndicator';
import { SelectionAction } from './transcript/SelectionAction';
import { Paperclip, X, Plus } from 'lucide-react';

interface TranscriptViewProps {
  activeSession: Session;
  isSummarizing: boolean;
  isRecording: boolean;
  recordingSessionId: string | null;
  interimText: string;
  selectedText: string;
  isSelectedGeneratingTTS: boolean;
  selectedTtsAudioUrl: string | null;
  transcriptRef: RefObject<HTMLTextAreaElement | null>;
  onSummarize: () => void;
  onTranscriptSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onTranscriptChange: (text: string) => void;
  onGenerateSelectionTTS: () => void;
  onAddAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  activeSession, isSummarizing, isRecording, recordingSessionId, interimText,
  selectedText, isSelectedGeneratingTTS, selectedTtsAudioUrl, transcriptRef,
  onSummarize, onTranscriptSelect, onTranscriptChange, onGenerateSelectionTTS,
  onAddAttachment, onRemoveAttachment
}) => {
  const isCurrentRecording = isRecording && activeSession.id === recordingSessionId;
  const fullText = activeSession.transcript + (isCurrentRecording && interimText ? (activeSession.transcript ? ' ' : '') + interimText : '');
  const wordCount = activeSession.transcript.trim() ? activeSession.transcript.trim().split(/\s+/).length : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <TranscriptHeader 
        activeSession={activeSession} 
        isSummarizing={isSummarizing} 
        onSummarize={onSummarize} 
        wordCount={wordCount} 
      />

      {isCurrentRecording && <LiveIndicator />}

      <textarea
        ref={transcriptRef}
        value={fullText}
        onChange={(e) => onTranscriptChange(e.target.value.replace(interimText, '').trim())}
        onSelect={onTranscriptSelect}
        onKeyUp={onTranscriptSelect}
        onMouseUp={onTranscriptSelect}
        placeholder="Transcript will appear here..."
        style={{
          flex: 1, width: '100%', padding: '24px 28px',
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '14px',
          resize: 'none', outline: 'none', fontFamily: "'Inter', sans-serif",
          fontSize: '15px', lineHeight: '1.8', letterSpacing: '-0.01em'
        }}
      />

      <SelectionAction 
        selectedText={selectedText} 
        isSelectedGeneratingTTS={isSelectedGeneratingTTS} 
        onGenerateSelectionTTS={onGenerateSelectionTTS} 
      />

      {selectedTtsAudioUrl && (
        <div style={{ marginTop: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Selection Audio</span>
          <audio src={selectedTtsAudioUrl} controls autoPlay style={{ height: '28px', flex: 1 }} />
        </div>
      )}

      {/* Attachments Section */}
      <div style={{ marginTop: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Additional Documents</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-glow)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Plus size={14} />
            Add Document
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAddAttachment}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          />
        </div>
        
        {activeSession.attachments && activeSession.attachments.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {activeSession.attachments.map(att => (
              <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-muted)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                <button
                  onClick={() => onRemoveAttachment(att.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Upload slides, notes, or textbook chapters to enhance the AI summary.
          </div>
        )}
      </div>
    </div>
  );
};
