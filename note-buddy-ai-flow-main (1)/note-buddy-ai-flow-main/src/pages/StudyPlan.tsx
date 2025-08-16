import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Plus, Target, TrendingUp, Book, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    duration: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedPlan, setAiGeneratedPlan] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const fileId = localStorage.getItem("pdf_file_id");

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

  const addTask = () => {
    if (!newTask.title || !newTask.subject || !newTask.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const task: StudyTask = {
      id: Date.now().toString(),
      title: newTask.title,
      subject: newTask.subject,
      duration: parseInt(newTask.duration),
      completed: false,
      priority: newTask.priority,
      dueDate: today
    };

    setStudyPlan(prev => {
      const todayIndex = prev.findIndex(day => day.date === today);
      if (todayIndex >= 0) {
        const updated = [...prev];
        updated[todayIndex].tasks.push(task);
        updated[todayIndex].totalDuration += task.duration;
        return updated;
      } else {
        return [...prev, {
          date: today,
          tasks: [task],
          totalDuration: task.duration,
          completedDuration: 0
        }];
      }
    });

    setNewTask({ title: '', subject: '', duration: '', priority: 'medium' });
    setIsAddTaskOpen(false);
    toast({
      title: "Success",
      description: "Task added successfully!",
    });
  };

  const generateAIPlan = async () => {
    if (!fileId) {
      toast({
        title: "Error",
        description: "Please upload and process a file in Chat first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);

    try {
      const formData = new FormData();
      formData.append("file_id", fileId);

      const response = await fetch("http://localhost:8000/study-plan/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate study plan");
      }

      const data = await response.json();
      setAiGeneratedPlan(data.plan || "No study plan generated.");
      toast({
        title: "Success",
        description: "AI study plan generated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const todaysPlan = studyPlan.find(day => day.date === new Date().toISOString().split('T')[0]) || {
    date: new Date().toISOString().split('T')[0],
    tasks: [],
    totalDuration: 0,
    completedDuration: 0
  };
  const completionPercentage = todaysPlan.totalDuration > 0 ? (todaysPlan.completedDuration / todaysPlan.totalDuration) * 100 : 0;

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
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Study Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Study Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Review Chapter 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={newTask.subject}
                        onChange={(e) => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newTask.duration}
                        onChange={(e) => setNewTask(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addTask} className="w-full">
                      Add Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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

      {/* AI Generated Study Plan Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              AI-Generated Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">Describe your learning goals or subjects</Label>
                <Textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., I want to prepare for my calculus exam in 6 weeks, focusing on derivatives and integrals..."
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={generateAIPlan} 
                disabled={isGeneratingPlan}
                className="w-full"
              >
                {isGeneratingPlan ? 'Generating...' : 'Generate AI Study Plan'}
              </Button>
              
              {aiGeneratedPlan && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Your Personalized Study Plan</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {aiGeneratedPlan}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyPlan;