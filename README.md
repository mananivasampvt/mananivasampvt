# Mana Nivasam - Prime Vista Homes

## Project info

**Developer**: SHIVA from Dream Team Services
**Description**: A premium real estate web application built with modern technologies, featuring comprehensive property listings with image and video galleries, admin management, and user authentication.

## Features

### 🏡 Property Management
- **Comprehensive Property Listings**: Browse properties by type (Buy, Rent, Commercial, Land, PG/Hostels)
- **Advanced Search & Filtering**: Filter by location, price range, property type, and amenities
- **Property Details**: Detailed property pages with specifications, amenities, and location maps
- **Image & Video Galleries**: Interactive media galleries with carousel navigation and lightbox view

### 📹 Video Support (New!)
- **Multi-Format Video Support**: Upload or link videos in MP4, MOV, WEBM formats
- **External Video Integration**: Support for YouTube and Vimeo videos via URL
- **Unified Media Experience**: Videos and images seamlessly integrated in property carousels
- **Video Thumbnails**: Automatic thumbnail generation with play overlay indicators
- **Responsive Video Playback**: Optimized video viewing across all device sizes

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive property management interface
- **Media Upload**: Easy drag-and-drop image and video uploading
- **Video URL Integration**: Add YouTube, Vimeo, or direct video links
- **Property CRUD Operations**: Create, read, update, and delete properties
- **Real-time Preview**: Live preview of property media during upload

### 🔐 User Authentication
- **Secure Login/Signup**: Firebase-based user authentication
- **User Profiles**: Personalized user accounts and preferences
- **Shortlist Management**: Save and manage favorite properties

### 📱 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Modern carousel, galleries, and navigation
- **Loading States**: Smooth loading animations and skeleton screens
- **Accessibility**: WCAG-compliant design patterns

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

Clone this repo and push changes to work locally using your own IDE.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **Backend**: Firebase (Firestore for database, Authentication, Storage)
- **Media Processing**: Custom video utilities with thumbnail extraction
- **Routing**: React Router for navigation
- **State Management**: React Context API
- **Form Handling**: React Hook Form with validation
- **Icons**: Lucide React icons
- **Deployment**: Vercel/Netlify ready

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── VideoUploader.tsx    # Video upload component (NEW)
│   ├── PropertyCard.tsx     # Property card with media carousel
│   ├── PropertyImageGallery.tsx  # Unified image/video gallery
│   └── AdminPropertyForm.tsx     # Admin form with video support
├── pages/              # Application pages
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and Firebase config
│   ├── mediaUtils.ts   # Video/image utilities (NEW)
│   └── firebase.ts     # Firebase configuration
└── types/              # TypeScript type definitions
```

## Video Integration Guide

### For Admins: Adding Videos to Properties

1. **Access Admin Panel**: Navigate to `/admin` and log in with admin credentials
2. **Create/Edit Property**: Open the property form
3. **Upload Videos**: 
   - **File Upload**: Drag and drop video files (MP4, MOV, WEBM) or click to browse
   - **Video URLs**: Add YouTube, Vimeo, or direct video links in the URL input section
4. **Preview**: Videos will show preview thumbnails with validation status
5. **Save**: Submit the form to save the property with videos

### Supported Video Formats

- **File Uploads**: MP4, MOV, WEBM (max 50MB recommended)
- **YouTube**: Full YouTube URLs (youtube.com/watch, youtu.be)
- **Vimeo**: Full Vimeo URLs (vimeo.com)
- **Direct Links**: Direct video file URLs (.mp4, .mov, .webm)

### For Users: Viewing Property Videos

- **Property Cards**: Videos appear in the main carousel with play button overlay
- **Property Details**: Full-screen video gallery with navigation
- **Lightbox Mode**: Click videos to open in full-screen lightbox
- **Mobile Optimized**: Touch gestures and responsive video players

## Development Guidelines

### Adding New Video Features

1. **Media Utilities**: Use `src/lib/mediaUtils.ts` for video-related functions
2. **Video Detection**: Use `isVideoUrl()` and `getVideoType()` helpers
3. **Thumbnails**: Leverage `extractVideoThumbnail()` for preview generation
4. **Unified Media**: Always use `combineMediaItems()` for mixed image/video arrays

### Component Usage

```tsx
// Using the VideoUploader component
import VideoUploader from './VideoUploader';

<VideoUploader
  videos={videos}
  onVideosChange={handleVideosChange}
  maxVideos={5}
/>

// Using unified media in galleries
import { combineMediaItems } from '../lib/mediaUtils';

const mediaItems = combineMediaItems(images, videos);
```

## How can I deploy this project?

This project can be deployed using any modern hosting platform like Vercel, Netlify, or traditional web servers.

## Can I connect a custom domain?

Yes, you can connect a custom domain through your hosting provider's domain management settings.
