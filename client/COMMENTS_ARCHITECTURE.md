# Comments System Architecture

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      COMMENTS TABLE                          │
├─────────────────────────────────────────────────────────────┤
│ id              UUID (PK)          Auto-generated           │
│ thread_id       UUID (FK)          → threads.id             │
│ content         TEXT               Comment text             │
│ created_by      UUID (FK)          → auth.users.id          │
│ created_at      TIMESTAMP          Auto-set on insert       │
│ updated_at      TIMESTAMP          Auto-updated on edit     │
└─────────────────────────────────────────────────────────────┘
                    │                        │
                    │                        │
                    ▼                        ▼
        ┌───────────────────┐    ┌──────────────────┐
        │   THREADS TABLE   │    │  PROFILES TABLE  │
        ├───────────────────┤    ├──────────────────┤
        │ id (PK)           │    │ id (PK)          │
        │ title             │    │ full_name        │
        │ content           │    │ username         │
        │ comment_count ←───┼────│ avatar_url       │
        │ created_by        │    └──────────────────┘
        └───────────────────┘
```

## 🔄 Data Flow

### 1. Posting a Comment

```
User Types Comment
       ↓
Click "Comment" Button
       ↓
Frontend Validation (not empty)
       ↓
POST to Supabase
       ↓
Insert into comments table
       ↓
Trigger: auto_increment_comment_count()
       ↓
Update threads.comment_count += 1
       ↓
Return new comment data
       ↓
Update UI with new comment
       ↓
Dispatch 'thread-updated' event
       ↓
Dashboard refreshes thread list
```

### 2. Loading Comments

```
User Opens Thread Modal
       ↓
Fetch comments WHERE thread_id = X
       ↓
Get unique user IDs from comments
       ↓
Fetch profiles for those users
       ↓
Join comments with author data
       ↓
Display in UI (sorted by created_at)
```

## 🔐 Security (RLS Policies)

```
┌──────────────────────────────────────────────────────┐
│                  RLS POLICIES                         │
├──────────────────────────────────────────────────────┤
│                                                       │
│  SELECT (Read)                                        │
│  ✓ Anyone can view comments                          │
│  Policy: USING (true)                                 │
│                                                       │
│  INSERT (Create)                                      │
│  ✓ Only authenticated users                          │
│  ✓ created_by must match auth.uid()                  │
│  Policy: WITH CHECK (auth.uid() = created_by)        │
│                                                       │
│  UPDATE (Edit)                                        │
│  ✓ Only comment author                               │
│  Policy: USING (auth.uid() = created_by)             │
│                                                       │
│  DELETE (Remove)                                      │
│  ✓ Only comment author                               │
│  Policy: USING (auth.uid() = created_by)             │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## ⚡ Triggers & Functions

### Trigger 1: Auto-Increment on Insert

```sql
CREATE TRIGGER trigger_increment_comment_count
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_comment_count();
```

**What it does:** Automatically increases thread's comment_count by 1

### Trigger 2: Auto-Decrement on Delete

```sql
CREATE TRIGGER trigger_decrement_comment_count
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_comment_count();
```

**What it does:** Automatically decreases thread's comment_count by 1

### Trigger 3: Update Timestamp

```sql
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**What it does:** Sets updated_at to NOW() when comment is edited

## 🎨 Frontend Components

```
ThreadModal Component
├── Post Header
│   ├── Author Avatar
│   ├── Author Name
│   ├── Category Badge
│   └── Date
├── Post Content
│   ├── Title
│   ├── Full Content
│   └── Tags
├── Stats Bar
│   └── Comment Count (dynamic)
├── Comment Input
│   ├── Textarea
│   └── Submit Button
└── Comments List
    └── CommentItem (repeated)
        ├── Author Avatar
        ├── Author Name
        ├── Timestamp
        └── Comment Content
```

## 📡 Real-time Updates

```
Comment Posted
       ↓
window.dispatchEvent('thread-updated')
       ↓
Page.tsx listens for event
       ↓
fetchThreads(silent=true)
       ↓
Updates comment counts in thread list
       ↓
UI reflects new count
```

## 🔍 Key Functions

### Frontend (thread-modal.jsx)

1. **fetchComments()**

   - Fetches all comments for a thread
   - Joins with author profiles
   - Updates state

2. **handleSubmitComment()**
   - Validates input
   - Inserts comment to DB
   - Increments count (via trigger)
   - Updates local state
   - Dispatches update event

### Backend (Supabase)

1. **increment_comment_count(thread_id)**

   - Manual function to increment
   - Used as fallback if trigger fails

2. **decrement_comment_count(thread_id)**
   - Manual function to decrement
   - Used for manual corrections

## 📈 Performance Optimizations

1. **Indexes:**

   - `idx_comments_thread_id` - Fast lookup by thread
   - `idx_comments_created_by` - Fast lookup by author
   - `idx_comments_created_at` - Fast sorting by date

2. **Efficient Queries:**

   - Batch fetch author profiles (not one-by-one)
   - Use silent refresh to avoid loading states
   - Cache comment counts in threads table

3. **Real-time:**
   - Supabase Realtime for UPDATE events
   - Custom events for local updates
   - Silent background refreshes

## 🎯 User Experience Flow

```
1. User clicks on thread
   └─→ Modal opens

2. Loading state shown
   └─→ "Loading comments..."

3. Comments fetched and displayed
   └─→ Shows count: "5 Comments"

4. User types comment
   └─→ Button enables when text entered

5. User clicks "Comment"
   └─→ Button shows "Posting..."
   └─→ Comment appears immediately
   └─→ Count updates: "6 Comments"
   └─→ Dashboard refreshes in background

6. Other users see update
   └─→ Via Realtime subscription
   └─→ Count updates automatically
```

## ✅ Success Criteria

- [x] Comments persist in database
- [x] Comment counts are accurate
- [x] Real-time updates work
- [x] Security policies prevent abuse
- [x] UI is responsive and fast
- [x] Error handling is graceful
- [x] Loading states are smooth

## 🚀 Next Steps

After implementing, you can add:

- Edit comments functionality
- Delete comments functionality
- Comment reactions/likes
- Pagination for large threads
- Rich text editor
- Image uploads in comments
- @mentions
- Comment notifications
