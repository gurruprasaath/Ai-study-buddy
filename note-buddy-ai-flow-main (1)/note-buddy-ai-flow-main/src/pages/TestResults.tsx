import React, { useState } from 'react';
import { Trophy, Target, Clock, TrendingUp, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  id: string;
  testName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: string;
  date: string;
  difficulty: string;
}

const TestResults = () => {
  const [testResults] = useState<TestResult[]>([
    {
      id: '1',
      testName: 'Mathematics Chapter 5',
      subject: 'Mathematics',
      score: 85,
      totalQuestions: 20,
      timeSpent: '15:32',
      date: '2024-01-15',
      difficulty: 'Medium'
    },
    {
      id: '2',
      testName: 'History World War II',
      subject: 'History',
      score: 92,
      totalQuestions: 15,
      timeSpent: '12:45',
      date: '2024-01-14',
      difficulty: 'Hard'
    },
    {
      id: '3',
      testName: 'Science Chemistry Basics',
      subject: 'Science',
      score: 78,
      totalQuestions: 25,
      timeSpent: '18:20',
      date: '2024-01-13',
      difficulty: 'Easy'
    }
  ]);

  const averageScore = testResults.reduce((acc, result) => acc + result.score, 0) / testResults.length;
  const totalTests = testResults.length;
  const bestScore = Math.max(...testResults.map(r => r.score));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-sky-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'from-emerald-50 to-emerald-100';
    if (score >= 80) return 'from-sky-50 to-sky-100';
    if (score >= 70) return 'from-yellow-50 to-yellow-100';
    return 'from-red-50 to-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Test Results</span>
        </h1>
        <p className="text-xl text-gray-600">
          Track your progress and analyze your performance over time.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-sky-600">{averageScore.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                <p className="text-2xl font-bold text-purple-600">{totalTests}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-emerald-600">{bestScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Recent Test Results
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result) => (
              <div key={result.id} className={`bg-gradient-to-r ${getScoreBgColor(result.score)} p-6 rounded-lg border`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {result.testName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {result.timeSpent}
                      </span>
                      <span>{result.date}</span>
                      <span className="bg-white px-2 py-1 rounded text-xs">
                        {result.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(result.score)} mb-2`}>
                      {result.score}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((result.score / 100) * result.totalQuestions)}/{result.totalQuestions} correct
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className={`font-medium ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </span>
                  </div>
                  <Progress value={result.score} className="h-2" />
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Retake Test
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {testResults.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No test results yet</p>
              <p className="text-sm">
                Take some tests to see your results and track your progress here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResults;