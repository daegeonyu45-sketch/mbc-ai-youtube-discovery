
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

export interface VideoComment {
  author: string;
  text: string;
  likeCount: number;
}

export interface AnalysisResult {
  summary: string;
  sentiment: string;
  keywords: string[];
  topicRecommendation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum AppView {
  SEARCH = 'SEARCH',
  ANALYSIS = 'ANALYSIS',
  SETTINGS = 'SETTINGS'
}

export type VideoDuration = 'any' | 'short' | 'medium' | 'long';
