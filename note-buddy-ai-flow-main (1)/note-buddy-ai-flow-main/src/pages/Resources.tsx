import React, { useState } from 'react';
import { BookOpen, ExternalLink, Search, Filter, Star, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'website' | 'book';
  subject: string;
  description: string;
  url: string;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Advanced Mathematics Textbook',
      type: 'pdf',
      subject: 'Mathematics',
      description: 'Comprehensive guide covering calculus, algebra, and advanced mathematical concepts.',
      url: '#',
      rating: 4.8,
      difficulty: 'Advanced',
      tags: ['calculus', 'algebra', 'mathematics']
    },
    {
      id: '2',
      title: 'World History Documentary Series',
      type: 'video',
      subject: 'History',
      description: 'Educational video series covering major historical events and civilizations.',
      url: '#',
      rating: 4.6,
      difficulty: 'Intermediate',
      tags: ['world-war', 'ancient-history', 'civilization']
    },
    {
      id: '3',
      title: 'Introduction to Computer Science',
      type: 'article',
      subject: 'Computer Science',
      description: 'Beginner-friendly article series introducing programming concepts and algorithms.',
      url: '#',
      rating: 4.7,
      difficulty: 'Beginner',
      tags: ['programming', 'algorithms', 'basics']
    },
    {
      id: '4',
      title: 'Khan Academy - Free Online Courses',
      type: 'website',
      subject: 'General',
      description: 'Free online learning platform with courses across multiple subjects.',
      url: 'https://khanacademy.org',
      rating: 4.9,
      difficulty: 'Beginner',
      tags: ['free', 'online-learning', 'comprehensive']
    },
    {
      id: '5',
      title: 'Chemistry Lab Manual',
      type: 'book',
      subject: 'Science',
      description: 'Practical chemistry experiments and theoretical foundations.',
      url: '#',
      rating: 4.5,
      difficulty: 'Intermediate',
      tags: ['chemistry', 'lab-work', 'experiments']
    }
  ]);

  const subjects = ['all', 'Mathematics', 'History', 'Science', 'Computer Science', 'General'];
  const types = ['all', 'pdf', 'video', 'article', 'website', 'book'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      pdf: '📄',
      video: '🎥',
      article: '📰',
      website: '🌐',
      book: '📚'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'bg-emerald-100 text-emerald-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Resources</span>
        </h1>
        <p className="text-xl text-gray-600">
          Discover curated learning materials and educational resources.
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
                  placeholder="Search resources..."
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {resource.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{resource.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">{resource.subject}</Badge>
                <Badge className={getDifficultyColor(resource.difficulty)}>
                  {resource.difficulty}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 flex-1">
                {resource.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-600 mb-2">No resources found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search terms or filters to find relevant resources.
          </p>
        </div>
      )}

      {/* Add Resource Card */}
      <Card className="mt-8 border-dashed border-2 border-gray-300 hover:border-sky-400 transition-colors">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Want to add a resource?
          </h3>
          <p className="text-gray-600 mb-4">
            Share valuable learning materials with the community.
          </p>
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            Suggest Resource
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resources;