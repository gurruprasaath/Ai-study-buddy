import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, Loader2, AlertCircle } from 'lucide-react';
import { useFiles } from '@/contexts/FileProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Summarize = () => {
  const { uploadedFiles, getFileContent } = useFiles();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileId, setFileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedFileId = localStorage.getItem("pdf_file_id");
    if (savedFileId) {
      setFileId(savedFileId);
    }
  }, []);

  const generateSummary = async () => {
    if (!fileId) {
      toast({
        title: "File Required",
        description: "Please upload a file in Chat first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("file_id", fileId);

      const response = await fetch("http://127.0.0.1:8000/summarize/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate summary");
      }

      const data = await response.json();
      const summaryText =
        typeof data.summaries === "string"
          ? data.summaries
          : Object.values(data.summaries).join("\n");
      setSummary(summaryText || "No summary generated.");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    toast({
      title: "File Selected",
      description: `Selected ${fileName} for summarization`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard.",
    });
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Summary saved as summary.txt",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Summarize</span> Your Notes
        </h1>
        <p className="text-xl text-gray-600">
          Transform lengthy notes into concise, easy-to-understand summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File Selection Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Select File to Summarize
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Select a file uploaded in Chat:</p>
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                        selectedFile === file.name 
                          ? 'bg-sky-100 border-sky-300' 
                          : 'bg-gray-50 border-gray-200 hover:border-sky-200'
                      }`}
                      onClick={() => handleFileSelect(file.name)}
                    >
                      <FileText className="h-5 w-5 text-sky-600 mr-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No files available</p>
                  <p className="text-xs text-gray-500">
                    Go to the Chat page to upload files first
                  </p>
                </div>
              )}
              <Button
                onClick={generateSummary}
                disabled={!selectedFile || isGenerating}
                className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI Summary
                </span>
                {summary && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSummary}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
                    <p className="text-gray-600">AI is analyzing your text...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="bg-gradient-to-br from-sky-50 to-purple-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                    {summary}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No summary yet</p>
                  <p className="text-sm">
                    Enter some text and click "Generate Summary" to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>💡 Tips for Better Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-sky-50 rounded-lg">
              <h4 className="font-semibold text-sky-800 mb-2">Quality Input</h4>
              <p className="text-sky-700">
                Provide well-structured text with clear paragraphs for better AI understanding.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Optimal Length</h4>
              <p className="text-purple-700">
                Best results with 500-5000 characters. Very short texts may not need summarizing.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-emerald-800 mb-2">Review & Edit</h4>
              <p className="text-emerald-700">
                Always review AI summaries and edit as needed for your specific learning needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summarize;
