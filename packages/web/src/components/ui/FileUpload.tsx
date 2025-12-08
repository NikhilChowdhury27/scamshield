import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, FileImage, FileAudio, FileText } from 'lucide-react';
import { formatFileSize } from '@scamshield/shared';
import { VALIDATION } from '@scamshield/shared';
import type { FileType } from '@scamshield/shared';

interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  type: FileType;
}

interface FileUploadProps {
  onFilesChange: (files: FileItem[]) => void;
  files: FileItem[];
  maxFiles?: number;
  maxSize?: number;
  accept?: string[];
  disabled?: boolean;
  label?: string;
}

function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const FileIcon = ({ type }: { type: FileType }) => {
  switch (type) {
    case 'image':
      return <FileImage className="w-5 h-5" />;
    case 'audio':
      return <FileAudio className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export function FileUpload({
  onFilesChange,
  files,
  maxFiles = VALIDATION.MAX_FILES,
  maxSize = VALIDATION.MAX_FILE_SIZE,
  accept = [...VALIDATION.ALLOWED_IMAGE_TYPES, ...VALIDATION.ALLOWED_AUDIO_TYPES],
  disabled = false,
  label = 'Upload files',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      setError(null);
      const newFiles: FileItem[] = [];

      Array.from(fileList).forEach((file) => {
        // Check max files
        if (files.length + newFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Check file size
        if (file.size > maxSize) {
          setError(`File "${file.name}" exceeds ${formatFileSize(maxSize)} limit`);
          return;
        }

        // Check file type
        if (!accept.includes(file.type)) {
          setError(`File type "${file.type}" is not supported`);
          return;
        }

        const fileType = getFileType(file.type);
        const fileItem: FileItem = {
          id: generateId(),
          file,
          type: fileType,
        };

        // Create preview for images
        if (fileType === 'image') {
          fileItem.previewUrl = URL.createObjectURL(file);
        }

        newFiles.push(fileItem);
      });

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, maxSize, accept, onFilesChange]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="label">{label}</label>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <Upload className="w-8 h-8 mx-auto text-txt-muted mb-2" />
        <p className="text-txt-muted">
          <span className="text-primary font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-txt-muted mt-1">
          Images or audio files up to {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="label-error mt-2">{error}</p>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
            >
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-canvas rounded text-txt-muted">
                  <FileIcon type={file.type} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-txt truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-txt-muted">
                  {formatFileSize(file.file.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="p-1 text-txt-muted hover:text-danger transition-colors"
                aria-label={`Remove ${file.file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
