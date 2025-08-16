import React, { useState } from 'react';
import { Code, Play, CheckCircle, Trophy, Target, Clock, Star, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  acceptanceRate: number;
  solvedBy: number;
}

const CodingPractice = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your solution here\nfunction solve() {\n    \n}');
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const [problems] = useState<CodingProblem[]>([
    {
      id: '1',
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ],
      constraints: [
        '2 ≤ nums.length ≤ 10⁴',
        '-10⁹ ≤ nums[i] ≤ 10⁹',
        '-10⁹ ≤ target ≤ 10⁹',
        'Only one valid answer exists.'
      ],
      acceptanceRate: 49.1,
      solvedBy: 1250000
    },
    {
      id: '2',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      category: 'Linked List',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      examples: [
        {
          input: 'head = [1,2,3,4,5]',
          output: '[5,4,3,2,1]'
        }
      ],
      constraints: [
        'The number of nodes in the list is the range [0, 5000].',
        '-5000 ≤ Node.val ≤ 5000'
      ],
      acceptanceRate: 72.8,
      solvedBy: 980000
    },
    {
      id: '3',
      title: 'Binary Tree Maximum Path Sum',
      difficulty: 'Hard',
      category: 'Tree',
      description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once.',
      examples: [
        {
          input: 'root = [1,2,3]',
          output: '6',
          explanation: 'The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.'
        }
      ],
      constraints: [
        'The number of nodes in the tree is in the range [1, 3 * 10⁴].',
        '-1000 ≤ Node.val ≤ 1000'
      ],
      acceptanceRate: 38.2,
      solvedBy: 125000
    },
    {
      id: '4',
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      category: 'Stack',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      examples: [
        {
          input: 's = "()"',
          output: 'true'
        },
        {
          input: 's = "()[]{}"',
          output: 'true'
        },
        {
          input: 's = "(]"',
          output: 'false'
        }
      ],
      constraints: [
        '1 ≤ s.length ≤ 10⁴',
        's consists of parentheses only \'()[]{}\''
      ],
      acceptanceRate: 40.1,
      solvedBy: 890000
    }
  ]);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Easy: 'bg-emerald-100 text-emerald-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const runCode = () => {
    // Simulate code execution
    alert('Code executed! In a real implementation, this would run your code against test cases.');
  };

  const submitCode = () => {
    // Simulate code submission
    alert('Code submitted! In a real implementation, this would evaluate your solution.');
  };

  const selectedProblemData = problems.find(p => p.id === selectedProblem);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Coding Practice</span>
        </h1>
        <p className="text-xl text-gray-600">
          Sharpen your programming skills with interactive coding challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Problems List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Practice Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProblem === problem.id 
                        ? 'border-sky-500 bg-sky-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProblem(problem.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {problem.title}
                      </h3>
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {problem.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{problem.acceptanceRate}% acceptance</span>
                      <span>{(problem.solvedBy / 1000).toFixed(0)}K solved</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problem Details and Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProblemData ? (
            <>
              {/* Problem Description */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {selectedProblemData.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(selectedProblemData.difficulty)}>
                        {selectedProblemData.difficulty}
                      </Badge>
                      <Badge variant="secondary">{selectedProblemData.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{selectedProblemData.description}</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Examples:</h4>
                    {selectedProblemData.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                        <div className="text-sm">
                          <strong>Input:</strong> {example.input}
                        </div>
                        <div className="text-sm">
                          <strong>Output:</strong> {example.output}
                        </div>
                        {example.explanation && (
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Explanation:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Constraints:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedProblemData.constraints.map((constraint, index) => (
                        <li key={index}>• {constraint}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

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
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm min-h-[300px] resize-none"
                    placeholder="Write your solution here..."
                  />
                  
                  <div className="flex space-x-3">
                    <Button onClick={runCode} variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </Button>
                    <Button onClick={submitCode} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg text-gray-600 mb-2">Select a problem to get started</p>
                  <p className="text-sm text-gray-500">
                    Choose a coding challenge from the list to begin practicing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">15</div>
            <div className="text-sm text-gray-600">Problems Solved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="text-sm text-gray-600">Easy Problems</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">75%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodingPractice;