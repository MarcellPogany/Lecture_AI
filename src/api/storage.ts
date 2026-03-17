import { supabase } from '../lib/supabase';
export { supabase };

const BUCKET = 'lecture-audio';

const getAudioMimeType = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    'm4a':  'audio/mp4',
    'mp4':  'audio/mp4',
    'mp3':  'audio/mpeg',
    'wav':  'audio/wav',
    'ogg':  'audio/ogg',
    'webm': 'audio/webm',
    'flac': 'audio/flac',
    'aac':  'audio/aac',
  };
  return map[ext] ?? file.type ?? 'audio/mpeg';
};

/** Upload an audio file to Supabase Storage and record in audio_files table. */
export const uploadAudio = async (
  file: File,
  userId: string,
  sessionId: string,
): Promise<{ storagePath: string }> => {
  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${userId}/${sessionId}/original.${ext}`;
  const mimeType = getAudioMimeType(file);

  console.log(`Uploading to ${BUCKET}/${storagePath} (type: ${mimeType}, size: ${file.size})`);

  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: true, contentType: mimeType });

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { error: dbError } = await supabase.from('audio_files').insert({
      session_id: sessionId,
      user_id: userId,
      storage_path: storagePath,
      file_type: 'original',
      mime_type: mimeType,
      size_bytes: file.size,
    });

    if (dbError) {
      console.error('audio_files table insert error:', dbError);
      throw new Error(`audio_files insert failed: ${dbError.message}`);
    }

    return { storagePath };
  } catch (err: any) {
    console.error('uploadAudio catch block:', err);
    throw err;
  }
};

/** Get a 15-minute signed URL for private audio playback. */
export const getSignedUrl = async (storagePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 15); // 15 minutes

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
};

/** Delete audio from storage (called on session delete). */
export const deleteAudio = async (storagePath: string): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) console.error('Storage delete failed:', error.message);
};
