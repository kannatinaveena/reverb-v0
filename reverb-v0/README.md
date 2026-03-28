# Reverb - Collaborative Music Streaming Platform

## Table of Contents
1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)

---

## Introduction

**Reverb** is a collaborative real-time music streaming web application built with Next.js 14, TypeScript, and Prisma ORM. It enables users to create and join live streaming rooms where they can collectively manage a music queue from YouTube videos.

### Project Showcase (STAR Method)
- **Situation**: In a world of individual music consumption, there was a need for a platform that fosters community-driven music experiences, allowing groups to collaboratively curate and vote on playlists in real-time.
- **Task**: Develop a full-stack web application that integrates YouTube video streaming, user authentication, real-time queue management, and voting systems to create an engaging, shared listening experience.
- **Action**: Implemented using Next.js for the frontend and API routes, Prisma for database management, NextAuth for secure authentication, and Google's YouTube Data API for video metadata. Features include automatic queue progression, voting mechanics, and responsive UI components.
- **Result**: A robust, scalable application that supports seamless collaboration, with features like auto-play next, copy-and-share functionality, notification popups, and persistent data storage, ensuring users can enjoy synchronized music sessions across devices.

---

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN/UI Components
- Lucide React Icons
- React Lite YouTube Embed
- React Toastify / Sonner

**Backend:**
- Next.js API Routes
- NextAuth.js (Google OAuth)
- Prisma ORM
- Zod Validation
- YouTube Data API

**Database:**
- PostgreSQL (via Prisma)
---

## Features

Reverb offers a comprehensive set of features designed for collaborative music streaming:

- **Google Authentication**: Secure login using Google OAuth via NextAuth, with user data stored in PostgreSQL for session management.
- **Stream Creation and Joining**: Authenticated users can create new streams or join existing ones by stream ID, enabling group participation.
- **YouTube Integration**: Users can add songs by pasting YouTube URLs; the app automatically fetches metadata (title, thumbnails) using Google's YouTube Data API.
- **Live Voting System**: Participants can upvote or downvote songs in the queue, dynamically reordering the list based on vote counts.
- **Auto-Play Next**: The system automatically plays the highest-voted song when the current one ends, ensuring continuous playback without manual intervention.
- **Copy and Share**: Easily copy the stream URL to share with others, allowing instant access to the collaborative session.
- **Notification Popups**: Real-time notifications inform users of queue updates, votes, and playback changes via toast messages.
- **Real-Time Updates**: Short polling refreshes the queue every 10 seconds, providing live synchronization across all participants.
- **Persistent Data**: All streams, users, songs, and votes are stored in PostgreSQL, ensuring data integrity and session continuity.
- **Responsive UI**: Built with Tailwind CSS and ShadCN components for a modern, mobile-friendly interface.
- **Session Management**: Hybrid JWT and cookie-based authentication for secure, encrypted user sessions.
---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL database (local or hosted)

### Installation Steps
1. **Clone the Repository**
   ```
   git clone https://github.com/SairamChinta/reverb-v0.git
   cd reverb-v0
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Setup the Database**
   ```
   npx prisma migrate dev
   ```
   (Optional) Inspect the database with Prisma Studio:
   ```
   npx prisma studio
   ```

4. **Start the Application**
   ```
   npm run dev
   ```
   Visit the app at http://localhost:3001
---

## Environment Variables

Create a `.env.local` file at the root of your project with the following variables:

```
# Application
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<your-random-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reverb

# YouTube API
YOUTUBE_API_KEY=<your-youtube-api-key>
```