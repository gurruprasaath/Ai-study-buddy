import React, { useState, useEffect } from 'react';
import { youtubeService } from '../services/youtubeService';

interface YouTubeVideo {
  title: string;
  channel: string;
  url: string;
  views: number;
  likes: number;
  thumbnail: string;
}

interface YouTubeRecommendations {
  topics: string[];
  recommendations: Record<string, YouTubeVideo[]>;
}

const Resources = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [recommendations, setRecommendations] = useState<YouTubeRecommendations | null>(null);

  const handleGetRecommendations = async () => {
    if (!noteContent.trim()) {
      alert('Please enter some notes content');
      return;
    }

    setLoading(true);
    try {
      const result = await youtubeService.getRecommendations({
        content: noteContent,
        max_results: 3
      });
      
      setRecommendations(result);
      
      // Flatten videos for display
      const allVideos: YouTubeVideo[] = [];
      Object.values(result.recommendations).forEach(topicVideos => {
        allVideos.push(...topicVideos);
      });
      setVideos(allVideos);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
        Related YouTube Videos
      </h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Enter Your Notes</h2>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          rows={4}
          placeholder="Paste your notes here..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
        <button
          onClick={handleGetRecommendations}
          disabled={loading || !noteContent.trim()}
          className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading recommendations...</p>
        </div>
      )}

      {recommendations && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Topics Found: {recommendations.topics.join(', ')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-4">
                <div className="aspect-video mb-3">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.url.split('v=')[1]}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-1">Channel: {video.channel}</p>
                <p className="text-sm text-gray-500">
                  {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes
                </p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sky-600 hover:text-sky-800 text-sm"
                >
                  Watch on YouTube
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !recommendations && (
        <div className="text-center text-gray-500">
          <p>Enter your notes above to get personalized YouTube recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
