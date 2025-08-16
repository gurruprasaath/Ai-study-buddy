import React, { useState } from 'react';
import { Code, Play, CheckCircle, Save, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CodingPractice = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your solution here\nfunction solve() {\n    \n}');
  const [question, setQuestion] = useState('');
  const [stdin, setStdin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const { toast } = useToast();

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' }
  ];

  const runCode = async () => {
    toast({
      title: "Code Running",
      description: "Executing your code against test cases...",
    });

    const formData = new FormData();
    formData.append("code", code);
    formData.append("language", selectedLanguage);
    formData.append("stdin", stdin);

    const res = await fetch("http://localhost:8000/run-code/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    // Prepare output string
    const result = [
      data.stdout ? `Output:\n${data.stdout}` : "",
      data.stderr ? `Error:\n${data.stderr}` : "",
      data.compile_output ? `Compile Error:\n${data.compile_output}` : ""
    ].filter(Boolean).join("\n\n");

    setOutput(result || "No output.");
    setShowOutput(true);
  };

  const saveCode = async () => {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("language", selectedLanguage);

    fetch("http://localhost:8000/save-code/", {
      method: "POST",
      body: formData,
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const langExt = {
        "python": "py",
        "javascript": "js",
        "c++": "cpp",
        "java": "java"
      };
      const ext = langExt[selectedLanguage] || "txt";
      a.download = `solution.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  const generateAnswer = async () => {
    if (!question.trim()) {
      toast({
        title: "No Question",
        description: "Please enter a question to generate an answer.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("problem", question);
      formData.append("language", selectedLanguage);

      const res = await fetch("http://localhost:8000/generate-code/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCode(data.code || "// No code generated");
      setQuestion('');
      toast({
        title: "Answer Generated",
        description: "AI has generated a solution based on your question!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate answer. Please try again.",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const submitCode = () => {
    toast({
      title: "Code Submitted",
      description: "Your solution has been submitted for evaluation!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Coding Practice</span>
        </h1>
        <p className="text-xl text-gray-600">
          Write and test your code with AI assistance.
        </p>
      </div>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Code Editor
            </CardTitle>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ask AI to generate code:
            </label>
            <div className="flex space-x-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Write a function to find the maximum element in an array"
                className="flex-1"
                disabled={isGenerating}
              />
              <Button 
                onClick={generateAnswer} 
                disabled={isGenerating || !question.trim()}
                className="px-6"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Code Editor */}
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-[400px] resize-none"
            placeholder="Write your solution here..."
          />

          {/* Stdin Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Input (stdin for your program):
            </label>
            <Textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="font-mono text-sm min-h-[60px] resize-none"
              placeholder="Enter input for your program here..."
            />
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={saveCode} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={runCode} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button onClick={submitCode} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Dialog */}
      <Dialog open={showOutput} onOpenChange={setShowOutput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Program Output</DialogTitle>
          </DialogHeader>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">{output}</pre>
          <DialogFooter>
            <Button onClick={() => setShowOutput(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodingPractice;