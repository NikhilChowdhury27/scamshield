import React, { useRef, useState } from 'react';
import { FileInput } from '../types';
import { Upload, X, Mic, Image as ImageIcon, FileText } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string, files: FileInput[]) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileInput[] = Array.from(e.target.files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith('audio') ? 'audio' : 'image',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || files.length > 0) {
      onAnalyze(text, files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Check a Message or Call
        </h2>
        <p className="text-lg text-gray-500">
          Paste text, upload a screenshot, or add a recording. We'll help you check if it's safe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Input */}
        <div>
          <label htmlFor="message-text" className="block text-lg font-medium text-gray-700 mb-2">
            Paste the message here (optional)
          </label>
          <textarea
            id="message-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="E.g., 'Grandma, I'm in trouble...' or 'Your bank account is suspended...'"
            className="w-full h-32 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none transition-colors"
          />
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Add Screenshot or Audio
          </label>
          
          <div className="grid grid-cols-2 gap-4">
             <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-400 transition-all group"
            >
              <div className="flex gap-2 mb-2">
                <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                <Mic className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
              </div>
              <span className="text-gray-500 font-medium group-hover:text-blue-600">
                Tap to Upload
              </span>
            </button>
            
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*"
              multiple
              className="hidden"
            />

            {/* File List */}
            {files.length > 0 && (
                <div className="col-span-2 space-y-2 mt-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                {file.type === 'image' ? (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                                        <img src={file.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Mic className="w-5 h-5 text-purple-600" />
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                    {file.file.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!text && files.length === 0)}
          className={`w-full py-4 rounded-full text-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isLoading || (!text && files.length === 0)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Analyze for Scam'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;
