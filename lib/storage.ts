import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800, height: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  const response = await fetch(resized.uri);
  const blob = await response.blob();
  const path = `avatars/${userId}.jpg`;

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: 'image/jpeg',
  });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMusicianPhoto(
  musicianId: string,
  uri: string,
  fileId: string
): Promise<string> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200, height: 1200 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  );

  const response = await fetch(resized.uri);
  const blob = await response.blob();
  const path = `musician-media/${musicianId}/photos/${fileId}.jpg`;

  const { error } = await supabase.storage.from('musician-media').upload(path, blob, {
    upsert: true,
    contentType: 'image/jpeg',
  });
  if (error) throw error;

  const { data } = supabase.storage.from('musician-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAudioSample(
  musicianId: string,
  uri: string,
  fileId: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  if (blob.size > 20 * 1024 * 1024) throw new Error('Audio file must be under 20MB');

  const path = `musician-media/${musicianId}/audio/${fileId}.mp3`;

  const { error } = await supabase.storage.from('musician-media').upload(path, blob, {
    upsert: true,
    contentType: 'audio/mpeg',
  });
  if (error) throw error;

  const { data } = supabase.storage.from('musician-media').getPublicUrl(path);
  return data.publicUrl;
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
