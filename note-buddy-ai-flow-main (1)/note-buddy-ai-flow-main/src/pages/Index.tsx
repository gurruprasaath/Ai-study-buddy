
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Map, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: 'Chat with Book',
      description: 'Upload your notes or books and have interactive conversations with AI to understand complex topics.',
      path: '/chat',
      color: 'from-sky-500 to-blue-500',
    },
    {
      icon: Map,
      title: 'Get Chapter Roadmap',
      description: 'Generate visual study roadmaps that break down chapters into manageable learning steps.',
      path: '/roadmap',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'Summarize Notes',
      description: 'Transform lengthy notes into concise summaries that capture all the key points.',
      path: '/summarize',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full animate-pulse">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Learn Smart.{' '}
            <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
              Study Less.
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-700">
              AI-Powered Learning.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your study experience with AI that understands your learning style. 
            Chat with your materials, create roadmaps, and summarize complex topics instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/chat')}
            >
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-sky-300 text-sky-600 hover:bg-sky-50 px-8 py-3 text-lg"
              onClick={() => navigate('/roadmap')}
            >
              See Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how AI can revolutionize your study routine with these intelligent tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border-0 shadow-md"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-gradient-to-r from-sky-100 to-purple-100 group-hover:scale-110 transition-transform">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${feature.color}`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-6">
                    <Button 
                      variant="ghost" 
                      className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 group-hover:translate-x-1 transition-transform"
                    >
                      Try Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who are already learning smarter with AI Notes Buddy.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white px-12 py-4 text-lg"
            onClick={() => navigate('/chat')}
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
