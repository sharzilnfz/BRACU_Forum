# 🗳️ Thread Voting System - Complete Implementation Guide

## 🎯 Overview

This guide covers the complete implementation of the upvote/downvote system for threads in BRACU Forum, including database setup, backend logic, and frontend integration.

## 📋 What You Get

### Features

- ✅ **Upvote/Downvote Threads** - Users can vote on threads
- ✅ **Vote Toggle** - Click again to remove vote
- ✅ **Vote Switching** - Change from upvote to downvote and vice versa
- ✅ **Real-time Counts** - Vote counts update automatically
- ✅ **Visual Feedback** - Highlighted buttons show user's vote
- ✅ **Net Score Display** - Shows upvotes minus downvotes
- ✅ **Optimistic UI** - Instant feedback before database confirms
- ✅ **Secure** - RLS policies prevent vote manipulation

## 🗄️ Step 1: Database Setup

### Run the SQL Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file: `setup_voting_system.sql`
4. Click **Run** to execute the script

### What This Creates:

#### 1. `thread_votes` Table

```sql
CREATE TABLE thread_votes (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES threads(id),
  user_id UUID REFERENCES auth.users(id),
  vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(thread_id, user_id) -- One vote per user per thread
);
```

#### 2. New Columns in `threads` Table

- `upvote_count` (INTEGER) - Count of upvotes
- `downvote_count` (INTEGER) - Count of downvotes

#### 3. Indexes for Performance

- `idx_thread_votes_thread_id` - Fast lookup by thread
- `idx_thread_votes_user_id` - Fast lookup by user
- `idx_thread_votes_vote_type` - Fast filtering by vote type

#### 4. RLS Policies

- **Read:** Anyone can view votes
- **Create:** Only authenticated users can vote
- **Update:** Users can only update their own votes
- **Delete:** Users can only delete their own votes

#### 5. Automatic Triggers

- **On INSERT:** Increment vote count
- **On UPDATE:** Adjust counts when vote changes
- **On DELETE:** Decrement vote count
- **On UPDATE:** Update `updated_at` timestamp

#### 6. Helper Functions

- `update_thread_vote_counts(thread_id)` - Recalculate vote counts
- `get_user_vote(thread_id, user_id)` - Get user's vote on a thread
- `toggle_thread_vote(thread_id, user_id, vote_type)` - Smart vote toggle

## 💻 Step 2: Frontend Implementation

The frontend has been updated in:

- ✅ `src/components/card.jsx` - Thread card with voting UI
- ✅ `src/App/dashboard/Page.tsx` - Passes vote counts to cards

### Key Features Implemented:

#### 1. Vote State Management

```javascript
const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
const [upvoteCount, setUpvoteCount] = useState(0);
const [downvoteCount, setDownvoteCount] = useState(0);
```

#### 2. Fetch User's Vote

- Loads on component mount
- Shows which button to highlight
- Persists across page refreshes

#### 3. Vote Handling

- **Click upvote when not voted:** Adds upvote
- **Click upvote when upvoted:** Removes upvote
- **Click downvote when upvoted:** Changes to downvote
- **Click downvote when downvoted:** Removes downvote

#### 4. Optimistic Updates

- UI updates immediately
- Database confirms in background
- Reverts if database fails

#### 5. Visual Feedback

- **Upvoted:** Green button with fill
- **Downvoted:** Red button with fill
- **Not voted:** Gray buttons
- **Net score:** Green if positive, red if negative

## 🔄 How It Works

### Voting Flow

```
1. User clicks upvote/downvote button
   ↓
2. Check if user is logged in
   ↓
3. Update UI optimistically (instant feedback)
   ↓
4. Call toggle_thread_vote() function
   ↓
5. Function determines action:
   - Same vote → Remove vote
   - No vote → Add vote
   - Different vote → Change vote
   ↓
6. Trigger updates vote counts automatically
   ↓
7. Fetch updated counts from database
   ↓
8. Update UI with confirmed counts
   ↓
9. Dispatch 'thread-updated' event
   ↓
10. Dashboard refreshes thread list
```

### Database Logic

```sql
-- Example: User upvotes a thread

-- If no existing vote:
INSERT INTO thread_votes (thread_id, user_id, vote_type)
VALUES ('thread-123', 'user-456', 'upvote');
-- Trigger increments threads.upvote_count

-- If already upvoted (toggle off):
DELETE FROM thread_votes
WHERE thread_id = 'thread-123' AND user_id = 'user-456';
-- Trigger decrements threads.upvote_count

-- If downvoted (switch to upvote):
UPDATE thread_votes
SET vote_type = 'upvote'
WHERE thread_id = 'thread-123' AND user_id = 'user-456';
-- Trigger decrements downvote_count and increments upvote_count
```

## 🧪 Step 3: Testing

### Test 1: Upvote a Thread

1. Open your app
2. Find a thread
3. Click the upvote button (↑)
4. **Expected:**
   - Button turns green
   - Arrow fills in
   - Score increases by 1
   - No page refresh needed

### Test 2: Remove Upvote

1. Click upvote button again
2. **Expected:**
   - Button turns gray
   - Arrow outline only
   - Score decreases by 1

### Test 3: Switch Vote

1. Upvote a thread
2. Click downvote button
3. **Expected:**
   - Upvote button turns gray
   - Downvote button turns red
   - Score decreases by 2 (lost upvote + gained downvote)

### Test 4: Database Verification

```sql
-- Check votes table
SELECT tv.*, p.full_name, t.title
FROM thread_votes tv
JOIN profiles p ON tv.user_id = p.id
JOIN threads t ON tv.thread_id = t.id
ORDER BY tv.created_at DESC
LIMIT 10;

-- Check vote counts
SELECT
  t.title,
  t.upvote_count,
  t.downvote_count,
  (t.upvote_count - t.downvote_count) as net_score
FROM threads t
WHERE t.upvote_count > 0 OR t.downvote_count > 0
ORDER BY net_score DESC;
```

### Test 5: Multiple Users

1. Open app in two browsers (different users)
2. User 1 upvotes a thread
3. User 2 should see the updated count
4. User 2 can vote independently

### Test 6: Unauthenticated User

1. Log out
2. Try to click vote button
3. **Expected:** Alert "Please log in to vote"

## 🔐 Security Features

### Row Level Security (RLS)

```sql
-- Users can only vote as themselves
CREATE POLICY "Authenticated users can vote"
  ON thread_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only modify their own votes
CREATE POLICY "Users can update their own votes"
  ON thread_votes
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Vote Integrity

- ✅ One vote per user per thread (UNIQUE constraint)
- ✅ Vote type must be 'upvote' or 'downvote' (CHECK constraint)
- ✅ Cascading deletes (if thread deleted, votes deleted)
- ✅ Automatic count synchronization (triggers)

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                   THREAD_VOTES TABLE                     │
├─────────────────────────────────────────────────────────┤
│ id              UUID (PK)                                │
│ thread_id       UUID (FK) → threads.id                   │
│ user_id         UUID (FK) → auth.users.id                │
│ vote_type       VARCHAR(10) ('upvote' or 'downvote')     │
│ created_at      TIMESTAMP                                │
│ updated_at      TIMESTAMP                                │
│ UNIQUE(thread_id, user_id)                               │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   THREADS TABLE       │
        ├───────────────────────┤
        │ id (PK)               │
        │ title                 │
        │ upvote_count ←────────┼── Auto-updated by triggers
        │ downvote_count ←──────┼── Auto-updated by triggers
        └───────────────────────┘
```

## 🎨 UI Components

### Thread Card Voting Section

```jsx
<div className="flex items-center gap-1">
  {/* Upvote Button */}
  <button onClick={() => handleVote('upvote')}>
    <ArrowBigUp /> {/* Green when voted */}
  </button>

  {/* Net Score */}
  <span>{upvoteCount - downvoteCount}</span>

  {/* Downvote Button */}
  <button onClick={() => handleVote('downvote')}>
    <ArrowBigDown /> {/* Red when voted */}
  </button>
</div>
```

### Visual States

- **Not Voted:** Gray buttons, outline icons
- **Upvoted:** Green button, filled icon, green score
- **Downvoted:** Red button, filled icon, red score (if negative)

## 📈 Analytics Queries

### Most Upvoted Threads

```sql
SELECT title, upvote_count, downvote_count,
  (upvote_count - downvote_count) as net_score
FROM threads
ORDER BY upvote_count DESC
LIMIT 10;
```

### Most Controversial (high votes both ways)

```sql
SELECT title, upvote_count, downvote_count,
  (upvote_count + downvote_count) as total_votes,
  ABS(upvote_count - downvote_count) as controversy
FROM threads
WHERE upvote_count > 5 AND downvote_count > 5
ORDER BY controversy ASC
LIMIT 10;
```

### User Voting Activity

```sql
SELECT
  p.full_name,
  COUNT(*) as total_votes,
  SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes_given,
  SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes_given
FROM thread_votes tv
JOIN profiles p ON tv.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY total_votes DESC;
```

## 🐛 Troubleshooting

### Votes Not Saving

1. Check browser console for errors
2. Verify user is logged in
3. Check RLS policies are enabled
4. Verify `toggle_thread_vote` function exists

### Count Mismatch

```sql
-- Recalculate all vote counts
UPDATE threads t
SET
  upvote_count = (
    SELECT COUNT(*) FROM thread_votes
    WHERE thread_id = t.id AND vote_type = 'upvote'
  ),
  downvote_count = (
    SELECT COUNT(*) FROM thread_votes
    WHERE thread_id = t.id AND vote_type = 'downvote'
  );
```

### Button Not Highlighting

1. Check `fetchUserVote()` is being called
2. Verify `thread_votes` table has data
3. Check `userProfile.id` matches vote `user_id`

## ✅ Success Checklist

- [ ] Database setup complete
- [ ] `thread_votes` table exists
- [ ] RLS policies active
- [ ] Triggers created
- [ ] Vote counts columns added to threads
- [ ] Can upvote a thread
- [ ] Can downvote a thread
- [ ] Can remove vote
- [ ] Can switch vote
- [ ] Counts update correctly
- [ ] Visual feedback works
- [ ] Real-time updates work
- [ ] Works on mobile

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add vote sorting (sort threads by score)
- [ ] Show vote percentage (% upvoted)
- [ ] Add vote history for users
- [ ] Implement vote notifications
- [ ] Add vote analytics dashboard
- [ ] Prevent vote manipulation (rate limiting)
- [ ] Add "Hot" algorithm (score + recency)

## 🎉 You're Done!

Your voting system is now fully functional with:

- Database persistence
- Real-time updates
- Security policies
- Automatic counting
- Clean, intuitive UI
- Optimistic updates

Happy voting! 🗳️
