import React, { useState } from 'react';
import { FlaskConical, BookOpen, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFiles } from '@/contexts/FileProvider';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
}

const TestGenerator = () => {
  const { uploadedFiles, getFileContent } = useFiles();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const generateTest = async () => {
    if (!selectedFile || !testType || !questionCount || !difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate a test.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const sampleQuestions: Question[] = [
        {
          id: '1',
          type: 'multiple-choice',
          question: 'What is the main concept discussed in the uploaded material?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A'
        },
        {
          id: '2',
          type: 'true-false',
          question: 'The material covers advanced topics in the subject area.',
          correctAnswer: 'True'
        },
        {
          id: '3',
          type: 'short-answer',
          question: 'Explain the key principle mentioned in chapter 1.',
          correctAnswer: 'Sample answer based on the content'
        }
      ];

      setGeneratedQuestions(sampleQuestions);
      setIsGenerating(false);
      toast({
        title: "Test Generated!",
        description: `Created ${questionCount} questions from ${selectedFile}`,
      });
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🧪 <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Test Generator</span>
        </h1>
        <p className="text-xl text-gray-600">
          Create customized tests from your study materials to assess your knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Configuration */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="h-5 w-5 mr-2" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Study Material
                    </label>
                    <Select value={selectedFile} onValueChange={setSelectedFile}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a file" />
                      </SelectTrigger>
                      <SelectContent>
                        {uploadedFiles.map((file, index) => (
                          <SelectItem key={index} value={file.name}>
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Test Type
                    </label>
                    <Select value={testType} onValueChange={setTestType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mixed Questions</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Number of Questions
                    </label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Difficulty Level
                    </label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateTest}
                    disabled={isGenerating || !selectedFile || !testType || !questionCount || !difficulty}
                    className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Test...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-5 w-5 mr-2" />
                        Generate Test
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No study materials available</p>
                  <p className="text-sm text-gray-500">
                    Upload files in the Chat section first
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Test */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Generated Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
                    <p className="text-gray-600">AI is creating your test...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : generatedQuestions.length > 0 ? (
                <div className="space-y-6">
                  {generatedQuestions.map((question, index) => (
                    <div key={question.id} className="bg-gradient-to-br from-sky-50 to-purple-50 p-6 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Question {index + 1}
                        </h3>
                        <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                          {question.type.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{question.question}</p>
                      
                      {question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                              </div>
                              <span className="text-gray-700">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-center pt-4">
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Take This Test
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No test generated yet</p>
                  <p className="text-sm">
                    Configure your test settings and click "Generate Test" to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestGenerator;