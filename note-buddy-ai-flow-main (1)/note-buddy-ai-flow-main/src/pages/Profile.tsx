
import React from 'react';
import { User, BookOpen, MessageCircle, Map, FileText, Trophy, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const stats = [
    { icon: MessageCircle, label: 'Chat Sessions', value: '24', color: 'text-sky-600' },
    { icon: Map, label: 'Roadmaps Created', value: '8', color: 'text-purple-600' },
    { icon: FileText, label: 'Notes Summarized', value: '15', color: 'text-emerald-600' },
    { icon: Clock, label: 'Study Hours Saved', value: '32', color: 'text-orange-600' },
  ];

  const recentActivity = [
    { action: 'Generated roadmap', subject: 'Quantum Physics Chapter 5', time: '2 hours ago' },
    { action: 'Summarized notes', subject: 'Biology Lab Report', time: '5 hours ago' },
    { action: 'Chat session', subject: 'Mathematics Calculus', time: '1 day ago' },
    { action: 'Generated roadmap', subject: 'History Essay Writing', time: '2 days ago' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Your Learning <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
        </h1>
        <p className="text-xl text-gray-600">
          Track your progress and manage your AI-powered learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <CardTitle>Welcome back, Student!</CardTitle>
              <p className="text-gray-600">AI Learning Enthusiast</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Learning Streak</span>
                </div>
                <p className="text-2xl font-bold text-sky-600">7 days</p>
                <p className="text-sm text-gray-600">Keep it up! 🔥</p>
              </div>
              
              <div className="text-center pt-4 border-t">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Current Goal</span>
                </div>
                <p className="text-sm text-gray-700">Master Quantum Physics</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">75% complete</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistics */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}: <span className="text-sky-600">{activity.subject}</span>
                      </p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <MessageCircle className="h-6 w-6 text-sky-600" />
                  <span>Start New Chat</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Map className="h-6 w-6 text-purple-600" />
                  <span>Create Roadmap</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6 text-emerald-600" />
                  <span>Summarize Text</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
