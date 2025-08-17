import axios from "axios";

export interface YouTubeVideo {
  title: string;
  channel: string;
  url: string;
  views: number;
  likes: number;
  thumbnail: string;
}

export interface YouTubeRecommendations {
  topics: string[];
  recommendations: Record<string, YouTubeVideo[]>;
}

const API_BASE_URL = "http://localhost:8000";

export const youtubeService = {
  getRecommendations: async ({
    content,
    max_results = 3,
  }: {
    content: string;
    max_results?: number;
  }): Promise<YouTubeRecommendations> => {
    const response = await axios.get(`${API_BASE_URL}/recommended-videos`, {
      params: { text: content, max_results },
    });

    return response.data as YouTubeRecommendations; // <-- casting fixes 'unknown'
  },
};
