# Lecture Player Feature

A comprehensive video learning platform with intelligent progress tracking, auto-resume capabilities, and seamless navigation.

## 📁 File Structure

```
app/
├── api/learner/
│   ├── getCourseContent.ts     # Fetch course structure with progress
│   └── updateProgress.ts       # Update lecture watch progress
└── learn/[courseId]/[lectureId]/
    └── page.tsx                # Main lecture player page

components/Learn/
├── LectureHeader.tsx           # Top navigation bar with controls
├── LectureSidebar.tsx         # Course sections and lectures list
├── VideoPlayer.tsx            # Shaka Player integration
├── index.ts                   # Component exports
└── README.md                  # This file
```

## 🎯 Key Features

### 1. **Smart Video Player** (Shaka Player)
- **Auto-resume**: Automatically resumes from last watched position
- **Multi-format support**: HLS, DASH, and more
- **Adaptive bitrate**: Automatically adjusts quality based on connection
- **Built-in controls**: Play/pause, volume, fullscreen, playback rate, quality selector

### 2. **Intelligent Progress Tracking**
- **Periodic updates**: Saves progress every 30 seconds during playback
- **Event-based saves**: Updates on pause, seek, and unmount
- **Debounced API calls**: Prevents excessive server requests (2-second debounce)
- **Auto-completion**: Marks lecture complete when within 5 seconds of end
- **Optimistic updates**: UI updates immediately, syncs with server in background

### 3. **Seamless Navigation**
- **Next/Previous buttons**: Navigate between lectures
- **Sidebar navigation**: Click any lecture to jump directly
- **Auto-advance**: Automatically moves to next lecture when current one ends
- **Smart routing**: Redirects to first incomplete lecture when accessing course root

### 4. **Progress Visualization**
- **Overall progress bar**: Shows course completion percentage
- **Section progress**: Individual progress for each section
- **Lecture status icons**:
  - ✅ Completed (green checkmark)
  - ▶️ Currently playing (blue play icon)
  - ⚪ Not started (empty circle)
  - 📊 In progress (progress bar)

### 5. **Course Completion**
- **Congratulations dialog**: Shows when all lectures are completed
- **Certificate notification**: Alerts user if certificate is generated
- **Auto-redirect**: Navigates to certificates or courses page

## 🔧 Technical Implementation

### API Integration

#### Get Course Content
```typescript
GET /api/v1/learner/courses/{course_id}/content

Response: {
  courseId: string;
  enrollmentId: string;
  overallProgress: number;
  sections: Section[];
  // ... more fields
}
```

#### Update Progress
```typescript
PUT /api/v1/learner/progress/update

Payload: {
  enrollment_id: string;
  lecture_id: string;
  is_completed: boolean;
  watch_time: number;
  last_position: number;
}

Response: {
  courseCompleted: boolean;
  courseProgressPercentage: number;
  certificateGenerated: boolean;
  // ... more fields
}
```

### State Management

**TanStack Query** for data fetching and caching:
- 5-minute stale time for course content
- Optimistic updates for progress changes
- Automatic refetching on window focus

**React State** for UI interactions:
- Current lecture tracking
- Video player state
- Dialog visibility
- Error handling

### Progress Tracking Logic

```typescript
// 1. Report progress every 5 seconds during playback
const handleTimeUpdate = () => {
  if (Math.abs(currentTime - lastReportedTime) >= 5) {
    debouncedProgressUpdate({...});
  }
};

// 2. Periodic update every 30 seconds
setInterval(() => {
  if (!video.paused) {
    onProgressUpdate(currentTime, duration);
  }
}, 30000);

// 3. On pause/unmount
video.addEventListener('pause', () => {
  onProgressUpdate(currentTime, duration);
});

// 4. Debounced API call (2 seconds)
const debouncedProgressUpdate = (payload) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    mutation.mutate(payload);
  }, 2000);
};
```

## 🎨 UI/UX Design

### Layout
- **Fixed header**: Sticky navigation bar at top
- **Flexible video area**: Centered video player with black background
- **Fixed sidebar**: 384px wide right sidebar with course structure
- **Responsive**: Adapts to different screen sizes

### Color Scheme
- **Primary**: Blue for active states and actions
- **Success**: Green for completed lectures
- **Default**: Gray tones for neutral elements
- **Background**: Dark gray for video player area

### Loading States
- **Skeleton loaders**: For header, sidebar, and video player
- **Spinner**: For initial course content load
- **Button states**: "Completing..." text when marking lecture complete

## 📱 User Workflows

### Starting a Course
1. Navigate to `/learn/{courseId}/0`
2. System automatically redirects to first incomplete lecture
3. Video loads and auto-resumes from last position
4. User can watch, navigate, and interact

### Watching a Lecture
1. Video plays with Shaka Player
2. Progress updates automatically in background
3. User can pause, seek, or adjust settings
4. Sidebar shows real-time progress

### Completing a Course
1. Watch all lectures to completion
2. System detects course completion
3. Congratulations dialog appears
4. If certificate generated, user can view it
5. Otherwise, redirected to courses page

## 🔐 Error Handling

- **Network errors**: Graceful error messages with retry options
- **Video load failures**: Fallback UI with helpful error messages
- **Missing data**: Appropriate loading and empty states
- **Progress sync failures**: Silent retries, console logging for debugging

## 🚀 Performance Optimizations

1. **Memoization**: Heavy computations cached with `useMemo`
2. **Debouncing**: API calls throttled to reduce server load
3. **Query caching**: Course content cached for 5 minutes
4. **Optimistic updates**: UI updates before server confirmation
5. **Lazy loading**: Components loaded only when needed
6. **Event cleanup**: All listeners removed on unmount

## 🧪 Testing Considerations

### Unit Tests
- Helper functions (findLectureById, findAdjacentLecture, etc.)
- Progress calculation logic
- Debounce implementation

### Integration Tests
- Complete lecture workflow
- Navigation between lectures
- Progress synchronization
- Course completion flow

### E2E Tests
- Full user journey from course start to completion
- Video playback and controls
- Sidebar interactions
- Certificate generation

## 📝 Usage Example

```tsx
// Access a specific lecture
<Link href="/learn/course-uuid/lecture-uuid">
  Watch Lecture
</Link>

// Start from beginning (finds first incomplete)
<Link href="/learn/course-uuid/0">
  Start Course
</Link>
```

## 🛠️ Configuration

### Video Player Settings
Located in `VideoPlayer.tsx`:
```typescript
const config = {
  addSeekBar: true,
  addBigPlayButton: true,
  controlPanelElements: [
    'play_pause',
    'time_and_duration',
    'spacer',
    'mute',
    'volume',
    'fullscreen',
    'overflow_menu',
  ],
  overflowMenuButtons: [
    'playback_rate',
    'quality',
    'captions',
  ],
};
```

### Progress Update Intervals
- **Time-based reporting**: Every 5 seconds
- **Periodic sync**: Every 30 seconds
- **API debounce**: 2 seconds
- **Auto-complete threshold**: Within 5 seconds of end

## 🔮 Future Enhancements

1. **Offline support**: Download lectures for offline viewing
2. **Playback speed memory**: Remember user's preferred speed
3. **Bookmarks**: Allow users to bookmark specific timestamps
4. **Notes**: Take notes at specific video timestamps
5. **Subtitles**: Full subtitle/caption support
6. **Picture-in-Picture**: Continue watching while browsing
7. **Watch party**: Watch together with other students
8. **Analytics**: Detailed engagement metrics for instructors

## 🐛 Known Issues & Limitations

1. Video URL construction assumes specific asset endpoint format
2. No offline support currently
3. Mobile responsiveness could be improved (fixed sidebar width)
4. No keyboard shortcuts implemented yet
5. No subtitle/caption management UI

## 📚 Dependencies

- **shaka-player**: ^4.16.8 - Video player
- **@tanstack/react-query**: ^5.x - Data fetching
- **next**: ^15.x - Framework
- **react**: ^19.x - UI library
- **lucide-react**: Icons
- **tailwindcss**: Styling

---

Built with ❤️ for seamless video learning experiences.

