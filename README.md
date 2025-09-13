# MFlix Movie Database

A modern web application for managing a movie database, built with MongoDB, Netlify Functions and vanilla JavaScript.

## Features

- 🔍 **Movie search** with advanced filters
- 📝 **Create new movies** with detailed information
- ✏️ **Edit existing movies**
- 🗑️ **Delete movies**
- 📄 **Pagination** for efficient navigation
- 🏷️ **Filters by year, genre, director and cast**
- 📊 **Sorting** by title, year or IMDB rating
- 💬 **Comment system** for movies

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Netlify Functions (Node.js)
- **Database**: MongoDB Atlas
- **Deploy**: Netlify
- **Dependencies**: MongoDB Driver, dotenv

## Installation and Setup

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB Atlas account
- Netlify account
- Netlify CLI (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/goncaloamorim/mflix-app.git
cd mflix-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB_NAME=sample_mflix
MONGODB_COLLECTION_NAME=movies
MONGODB_COMMENTS_COLLECTION=comments
```

### 4. Local Development

```bash
# Start development server
npm run dev

# Or using Netlify CLI
netlify dev
```

The application will be available at `http://localhost:8888`

## Deploy to Netlify

### 1. Connect to Netlify

- Login to [Netlify](https://netlify.com)
- Connect your GitHub repository
- Configure environment variables in the dashboard

### 2. Required Environment Variables

In the Netlify dashboard, add:

```
MONGODB_URI = your_mongodb_connection_string
MONGODB_DB_NAME = sample_mflix
MONGODB_COLLECTION_NAME = movies
MONGODB_COMMENTS_COLLECTION = comments
```

### 3. Automatic Deploy

Netlify will automatically deploy on every push to the main branch.

## Project Structure

```
mflix-app/
├── functions/              # Netlify Functions (Backend)
│   ├── createMovie.js     # Create movie
│   ├── deleteMovie.js     # Delete movie
│   ├── getMovie.js        # Get specific movie
│   ├── getMovies.js       # List movies with filters
│   └── updateMovie.js     # Update movie
├── public/                # Frontend
│   ├── index.html         # Main page
│   ├── movie.html         # Movie details
│   ├── createMovie.html   # Create form
│   ├── main.js           # Main logic
│   ├── movie.js          # Movie page logic
│   ├── createMovie.js    # Create logic
│   └── styles.css        # CSS styles
├── netlify.toml          # Netlify configuration
├── package.json          # Project dependencies
└── README.md             # This file
```

## API Endpoints

### GET `/api/getMovies`
List movies with filters and pagination

**Parameters:**
- `search` - Search term
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 16)
- `yearMin` - Minimum year
- `yearMax` - Maximum year
- `sortField` - Sort field
- `sortOrder` - Sort order (asc/desc)

### GET `/api/getMovie`
Get specific movie by ID

**Parameters:**
- `id` - Movie ID

### POST `/api/createMovie`
Create new movie

**Body:**
```json
{
  "title": "Movie Title",
  "year": 2024,
  "poster": "Poster URL",
  "genres": ["Action", "Adventure"],
  "plot": "Movie plot",
  "cast": ["Actor 1", "Actor 2"],
  "directors": ["Director 1"],
  "rating": 8.5
}
```

### PUT `/api/updateMovie`
Update existing movie

**Parameters:**
- `id` - Movie ID

### DELETE `/api/deleteMovie`
Delete movie

**Parameters:**
- `id` - Movie ID

## How to Use

1. **Search Movies**: Use the search bar on the main page
2. **Filter**: Click "Filters" to apply advanced filters
3. **View Details**: Click "VIEW DETAILS" on any movie
4. **Add Movie**: Click "Add Movie" in the header
5. **Edit/Delete**: Only movies you created can be edited/deleted


## Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.