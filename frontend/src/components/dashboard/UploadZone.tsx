'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon, FileVideo, X, AlertCircle } from 'lucide-react';
import { cn, formatFileSize, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { usePipeline } from '@/hooks/usePipeline';
import type { UploadedImage } from '@/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_MB = 50;

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { runPipeline } = usePipeline();

  const processFile = useCallback((file: File) => {
    setError(null);

    // Validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Please upload: ${ACCEPTED_EXTS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const image: UploadedImage = {
      id: generateId('IMG'),
      file,
      previewUrl,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };

    setUploadedImage(image);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleStartAnalysis = useCallback(async () => {
    if (!uploadedImage) return;
    setIsStarting(true);
    try {
      await runPipeline(uploadedImage);
    } catch {
      setIsStarting(false);
    }
  }, [uploadedImage, runPipeline]);

  const handleRemove = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [uploadedImage]);

  const isImage = uploadedImage?.mimeType.startsWith('image/');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop Zone */}
      {!uploadedImage ? (
        <div
          id="upload-dropzone"
          role="button"
          tabIndex={0}
          aria-label="Upload image for analysis"
          className={cn(
            'relative w-full border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer group',
            isDragOver
              ? 'border-gray-400 bg-red-50/30 scale-[1.01]'
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
        >
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-5">
            {/* Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200',
                isDragOver
                  ? 'bg-red-100 text-red-500 scale-110'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
              )}
            >
              <Upload size={28} strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-[#0a0a0a]">
                {isDragOver ? 'Drop to upload' : 'Drop your file here'}
              </p>
              <p className="text-sm text-gray-500">
                or{' '}
                <span className="text-[#0a0a0a] font-medium underline underline-offset-2 cursor-pointer">
                  browse files
                </span>
              </p>
            </div>

            {/* Supported formats */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { icon: <ImageIcon size={12} />, label: 'JPEG / PNG / WebP' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500"
                >
                  {f.icon}
                  {f.label}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div className="card rounded-2xl overflow-hidden">
          <div className="relative">
            {/* Image preview */}
            {isImage ? (
              <div className="relative w-full bg-gray-900" style={{ aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage.previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-contain"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Remove button */}
                <button
                  id="remove-upload-btn"
                  onClick={handleRemove}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                  aria-label="Remove uploaded file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ height: 200 }}>
                <FileVideo size={48} className="text-gray-300" />
                <button
                  id="remove-upload-btn"
                  onClick={handleRemove}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                  aria-label="Remove uploaded file"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* File info + CTA */}
          <div className="p-4 flex items-center justify-between gap-4 border-t border-gray-100">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#0a0a0a] truncate">{uploadedImage.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {formatFileSize(uploadedImage.sizeBytes)} · {uploadedImage.mimeType.split('/')[1].toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                id="change-file-btn"
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleRemove();
                  setTimeout(() => inputRef.current?.click(), 100);
                }}
              >
                Change
              </Button>
              <Button
                id="start-analysis-btn"
                variant="primary"
                size="sm"
                onClick={handleStartAnalysis}
                loading={isStarting}
              >
                Start Analysis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInput}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
