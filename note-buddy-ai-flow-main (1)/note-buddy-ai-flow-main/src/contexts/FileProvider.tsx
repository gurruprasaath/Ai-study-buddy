import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileContextType {
  uploadedFiles: File[];
  addFile: (file: File) => void;
  removeFile: (fileName: string) => void;
  getFileContent: (fileName: string) => string;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const addFile = (file: File) => {
    setUploadedFiles(prev => {
      // Remove existing file with same name if it exists
      const filtered = prev.filter(f => f.name !== file.name);
      return [...filtered, file];
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const getFileContent = (fileName: string): string => {
    // In a real implementation, this would extract actual content
    const file = uploadedFiles.find(f => f.name === fileName);
    if (file) {
      return `This is extracted content from ${file.name}. In a real implementation, this would extract and display the actual text content from PDF, DOC, or TXT files using appropriate libraries.`;
    }
    return '';
  };

  return (
    <FileContext.Provider value={{
      uploadedFiles,
      addFile,
      removeFile,
      getFileContent
    }}>
      {children}
    </FileContext.Provider>
  );
};
