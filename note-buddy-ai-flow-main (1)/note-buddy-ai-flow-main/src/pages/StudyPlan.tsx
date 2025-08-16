import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Plus, Target, TrendingUp, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface StudyDay {
  date: string;
  tasks: StudyTask[];
  totalDuration: number;
  completedDuration: number;
}

const StudyPlan = () => {
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>([
    {
      date: '2024-01-15',
      totalDuration: 240,
      completedDuration: 120,
      tasks: [
        {
          id: '1',
          title: 'Review Mathematics Chapter 5',
          subject: 'Mathematics',
          duration: 60,
          completed: true,
          priority: 'high',
          dueDate: '2024-01-15'
        },
        {
          id: '2',
          title: 'Practice Chemistry Problems',
          subject: 'Chemistry',
          duration: 45,
          completed: true,
          priority: 'medium',
          dueDate: '2024-01-15'
        },
        {
          id: '3',
          title: 'Read History Chapter 8',
          subject: 'History',
          duration: 90,
          completed: false,
          priority: 'high',
          dueDate: '2024-01-15'
        },
        {
          id: '4',
          title: 'English Essay Draft',
          subject: 'English',
          duration: 45,
          completed: false,
          priority: 'medium',
          dueDate: '2024-01-15'
        }
      ]
    }
  ]);

  const toggleTaskCompletion = (dayIndex: number, taskId: string) => {
    setStudyPlan(prev => {
      const updated = [...prev];
      const task = updated[dayIndex].tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        // Update completed duration
        updated[dayIndex].completedDuration = updated[dayIndex].tasks
          .filter(t => t.completed)
          .reduce((sum, t) => sum + t.duration, 0);
      }
      return updated;
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-green-500 bg-green-50'
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-500 bg-gray-50';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const todaysPlan = studyPlan[0];
  const completionPercentage = (todaysPlan.completedDuration / todaysPlan.totalDuration) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🗓️ <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Study Plan</span>
        </h1>
        <p className="text-xl text-gray-600">
          Organize your learning with personalized study schedules and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today's Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600 mb-2">
                    {Math.round(completionPercentage)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {todaysPlan.completedDuration} / {todaysPlan.totalDuration} minutes
                  </p>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {todaysPlan.tasks.filter(t => t.completed).length}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-600">
                      {todaysPlan.tasks.filter(t => !t.completed).length}
                    </div>
                    <div className="text-xs text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Study Hours</span>
                  <span className="font-semibold">12.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-semibold">15/20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="font-semibold text-emerald-600">5 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Study Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Study Time
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Book className="h-4 w-4 mr-2" />
                Create Study Group
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Schedule
                </span>
                <span className="text-sm text-gray-500">
                  Monday, January 15, 2024
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysPlan.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(task.priority)} ${
                      task.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(0, task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Book className="h-4 w-4 mr-1" />
                            {task.subject}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {task.duration} min
                          </span>
                        </div>
                        
                        {task.completed && (
                          <div className="flex items-center mt-2 text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {todaysPlan.tasks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No tasks scheduled for today</p>
                    <p className="text-sm">
                      Add some study tasks to get started with your personalized plan.
                    </p>
                  </div>
                )}
              </div>

              {/* Completion Message */}
              {completionPercentage === 100 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-emerald-800">
                        🎉 Great job! You've completed today's study plan!
                      </h3>
                      <p className="text-sm text-emerald-700">
                        You studied for {todaysPlan.totalDuration} minutes today. Keep up the excellent work!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;