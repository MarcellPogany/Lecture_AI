import React, { RefObject, useRef, useState } from 'react';
import { Session } from '../types';
import { TranscriptHeader } from './transcript/TranscriptHeader';
import { LiveIndicator } from './transcript/LiveIndicator';
import { SelectionAction } from './transcript/SelectionAction';
import { Paperclip, X, Plus, Youtube, Globe, Link as LinkIcon, Loader2, Cloud } from 'lucide-react';

interface TranscriptViewProps {
  activeSession: Session;
  isSummarizing: boolean;
  isRecording: boolean;
  recordingSessionId: string | null;
  interimText: string;
  processingText: string;
  recordingTime: number;
  recordingSource: 'mic' | 'tab' | null;
  formatTime: (s: number) => string;
  isPaused: boolean;
  selectedText: string;
  isSelectedGeneratingTTS: boolean;
  selectedTtsAudioUrl: string | null;
  transcriptRef: RefObject<HTMLTextAreaElement | null>;
  isAddingSource?: boolean;
  onSummarize: () => void;
  onTranscriptSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onTranscriptChange: (text: string) => void;
  onGenerateSelectionTTS: () => void;
  onResumeRecording: () => void;
  onPauseRecording?: () => void;
  onStopRecording?: () => void;
  onAddAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
  onAddSourceUrl?: (url: string) => void;
  onAddSourceYouTube?: (url: string) => void;
  onAppendAudio?: (file: File) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  activeSession, isSummarizing, isRecording, recordingSessionId, interimText, processingText,
  recordingTime, recordingSource, formatTime, isPaused,
  selectedText, isSelectedGeneratingTTS, selectedTtsAudioUrl, transcriptRef,
  isAddingSource,
  onSummarize, onTranscriptSelect, onTranscriptChange, onGenerateSelectionTTS,
  onResumeRecording, onPauseRecording, onStopRecording, onAddAttachment, onRemoveAttachment, onAddSourceUrl, onAddSourceYouTube, onAppendAudio
}) => {
  const isCurrentRecording = isRecording && activeSession.id === recordingSessionId;
  const showTabRecordingMsg = isCurrentRecording && recordingSource === 'tab';
  
  // Create a "Waterfall" effect: Permanent Transcript -> Processing Cloud Text -> Live Browser Preview
  const tFull = activeSession.transcript ? activeSession.transcript + ' ' : '';
  const pFull = isCurrentRecording && processingText ? processingText + ' ' : '';
  const iFull = isCurrentRecording && interimText ? interimText : '';
  const fullText = (tFull + pFull + iFull).trim();
  
  const wordCount = activeSession.transcript.trim() ? activeSession.transcript.trim().split(/\s+/).length : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [showSourceInput, setShowSourceInput] = useState<'none' | 'url' | 'youtube'>('none');
  const [sourceValue, setSourceValue] = useState('');

  const handleAddSource = () => {
    if (!sourceValue.trim()) return;
    if (showSourceInput === 'url' && onAddSourceUrl) {
      onAddSourceUrl(sourceValue.trim());
    } else if (showSourceInput === 'youtube' && onAddSourceYouTube) {
      onAddSourceYouTube(sourceValue.trim());
    }
    setSourceValue('');
    setShowSourceInput('none');
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAppendAudio) {
      onAppendAudio(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <TranscriptHeader 
        activeSession={activeSession} 
        isSummarizing={isSummarizing} 
        onSummarize={onSummarize} 
        onResume={onResumeRecording}
        wordCount={wordCount} 
      />

      {isCurrentRecording && (
        <div style={{ padding: '16px 20px', background: 'rgba(30,41,59,0.02)', border: '1px border var(--border)', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPaused ? '#f59e0b' : '#ef4444' }} className={isPaused ? '' : 'animate-pulse'} />
              <span style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>{formatTime(recordingTime)}</span>
            </div>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isPaused ? (
                <button 
                  onClick={onResumeRecording}
                  style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Resume
                </button>
              ) : (
                <button 
                  onClick={onPauseRecording}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Pause
                </button>
              )}
              <button 
                onClick={onStopRecording}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Finish session
              </button>
            </div>
          </div>
          
          {recordingSource === 'mic' && <LiveIndicator />}
        </div>
      )}

      {showTabRecordingMsg ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', minHeight: '300px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Cloud size={32} color="var(--accent)" className={isPaused ? '' : 'animate-pulse'} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Capturing Tab Audio...</h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.6', margin: 0 }}>
            Live transcription is unavailable while capturing tab audio directly. A high-quality full transcript will be generated automatically when you finish the session.
          </p>
        </div>
      ) : (
        <textarea
          ref={transcriptRef}
          value={fullText}
          onChange={(e) => {
            const val = e.target.value;
            // When editing manually, strip out the temporary processing/interim texts so they aren't saved permanently
            const cleanVal = val.replace(interimText, '').replace(processingText, '').trim();
            onTranscriptChange(cleanVal);
          }}
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
      )}

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

      {/* Attachments & Sources Section */}
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Additional Documents */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Related Files</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-glow)', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
            >
              <Plus size={14} />
              Add
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onAddAttachment}
              style={{ display: 'none' }}
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            />
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
            {activeSession.attachments && activeSession.attachments.length > 0 ? (
              activeSession.attachments.map(att => (
                <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                  <button onClick={() => onRemoveAttachment(att.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--text-muted)' }}>
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No files attached.</span>
            )}
          </div>
        </div>

        {/* Web & Media Sources */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LinkIcon size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Web & YouTube</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setShowSourceInput(showSourceInput === 'youtube' ? 'none' : 'youtube')}
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '4px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Add YouTube Video"
              >
                <Youtube size={14} />
              </button>
              <button
                onClick={() => setShowSourceInput(showSourceInput === 'url' ? 'none' : 'url')}
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '4px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Add Web URL"
              >
                <Globe size={14} />
              </button>
            </div>
          </div>

          {showSourceInput !== 'none' && (
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={showSourceInput === 'youtube' ? 'Paste YouTube URL...' : 'Paste Web URL...'}
                value={sourceValue}
                onChange={(e) => setSourceValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', outline: 'none' }}
              />
              <button
                onClick={handleAddSource}
                disabled={isAddingSource}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isAddingSource ? <Loader2 size={12} className="animate-spin" /> : 'Import'}
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
            {activeSession.sources && activeSession.sources.length > 0 ? (
              activeSession.sources.map(src => (
                <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {src.type === 'youtube' ? <Youtube size={12} color="#FF0000" /> : <Globe size={12} color="var(--accent)" />}
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.name}</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No external sources.</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', background: 'var(--bg-muted)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Paperclip size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Transcribe Additional Audio</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Add another recording to this session and merge transcripts.</div>
          </div>
        </div>
        <button
          onClick={() => audioInputRef.current?.click()}
          style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Select Audio
        </button>
        <input 
          type="file" 
          ref={audioInputRef} 
          onChange={handleAudioSelect} 
          style={{ display: 'none' }} 
          accept="audio/*" 
        />
      </div>
    </div>
  );
};
