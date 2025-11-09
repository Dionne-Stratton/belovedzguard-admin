# BelovedZGuard Admin Panel

A React-based admin interface for managing songs and albums in the BelovedZGuard Music platform.

## Features

- 🎵 **Songs Management** - Create, Read, Update, Delete songs with search functionality
- 💿 **Albums Management** - Create, Read, Update, Delete albums with song reordering
- 🔐 **Authentication** - Auth0 login integration for secure admin operations
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

3. Create a `.env` file in the root directory with your Auth0 credentials:

```env
VITE_APP_PRODUCTION_SERVER_URL=https://belovedzguard-ebf890192e0e.herokuapp.com
VITE_APP_AUTH0_PROD_DOMAIN=your-auth0-domain.auth0.com
VITE_APP_AUTH0_CLIENT_ID=your-client-id
VITE_APP_AUDIENCE=your-api-audience
```

4. Open your browser at `http://localhost:3000`

## Authentication Setup

### Auth0 Login

The admin panel uses Auth0 for authentication. When you first load the app:

1. Click the **"Sign In"** button in the top right
2. You'll be redirected to Auth0's login page
3. Enter your admin credentials
4. You'll be redirected back to the admin panel

The session is automatically maintained using Auth0's SDK.

See `AUTH0_SETUP.md` for detailed Auth0 configuration instructions.

## Usage

### Songs Management

- **View Songs**: Browse all songs with search functionality
- **Create Song**: Click "+ Add Song" to create a new song
  - Required fields: Title, Genre
  - Optional fields: Description, Verse, YouTube URL
  - Media uploads (optional): MP3 audio, song thumbnail, animated thumbnail, video thumbnail, lyrics file
    - Choose a file in the corresponding slot to upload via the Cloudflare R2 presign flow
    - Leave a slot blank to keep the existing asset
- **Save as Draft**: Use the "Save as Draft" button to create or update a song without publishing it
  - Draft songs appear in the **Drafts** tab and remain hidden from public routes
  - Switching tabs between **Published** and **Drafts** filters the table accordingly
- **Edit Song**: Click "Edit" on any song to modify it
  - Form automatically scrolls to top for better UX
- **Delete Song**: Click "Delete" to remove a song (with confirmation)
- **Search Songs**: Use the search bar to filter songs by title

### Albums Management

- **View Albums**: See all albums in a grid layout with song previews
- **Create Album**: Click "+ Add Album" to create a new album
  - Two-column interface:
    - **Available Songs** (left): Browse and add songs to the album
    - **Songs in Album** (right): View and manage album songs
  - Search available songs using the search bar
  - Use **+** to add songs, **×** to remove songs
  - Use **↑↓** arrows to reorder songs within the album
- **Save Album as Draft**: Use the "Save as Draft" button to create a draft album
  - Draft albums are visible under the **Drafts** tab in the album list and hidden from public routes
- **Edit Album**: Click "Edit" on any album to modify it
  - Form automatically scrolls to top
  - Songs can be reordered with up/down arrows
- **Delete Album**: Click "Delete" to remove an album (with confirmation)

## API Base URL

The admin panel connects to the production server by default. To change this, update your `.env` file:

```env
VITE_APP_PRODUCTION_SERVER_URL=https://belovedzguard-ebf890192e0e.herokuapp.com
```

## Project Structure

```
src/
├── components/
│   ├── Albums.jsx           # Albums CRUD interface with song reordering
│   ├── AuthWrapper.jsx      # Auth0 wrapper for API service
│   ├── Dashboard.jsx         # Main dashboard
│   ├── GenreFilter.jsx      # Genre dropdown component
│   ├── Layout.jsx           # Layout with navigation
│   ├── Login.jsx            # Auth0 login component
│   └── Songs.jsx             # Songs CRUD interface with search
├── services/
│   ├── albumsAPI.js         # Album API calls
│   ├── createApiInstance.js # API instance with Auth0 integration
│   ├── songsAPI.js          # Song API calls
│   ├── uploadsAPI.js        # Presigned upload requests
│   └── api.js               # API exports
├── App.jsx                   # Main app with routing
└── main.jsx                  # Entry point with Auth0Provider
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
  "description": "string (optional)",
  "verse": "string (optional)",
  "youTube": "string (optional)",
  "mp3": "string (auto-generated)",
  "songThumbnail": "string (auto-generated)",
  "animatedSongThumbnail": "string (auto-generated)",
  "videoThumbnail": "string (auto-generated)",
  "lyrics": "string (auto-generated)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Album

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "songs": ["ObjectId"] (optional, ordered array),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Note: The `songs` array order is preserved when creating or updating albums. Use the up/down arrows in the admin panel to reorder songs.

## Troubleshooting

### "Error loading songs/albums"

- Check if the API is running
- Verify the API_BASE_URL in your `.env` file
- Check browser console for detailed error messages

### "Admin access required" or 401 errors

- Make sure you're logged in via Auth0
- Check that your user has admin permissions in Auth0
- Verify your `.env` file has correct Auth0 credentials
- Check browser console for detailed error messages

### Auth0 login not working

- Verify your Auth0 domain, client ID, and audience in `.env` file
- Check that `localhost:3000` is allowed in your Auth0 application settings
- See `AUTH0_SETUP.md` for detailed configuration

## Security Notes

- Auth0 handles token management automatically
- Never commit `.env` files to version control
- Auth0 tokens are cached securely by the Auth0 SDK
- Admin operations require valid authentication
- All API calls include the Authorization header automatically
- The session persists across page refreshes

## Support

For API documentation, see `API.md` in the project root.

For issues or questions about the admin panel, please contact the development team.
