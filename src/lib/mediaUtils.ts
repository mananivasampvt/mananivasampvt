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

export const getImageFormatFromFile = (file: File): string | null => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // MIME type mapping for better detection
  const mimeTypeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF',
    'image/tif': 'TIFF',
    'image/heic': 'HEIC',
    'image/heif': 'HEIF',
    'image/svg+xml': 'SVG',
    'image/raw': 'RAW',
    // RAW format MIME types
    'image/x-canon-cr2': 'RAW',
    'image/x-canon-crw': 'RAW',
    'image/x-epson-erf': 'RAW',
    'image/x-nikon-nef': 'RAW',
    'image/x-olympus-orf': 'RAW',
    'image/x-panasonic-raw': 'RAW',
    'image/x-sony-arw': 'RAW',
    'image/x-adobe-dng': 'RAW',
    'image/x-hasselblad-3fr': 'RAW',
    'image/x-kodak-dcr': 'RAW',
    'image/x-kodak-k25': 'RAW',
    'image/x-kodak-kdc': 'RAW',
    'image/x-minolta-mrw': 'RAW',
    'image/x-fuji-raf': 'RAW',
    'image/x-sony-sr2': 'RAW',
    'image/x-sony-srf': 'RAW',
    'image/x-sigma-x3f': 'RAW'
  };
  
  // Check MIME type first
  if (mimeType && mimeTypeMap[mimeType]) {
    return mimeTypeMap[mimeType];
  }
  
  // Check file extension as fallback
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'JPEG';
  if (fileName.endsWith('.png')) return 'PNG';
  if (fileName.endsWith('.gif')) return 'GIF';
  if (fileName.endsWith('.webp')) return 'WEBP';
  if (fileName.endsWith('.bmp')) return 'BMP';
  if (fileName.endsWith('.tiff') || fileName.endsWith('.tif')) return 'TIFF';
  if (fileName.endsWith('.heic')) return 'HEIC';
  if (fileName.endsWith('.heif')) return 'HEIF';
  if (fileName.endsWith('.svg')) return 'SVG';
  // RAW formats
  if (fileName.endsWith('.raw')) return 'RAW';
  if (fileName.endsWith('.dng')) return 'RAW';
  if (fileName.endsWith('.cr2') || fileName.endsWith('.crw')) return 'RAW';
  if (fileName.endsWith('.nef')) return 'RAW';
  if (fileName.endsWith('.orf')) return 'RAW';
  if (fileName.endsWith('.arw') || fileName.endsWith('.sr2') || fileName.endsWith('.srf')) return 'RAW';
  if (fileName.endsWith('.rw2')) return 'RAW';
  if (fileName.endsWith('.3fr')) return 'RAW';
  if (fileName.endsWith('.dcr')) return 'RAW';
  if (fileName.endsWith('.k25') || fileName.endsWith('.kdc')) return 'RAW';
  if (fileName.endsWith('.mrw')) return 'RAW';
  if (fileName.endsWith('.raf')) return 'RAW';
  if (fileName.endsWith('.x3f')) return 'RAW';
  if (fileName.endsWith('.erf')) return 'RAW';
  
  return null;
};

export const isImageFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  // Standard image MIME types
  const validMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/tif',
    'image/heic',
    'image/heif',
    'image/raw',
    'image/svg+xml',
    // RAW format MIME types
    'image/x-canon-cr2',
    'image/x-canon-crw',
    'image/x-epson-erf',
    'image/x-nikon-nef',
    'image/x-olympus-orf',
    'image/x-panasonic-raw',
    'image/x-sony-arw',
    'image/x-adobe-dng',
    'image/x-hasselblad-3fr',
    'image/x-kodak-dcr',
    'image/x-kodak-k25',
    'image/x-kodak-kdc',
    'image/x-minolta-mrw',
    'image/x-fuji-raf',
    'image/x-sony-sr2',
    'image/x-sony-srf',
    'image/x-sigma-x3f'
  ];
  
  // File extensions for formats that might not have proper MIME types
  const validExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', 
    '.tiff', '.tif', '.heic', '.heif', '.raw', '.svg',
    '.dng', '.cr2', '.crw', '.nef', '.orf', '.arw', '.rw2',
    '.3fr', '.dcr', '.k25', '.kdc', '.mrw', '.raf', '.sr2',
    '.srf', '.x3f', '.erf'
  ];
  
  // Check MIME type first
  if (validMimeTypes.includes(fileType)) {
    return true;
  }
  
  // Check if it's a general image MIME type
  if (fileType.startsWith('image/')) {
    return true;
  }
  
  // Check file extension for formats that might not have proper MIME types
  return validExtensions.some(ext => fileName.endsWith(ext));
};

export const getSupportedImageFormats = (): string[] => {
  return [
    'JPEG', 'JPG', 'PNG', 'GIF', 'WEBP', 'BMP', 
    'TIFF', 'TIF', 'HEIC', 'HEIF', 'RAW', 'SVG'
  ];
};
