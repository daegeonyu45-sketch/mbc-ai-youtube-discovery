
import { YouTubeVideo, VideoComment, VideoDuration } from '../types';

export const searchVideos = async (
  query: string, 
  apiKey: string, 
  duration: VideoDuration = 'any'
): Promise<YouTubeVideo[]> => {
  if (!apiKey) throw new Error("YouTube API Key is required");

  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
  
  if (duration !== 'any') {
    url += `&videoDuration=${duration}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch videos");
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
};

export const getVideoDetails = async (videoId: string, apiKey: string): Promise<Partial<YouTubeVideo>> => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
  );

  if (!response.ok) throw new Error("Failed to fetch video details");

  const data = await response.json();
  const video = data.items[0];
  
  if (!video) return {};

  return {
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    commentCount: video.statistics.commentCount,
  };
};

export const getVideoComments = async (videoId: string, apiKey: string): Promise<VideoComment[]> => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=relevance&key=${apiKey}`
  );

  if (!response.ok) return []; // Some videos might have comments disabled

  const data = await response.json();
  return data.items.map((item: any) => ({
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
    text: item.snippet.topLevelComment.snippet.textDisplay,
    likeCount: item.snippet.topLevelComment.snippet.likeCount,
  }));
};
