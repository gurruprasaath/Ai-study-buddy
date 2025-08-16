import React, { useState } from 'react';
import { Play, Search, Filter, Clock, Star, BookOpen, Users, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  rating: number;
  views: string;
  thumbnail: string;
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  tags: string[];
}

const EduTube = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const [videos] = useState<Video[]>([
    {
      id: '1',
      title: 'Introduction to Calculus - Limits and Derivatives',
      instructor: 'Dr. Sarah Johnson',
      duration: '45:32',
      rating: 4.8,
      views: '125K',
      thumbnail: '/placeholder.svg',
      subject: 'Mathematics',
      level: 'Intermediate',
      description: 'Learn the fundamental concepts of calculus including limits, derivatives, and their applications.',
      tags: ['calculus', 'derivatives', 'mathematics', 'limits']
    },
    {
      id: '2',
      title: 'World War II: Causes and Consequences',
      instructor: 'Prof. Michael Chen',
      duration: '1:15:20',
      rating: 4.9,
      views: '89K',
      thumbnail: '/placeholder.svg',
      subject: 'History',
      level: 'Intermediate',
      description: 'Comprehensive overview of WWII, examining the complex causes and lasting global impact.',
      tags: ['world-war', 'history', 'politics', 'global-impact']
    },
    {
      id: '3',
      title: 'Python Programming for Beginners',
      instructor: 'Alex Rodriguez',
      duration: '2:30:15',
      rating: 4.7,
      views: '234K',
      thumbnail: '/placeholder.svg',
      subject: 'Computer Science',
      level: 'Beginner',
      description: 'Complete introduction to Python programming covering syntax, data structures, and basic algorithms.',
      tags: ['python', 'programming', 'coding', 'algorithms']
    },
    {
      id: '4',
      title: 'Organic Chemistry: Molecular Structures',
      instructor: 'Dr. Emily Watson',
      duration: '38:45',
      rating: 4.6,
      views: '67K',
      thumbnail: '/placeholder.svg',
      subject: 'Chemistry',
      level: 'Advanced',
      description: 'Deep dive into organic molecular structures, bonding, and reaction mechanisms.',
      tags: ['organic-chemistry', 'molecules', 'bonding', 'reactions']
    },
    {
      id: '5',
      title: 'Shakespeare: Understanding Hamlet',
      instructor: 'Prof. James Carter',
      duration: '55:18',
      rating: 4.5,
      views: '45K',
      thumbnail: '/placeholder.svg',
      subject: 'Literature',
      level: 'Intermediate',
      description: 'Literary analysis of Hamlet exploring themes, characters, and historical context.',
      tags: ['shakespeare', 'hamlet', 'literature', 'analysis']
    },
    {
      id: '6',
      title: 'Physics: Quantum Mechanics Basics',
      instructor: 'Dr. Lisa Park',
      duration: '1:22:33',
      rating: 4.9,
      views: '156K',
      thumbnail: '/placeholder.svg',
      subject: 'Physics',
      level: 'Advanced',
      description: 'Introduction to quantum mechanics principles and their applications in modern physics.',
      tags: ['quantum-mechanics', 'physics', 'particles', 'theory']
    }
  ]);

  const subjects = ['all', 'Mathematics', 'History', 'Computer Science', 'Chemistry', 'Literature', 'Physics'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || video.level === selectedLevel;
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    const colors = {
      Beginner: 'bg-emerald-100 text-emerald-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🎥 <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">EduTube</span>
        </h1>
        <p className="text-xl text-gray-600">
          Discover educational videos from top instructors across various subjects.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search videos, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Popular Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Categories</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.slice(1).map(subject => (
            <Button
              key={subject}
              variant="outline"
              size="sm"
              onClick={() => setSelectedSubject(subject)}
              className={selectedSubject === subject ? 'bg-sky-100 border-sky-300' : ''}
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-sky-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 text-sky-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-gray-600">Video Thumbnail</p>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white bg-opacity-75 hover:bg-opacity-100">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1 group-hover:text-sky-600 transition-colors">
                  {video.title}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">{video.subject}</Badge>
                <Badge className={getLevelColor(video.level)}>
                  {video.level}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {video.instructor}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                    {video.rating}
                  </span>
                  <span>{video.views} views</span>
                </div>
                <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                  <Play className="h-4 w-4 mr-2" />
                  Watch
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-600 mb-2">No videos found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search terms or filters to find relevant educational content.
          </p>
        </div>
      )}

      {/* Featured Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Featured Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-purple-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-sky-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Study Playlists</h3>
              <p className="text-sm text-gray-600">
                Curated video collections organized by topic and difficulty level.
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg">
              <Users className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Expert Instructors</h3>
              <p className="text-sm text-gray-600">
                Learn from certified educators and industry professionals.
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Flexible Learning</h3>
              <p className="text-sm text-gray-600">
                Watch at your own pace with progress tracking and bookmarks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EduTube;