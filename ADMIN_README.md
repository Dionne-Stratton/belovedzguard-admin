# BelovedZGuard Admin Panel

A React-based admin interface for managing songs and albums in the BelovedZGuard Music platform.

## Features

- 🎵 **Songs Management** - Create, Read, Update, Delete songs
- 💿 **Albums Management** - Create, Read, Update, Delete albums
- 🔐 **Authentication** - JWT token management for admin operations
- 📱 **Responsive Design** - Clean, modern UI

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn
- Access to the BelovedZGuard API

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser at `http://localhost:5173`

## Authentication Setup

### Getting Your Auth0 Token

To perform admin operations (Create, Update, Delete), you need an Auth0 JWT token:

1. **Using Auth0 Dashboard:**

   - Log in to your Auth0 Dashboard
   - Go to User Management
   - Find your admin user
   - Manually generate a token for testing

2. **Using cURL (for testing):**

```bash
curl -X POST 'https://YOUR_AUTH0_DOMAIN/oauth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "YOUR_AUDIENCE",
    "grant_type": "client_credentials"
  }'
```

3. **Using Postman/Insomnia:**
   - Create a new request to your Auth0 token endpoint
   - Use Client Credentials grant type
   - Copy the received access token

### Setting the Token in the Admin Panel

1. Navigate to any page in the admin panel
2. You'll see the auth token section at the top
3. Click "Change Token" (or it will show automatically if no token is set)
4. Paste your JWT token
5. Click "Save"

The token is stored in your browser's localStorage for future sessions.

## Usage

### Songs Management

- **View Songs**: Browse all songs in a table format
- **Create Song**: Click "+ Add Song" to create a new song
  - Required fields: Title, Genre
  - Optional fields: MP3 URL, Thumbnails, YouTube URL, Lyrics URL
- **Edit Song**: Click "Edit" on any song to modify it
- **Delete Song**: Click "Delete" to remove a song (with confirmation)

### Albums Management

- **View Albums**: See all albums in a grid layout
- **Create Album**: Click "+ Add Album" to create a new album
  - Required field: Title
  - Optional field: Song IDs (comma-separated)
- **Edit Album**: Click "Edit" on any album to modify it
- **Delete Album**: Click "Delete" to remove an album (with confirmation)

## API Base URL

The admin panel connects to:

```
https://belovedzguard-ebf890192e0e.herokuapp.com
```

To change this, edit `src/config/api.js`:

```javascript
export const API_BASE_URL = "YOUR_API_URL";
```

## Project Structure

```
src/
├── components/
│   ├── Albums.jsx          # Albums CRUD interface
│   ├── AuthToken.jsx       # Token management UI
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Layout.jsx          # Layout with navigation
│   └── Songs.jsx           # Songs CRUD interface
├── config/
│   └── api.js              # API configuration
├── services/
│   ├── albumsAPI.js        # Album API calls
│   ├── api.js              # Axios setup & interceptors
│   └── songsAPI.js         # Song API calls
├── App.jsx                  # Main app with routing
└── main.jsx                 # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Data Structures

### Song

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "genre": "string (required)",
  "mp3": "string (optional)",
  "songThumbnail": "string (optional)",
  "animatedSongThumbnail": "string (optional)",
  "videoThumbnail": "string (optional)",
  "youTube": "string (optional)",
  "lyrics": "string (optional)"
}
```

### Album

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "songs": ["ObjectId"] (optional),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Troubleshooting

### "Error loading songs/albums"

- Check if the API is running
- Verify the API_BASE_URL in `src/config/api.js`
- Check browser console for detailed error messages

### "Admin access required" errors

- Ensure your JWT token is valid
- Verify you have admin permissions in Auth0
- Check that the token hasn't expired (typically 24 hours)
- **Token Expiration**: If your token expires while using the admin panel, you'll see a warning and be prompted to enter a new token

### Token not saving

- Check if localStorage is enabled in your browser
- Try clearing browser cache
- Check browser console for errors

## Security Notes

- JWT tokens are stored in browser localStorage
- Never commit tokens to version control
- Tokens have expiration times (typically 24 hours)
- Admin operations require valid JWT authentication
- All API calls include the Authorization header automatically
- **Token Expiration**: The admin panel automatically detects expired tokens and prompts you to enter a new one

## Support

For API documentation, see `API.md` in the project root.

For issues or questions about the admin panel, please contact the development team.
