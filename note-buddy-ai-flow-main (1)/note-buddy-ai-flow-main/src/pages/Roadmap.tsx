
import React, { useState } from 'react';
import { Map, Upload, Lightbulb, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  completed: boolean;
}

const Roadmap = () => {
  const [chapterInput, setChapterInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);

  const generateRoadmap = async () => {
    if (!chapterInput.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const sampleRoadmap: RoadmapStep[] = [
        {
          id: '1',
          title: 'Read Chapter Overview',
          description: 'Get familiar with the main concepts and learning objectives of the chapter.',
          estimatedTime: '15 minutes',
          completed: false,
        },
        {
          id: '2',
          title: 'Identify Key Terms',
          description: 'Make a list of important vocabulary and definitions from the chapter.',
          estimatedTime: '20 minutes',
          completed: false,
        },
        {
          id: '3',
          title: 'Study Core Concepts',
          description: 'Deep dive into the main theories and principles explained in the chapter.',
          estimatedTime: '45 minutes',
          completed: false,
        },
        {
          id: '4',
          title: 'Work Through Examples',
          description: 'Practice with examples and case studies provided in the material.',
          estimatedTime: '30 minutes',
          completed: false,
        },
        {
          id: '5',
          title: 'Create Summary Notes',
          description: 'Write concise notes summarizing the key points and formulas.',
          estimatedTime: '25 minutes',
          completed: false,
        },
        {
          id: '6',
          title: 'Self-Assessment Quiz',
          description: 'Test your understanding with practice questions or review exercises.',
          estimatedTime: '20 minutes',
          completed: false,
        },
      ];
      
      setRoadmap(sampleRoadmap);
      setIsGenerating(false);
    }, 3000);
  };

  const toggleStepCompletion = (stepId: string) => {
    setRoadmap(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const completedSteps = roadmap.filter(step => step.completed).length;
  const progressPercentage = roadmap.length > 0 ? (completedSteps / roadmap.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Generate Your <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Study Roadmap</span>
        </h1>
        <p className="text-xl text-gray-600">
          Get a personalized, step-by-step learning path for any chapter or topic.
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2" />
            Chapter or Topic Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Chapter Name or Topic
            </label>
            <Textarea
              value={chapterInput}
              onChange={(e) => setChapterInput(e.target.value)}
              placeholder="e.g., 'Photosynthesis in Biology' or 'Linear Algebra Chapter 3: Matrix Operations'"
              className="w-full"
              rows={3}
            />
          </div>
          
          <div className="border-2 border-dashed border-sky-200 rounded-lg p-6 text-center hover:border-sky-300 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              id="roadmap-file-upload"
            />
            <label htmlFor="roadmap-file-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-sky-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Or upload study material for automatic topic detection
              </p>
            </label>
          </div>

          <Button
            onClick={generateRoadmap}
            disabled={!chapterInput.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Roadmap...
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5 mr-2" />
                Generate Study Roadmap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Roadmap Display */}
      {roadmap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Study Roadmap</span>
              <div className="text-sm text-gray-600">
                {completedSteps}/{roadmap.length} completed
              </div>
            </CardTitle>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmap.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    step.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-sky-200 bg-sky-50 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          step.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-sky-300 hover:border-sky-500'
                        }`}
                      >
                        {step.completed && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${
                          step.completed ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          Step {index + 1}: {step.title}
                        </h3>
                        <span className="text-sm text-sky-600 font-medium">
                          {step.estimatedTime}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        step.completed ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {index < roadmap.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-sky-400 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {completedSteps === roadmap.length && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Congratulations! 🎉
                </h3>
                <p className="text-green-700">
                  You've completed your study roadmap for "{chapterInput}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Roadmap;
