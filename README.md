# BRACU Forum

A modern forum application for BRAC University students built with React, Vite, and Supabase.

## Features

- 🔐 **Authentication** - Secure user authentication with Supabase
- 💬 **Threads & Comments** - Create and discuss threads with comments
- 🗳️ **Voting System** - Upvote/downvote threads
- 👤 **User Profiles** - Customizable user profiles with avatars
- 🔍 **Search & Filter** - Search threads and filter by category
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Works on all devices

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd BRACU_Forum/client
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables
   Create a `.env` file in the client directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database

- Open your Supabase Dashboard → SQL Editor
- Run the `database_setup.sql` script

5. Start the development server

```bash
pnpm run dev
```

## Database Setup

Run `database_setup.sql` in your Supabase SQL Editor to set up:

- Comments system with automatic count tracking
- Voting system with upvote/downvote functionality
- Row Level Security (RLS) policies
- Automatic triggers for data integrity

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Icons:** Lucide React

## Project Structure

```
client/
├── src/
│   ├── App/           # Main app pages
│   ├── components/    # React components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
├── public/            # Static assets
└── database_setup.sql # Database setup script
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
