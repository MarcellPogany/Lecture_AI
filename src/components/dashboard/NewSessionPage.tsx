import React, { useState, useRef } from 'react';
import { FileText, Upload, Mic, Link as LinkIcon, Globe, ArrowRight, ArrowLeft, Cloud, CheckCircle, Youtube } from 'lucide-react';
import { Course } from '../../types';

interface NewSessionPageProps {
  explicitCourses?: Course[];
  onUploadAudio?: (files: File[], title: string, courseTag: string) => void;
  onRecordLive?: (title: string, courseTag: string) => void;
  onRecordTab?: (title: string, courseTag: string) => void;
  onImportYouTube?: (url: string, title: string, courseTag: string) => void;
  onImportUrl?: (url: string, title: string, courseTag: string) => void;
  onPasteText?: (text: string, title: string, courseTag: string) => void;
  onUploadDocuments?: (files: File[], title: string, courseTag: string) => void;
  isUploading?: boolean;
  onCancel?: () => void;
}

export const NewSessionPage: React.FC<NewSessionPageProps> = ({
  explicitCourses = [],
  onUploadAudio,
  onRecordLive,
  onRecordTab,
  onImportYouTube,
  onImportUrl,
  onPasteText,
  onUploadDocuments,
  isUploading,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  // Step 2 details
  const [sessionTitle, setSessionTitle] = useState('');
  const [courseTag, setCourseTag] = useState('');
  const [summaryDetail, setSummaryDetail] = useState('Standard');

  // Step 3 details
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [pastedText, setPastedText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = [
    { id: 'paste', icon: <FileText size={24} />, title: 'Paste Text', desc: 'Paste notes or a transcript directly' },
    { id: 'upload', icon: <Upload size={24} />, title: 'Upload Audio', desc: 'MP3, WAV, M4A, MP4, or WebM files' },
    { id: 'record', icon: <Mic size={24} />, title: 'Record Live', desc: 'Capture audio from your microphone' },
    { id: 'tab', icon: <Cloud size={24} />, title: 'Record Tab Audio', desc: 'Capture digital audio from browser tabs' },
    { id: 'youtube', icon: <Youtube size={24} />, title: 'YouTube URL', desc: 'Import transcript from a YouTube video' },
    { id: 'url', icon: <Globe size={24} />, title: 'Web Source', desc: 'Extract content from a web page URL' },
    { id: 'documents', icon: <FileText size={24} />, title: 'Upload Documents', desc: 'PDF, DOCX, TXT and other lecture materials' },
  ];

  const handleNextStep = () => {
    if (step < 3) setStep(s => (s + 1) as 1 | 2 | 3);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(s => (s - 1) as 1 | 2 | 3);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (selectedMethod === 'documents' && onUploadDocuments) {
        onUploadDocuments(files, sessionTitle, courseTag);
      } else if (onUploadAudio) {
        onUploadAudio(files, sessionTitle, courseTag);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (selectedMethod === 'documents' && onUploadDocuments) {
        onUploadDocuments(files, sessionTitle, courseTag);
      } else if (onUploadAudio) {
        onUploadAudio(files, sessionTitle, courseTag);
      }
    }
  };

  const handleProcessRecording = () => {
    if (onRecordLive) onRecordLive(sessionTitle, courseTag);
  };

  const handleProcessImport = () => {
    if (selectedMethod === 'youtube' && onImportYouTube) {
      onImportYouTube(youtubeUrl, sessionTitle, courseTag);
    } else if (selectedMethod === 'url' && onImportUrl) {
      onImportUrl(webUrl, sessionTitle, courseTag);
    } else if (selectedMethod === 'paste' && onPasteText) {
      onPasteText(pastedText, sessionTitle, courseTag);
    } else if (selectedMethod === 'record' && onRecordLive) {
      onRecordLive(sessionTitle, courseTag);
    } else if (selectedMethod === 'tab' && onRecordTab) {
      onRecordTab(sessionTitle, courseTag);
    }
  };

  const isProcessEnabled = () => {
    if (selectedMethod === 'record' || selectedMethod === 'tab') return true;
    if (selectedMethod === 'youtube') return youtubeUrl.trim().length > 0;
    if (selectedMethod === 'url') return webUrl.trim().length > 0;
    if (selectedMethod === 'paste') return pastedText.trim().length > 0;
    return false;
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>
          New Session
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Add a lecture, meeting, or notes to your workspace.
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#35415B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
          {step > 1 ? <CheckCircle size={16} /> : '1'}
        </div>
        <div style={{ height: '2px', width: '40px', background: step > 1 ? '#35415B' : 'var(--border)' }} />
        
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 2 ? '#35415B' : 'var(--bg-surface)', border: step >= 2 ? 'none' : '1px solid var(--border)', color: step >= 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
          {step > 2 ? <CheckCircle size={16} /> : '2'}
        </div>
        <div style={{ height: '2px', width: '40px', background: step > 2 ? '#35415B' : 'var(--border)' }} />
        
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 3 ? '#35415B' : 'var(--bg-surface)', border: step === 3 ? 'none' : '1px solid var(--border)', color: step === 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
          3
        </div>
        <div style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {step === 1 ? 'Input Method' : step === 2 ? 'Session Details' : 'Add Content'}
        </div>
      </div>

      {/* Content Card */}
      <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '48px', flex: 1 }}>
          
          {step === 1 && (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                How would you like to add content?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {methods.map(m => {
                  const isActive = selectedMethod === m.id;
                  return (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setSelectedMethod(m.id);
                        handleNextStep();
                      }}
                      style={{
                        padding: '32px 24px', borderRadius: '16px',
                        border: isActive ? '2px solid #35415B' : '1px solid var(--border)',
                        background: isActive ? '#F8FAFC' : 'transparent', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        textAlign: 'center', transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(53, 65, 91, 0.08)' : 'none'
                      }}
                    >
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', 
                        background: isActive ? '#35415B' : '#F1F5F9', color: isActive ? 'white' : '#64748B', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        marginBottom: '16px', transition: 'all 0.2s ease'
                      }}>
                        {m.icon}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: isActive ? '#0F172A' : 'var(--text-primary)', marginBottom: '8px' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>
                        {m.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                Session Details
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}>Session Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chapter 4: Neural Networks" 
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    autoFocus
                    style={{
                      padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                      background: '#F8FAFC', color: '#0F172A', fontSize: '15px', outline: 'none',
                      width: '100%', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}>Course (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={courseTag}
                        onChange={(e) => setCourseTag(e.target.value)}
                        style={{
                          width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                          background: '#F8FAFC', color: courseTag ? '#0F172A' : '#64748B', fontSize: '15px', outline: 'none',
                          appearance: 'none', cursor: 'pointer', boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select a course</option>
                        {explicitCourses.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                         <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1 1.5L6 6.5L11 1.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '15px', fontWeight: 500, color: '#0F172A' }}>Summary Detail</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={summaryDetail}
                        onChange={(e) => setSummaryDetail(e.target.value)}
                        style={{
                          width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                          background: '#F8FAFC', color: '#0F172A', fontSize: '15px', outline: 'none',
                          appearance: 'none', cursor: 'pointer', boxSizing: 'border-box'
                        }}
                      >
                        <option value="Detailed">Detailed</option>
                        <option value="Standard">Standard</option>
                        <option value="Brief">Brief</option>
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                         <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1 1.5L6 6.5L11 1.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {(selectedMethod === 'upload' || selectedMethod === 'documents') && (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                    {selectedMethod === 'upload' ? 'Upload Audio or Video' : 'Upload Lecture Documents'}
                  </h2>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    style={{ 
                      border: '2px dashed var(--border)', borderRadius: '16px', padding: '64px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', background: 'var(--bg-base)',
                      opacity: isUploading ? 0.6 : 1
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      {selectedMethod === 'upload' ? <Cloud size={24} /> : <Upload size={24} />}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {isUploading ? 'Processing Files...' : 'Drag and drop or click to select'}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {selectedMethod === 'upload' 
                        ? 'MP3, WAV, M4A, MP4, WebM · up to 200 MB' 
                        : 'PDF, DOCX, TXT, MD · up to 50 MB'}
                    </div>
                    <input 
                      type="file" 
                      accept={selectedMethod === 'upload' ? "audio/*,.m4a" : ".pdf,.docx,.txt,.md"} 
                      multiple
                      style={{ display: 'none' }} 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </div>
                  <div style={{ marginTop: '24px', background: 'var(--bg-base)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0-11a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#94A3B8"/>
                     </svg>
                     <span style={{ fontSize: '14px' }}>
                       {selectedMethod === 'upload' 
                         ? 'Audio will be transcribed using AI. This may take a minute for longer recordings.'
                         : 'Documents will be attached as sources. AI will use their content for summaries and Q&A.'}
                     </span>
                  </div>
                </>
              )}

              {(selectedMethod === 'record' || selectedMethod === 'tab') && (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                    {selectedMethod === 'record' ? 'Record Live Session' : 'Record Tab Audio'}
                  </h2>
                  <div style={{ padding: '64px', textAlign: 'center', background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                     <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      {selectedMethod === 'record' ? <Mic size={32} /> : <Cloud size={32} />}
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {selectedMethod === 'record' ? 'Ready to capture your session?' : 'Ready to capture tab audio?'}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                      {selectedMethod === 'record' 
                        ? 'Clicking "Process Session" will immediately request microphone access and start live transcription.'
                        : 'Clicking "Process Session" will prompt you to select a tab. Make sure to check "Share tab audio" in the pop-up.'}
                    </p>
                  </div>
                </>
              )}

              {selectedMethod === 'youtube' && (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                    Import YouTube Transcript
                  </h2>
                  <div style={{ padding: '40px', background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Video URL</label>
                      <input 
                        type="url" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        style={{
                          padding: '16px', borderRadius: '12px', border: '1px solid var(--border)',
                          fontSize: '15px', width: '100%', boxSizing: 'border-box'
                        }}
                      />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        We'll automatically fetch the official or auto-generated transcript from the video.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'url' && (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                    Import Web Source
                  </h2>
                  <div style={{ padding: '40px', background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Web Page URL</label>
                      <input 
                        type="url" 
                        placeholder="https://example.com/lecture-notes" 
                        value={webUrl}
                        onChange={(e) => setWebUrl(e.target.value)}
                        style={{
                          padding: '16px', borderRadius: '12px', border: '1px solid var(--border)',
                          fontSize: '15px', width: '100%', boxSizing: 'border-box'
                        }}
                      />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        We'll extract the main article content and text from the provided URL.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'paste' && (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', fontFamily: 'Georgia, serif' }}>
                    Paste Source Text
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Text</label>
                    <textarea 
                      placeholder="Paste your notes, transcript, or article content here..." 
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      style={{
                        padding: '16px', borderRadius: '12px', border: '1px solid var(--border)',
                        fontSize: '15px', width: '100%', minHeight: '300px', boxSizing: 'border-box',
                        resize: 'vertical', fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '32px 48px', borderTop: '1px solid #F1F5F9', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step === 1 ? (
             <button 
                onClick={onCancel}
                style={{ background: 'none', border: 'none', color: '#0F172A', fontWeight: 500, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
             >
                <ArrowLeft size={16} strokeWidth={2.5} /> Cancel
             </button>
          ) : (
            <button 
                onClick={handlePrevStep}
                disabled={isUploading}
                style={{ background: 'none', border: 'none', color: isUploading ? '#CBD5E1' : '#0F172A', fontWeight: 500, fontSize: '15px', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
             >
                <ArrowLeft size={16} strokeWidth={2.5} /> Back
             </button>
          )}
          
          <button 
            disabled={(step === 1 && !selectedMethod) || (step === 2 && !sessionTitle.trim()) || isUploading || (step === 3 && !isProcessEnabled())}
            onClick={step < 3 ? handleNextStep : handleProcessImport}
            style={{ 
              display: (step === 3 && (selectedMethod === 'upload' || selectedMethod === 'documents')) ? 'none' : 'flex', alignItems: 'center', gap: '16px', 
              background: (step === 1 && !selectedMethod) || (step === 2 && !sessionTitle.trim()) || isUploading || (step === 3 && !isProcessEnabled()) ? '#E2E8F0' : '#35415B', 
              color: (step === 1 && !selectedMethod) || (step === 2 && !sessionTitle.trim()) || isUploading || (step === 3 && !isProcessEnabled()) ? '#94A3B8' : 'white', 
              border: 'none', padding: '12px 24px', borderRadius: '10px', 
              fontWeight: 500, fontSize: '15px', cursor: (step === 1 && !selectedMethod) || (step === 2 && !sessionTitle.trim()) || isUploading || (step === 3 && !isProcessEnabled()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {step === 3 ? 'Process Session' : 'Continue'} {step < 3 && <ArrowRight size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
};
