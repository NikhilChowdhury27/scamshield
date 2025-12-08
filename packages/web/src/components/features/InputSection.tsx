import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, Textarea, FileUpload } from '@/components/ui';
import type { FileType } from '@scamshield/shared';

interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  type: FileType;
}

interface InputSectionProps {
  onSubmit: (text: string, files: FileItem[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function InputSection({
  onSubmit,
  isLoading = false,
  placeholder = 'Paste suspicious message, email, or text here...',
}: InputSectionProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    onSubmit(text, files);
  };

  const canSubmit = (text.trim() || files.length > 0) && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={6}
        disabled={isLoading}
        className="resize-none"
      />

      <FileUpload
        files={files}
        onFilesChange={setFiles}
        disabled={isLoading}
        label="Or upload images/audio"
      />

      <Button
        type="submit"
        disabled={!canSubmit}
        isLoading={isLoading}
        fullWidth
        size="lg"
        rightIcon={<Send className="w-5 h-5" />}
      >
        {isLoading ? 'Analyzing...' : 'Analyze for Scams'}
      </Button>

      <p className="text-xs text-txt-muted text-center">
        Your data is analyzed securely and not stored permanently.
      </p>
    </form>
  );
}
