'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api-provider';
import { compressImage } from '@/lib/image-compress';
import { Camera, Trash2, Loader2, User } from 'lucide-react';

interface ProfilePhotoProps {
  currentUrl?: string | null;
  userName?: string | null;
  onUploaded?: (url: string) => void;
  onDeleted?: () => void;
}

export function ProfilePhoto({ currentUrl, userName, onUploaded, onDeleted }: ProfilePhotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = api.profile.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setPreview(null);
      setUploading(false);
      setError(null);
      onUploaded?.(data.url);
    },
    onError: (err) => {
      setUploading(false);
      setError(err.message);
    },
  });

  const deleteMutation = api.profile.deletePhoto.useMutation({
    onSuccess: () => {
      setPreview(null);
      setError(null);
      onDeleted?.();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Compress image
      const compressed = await compressImage(file);

      // Read as base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];

        // Set preview
        setPreview(URL.createObjectURL(compressed));

        // Upload
        uploadMutation.mutate({
          imageData: base64,
          contentType: 'image/jpeg',
        });
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : 'Gagal mengompres gambar');
    }

    // Reset input
    e.target.value = '';
  };

  const displayUrl = preview ?? currentUrl;
  const initial = (userName ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative group">
        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={userName ?? 'Profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-zinc-400 dark:text-zinc-500">
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        {!uploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
        >
          {currentUrl ? 'Ganti Foto' : 'Upload Foto'}
        </button>
        {currentUrl && !uploading && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center max-w-[200px]">{error}</p>
      )}

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-[10px] text-zinc-400">Maks 100KB • JPG/PNG</p>
    </div>
  );
}
