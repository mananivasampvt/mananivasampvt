export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string; // For videos
}

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // YouTube URLs
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
  // Vimeo URLs
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;
  // Direct video file URLs
  const directVideoRegex = /\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i;
  // Cloudinary video URLs
  const cloudinaryRegex = /res\.cloudinary\.com\/.*\.(mp4|webm|mov)/i;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url) || cloudinaryRegex.test(url);
};

export const getVideoThumbnail = (videoUrl: string): string => {
  // YouTube thumbnail - handle both embed and watch URLs
  if (videoUrl.includes('youtube.com/embed/')) {
    const videoId = videoUrl.split('/embed/')[1]?.split('?')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // Vimeo thumbnail (using placeholder - requires API for actual thumbnail)
  if (videoUrl.includes('player.vimeo.com/video/') || videoUrl.includes('vimeo.com/')) {
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
  }
  
  // Default video thumbnail for direct video files
  return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
};

export const combineMediaItems = (images: string[] = [], videos: string[] = []): MediaItem[] => {
  const mediaItems: MediaItem[] = [];
  
  // Add images
  images.forEach(image => {
    if (image && typeof image === 'string' && !image.startsWith('blob:')) {
      mediaItems.push({
        url: image,
        type: 'image'
      });
    }
  });
  
  // Add videos
  videos.forEach(video => {
    if (video && typeof video === 'string' && !video.startsWith('blob:')) {
      mediaItems.push({
        url: video,
        type: 'video',
        thumbnail: getVideoThumbnail(video)
      });
    }
  });
  
  return mediaItems;
};

export const getEmbedUrl = (videoUrl: string): string => {
  // Convert YouTube watch URLs to embed URLs
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Convert YouTube short URLs
  if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Convert Vimeo URLs to embed format
  if (videoUrl.includes('vimeo.com/') && !videoUrl.includes('/embed/')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  
  return videoUrl;
};
