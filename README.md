# Gmail IMAP Viewer

A full-stack application that allows users to authenticate with their Gmail account, retrieve and display emails using the IMAP protocol, and store relevant user and email metadata in a MySQL database.

## Features

### Frontend (React.js with Tailwind CSS)
- **Authentication**: OAuth2 integration with Gmail for secure login
- **Email Display**: Responsive UI to display Gmail emails with modern styling
- **Pagination/Search**: Navigate through emails and search specific ones
- **Error Handling**: User-friendly messages for connection issues or invalid credentials
- **Real-time Updates**: Mark emails as read/unread, important, and delete functionality

### Backend (Node.js)
- **IMAP Protocol**: Secure connection to Gmail and email fetching
- **OAuth2 Integration**: Complete Gmail OAuth2 flow for authentication
- **REST API**: Comprehensive API endpoints for email operations
- **Error Handling**: Robust error-handling middleware
- **Security**: Input sanitization, rate limiting, and secure connections

### Database (MySQL)
- **User Data**: Authentication tokens, user preferences, and profile information
- **Email Metadata**: Email IDs, sender details, timestamps, subject lines, and content
- **ORM Integration**: Sequelize for database interactions
- **Indexing**: Optimized indexes for faster search and retrieval

## Project Structure

```
gmail-imap-viewer/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Email.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── emails.js
│   ├── services/
│   │   ├── imapService.js
│   │   └── googleAuthService.js
│   ├── package.json
│   ├── server.js
│   └── env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmailList.tsx
│   │   │   ├── EmailItem.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Google Cloud Console project with Gmail API enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gmail-imap-viewer
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up MySQL database**
   ```sql
   CREATE DATABASE gmail_imap_viewer;
   ```

4. **Configure environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=gmail_imap_viewer
   DB_USER=root
   DB_PASSWORD=your_mysql_password

   # Gmail OAuth2 Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Session Configuration
   SESSION_SECRET=your_session_secret
   ```

   **Frontend** (`frontend/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

5. **Set up Google OAuth2**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth2 credentials
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Copy Client ID and Client Secret to your backend `.env` file

## Running the Application

1. **Start the backend server**
   ```bash
   npm run server
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   npm run client
   ```
   The frontend will run on `http://localhost:3000`

3. **Run both simultaneously**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Emails
- `POST /api/emails/sync` - Sync emails from Gmail
- `GET /api/emails` - Get emails with pagination and search
- `GET /api/emails/:id` - Get specific email
- `PATCH /api/emails/:id/read` - Mark email as read/unread
- `PATCH /api/emails/:id/important` - Mark email as important
- `DELETE /api/emails/:id` - Delete email
- `GET /api/emails/stats/summary` - Get email statistics

## Usage

1. **Login**: Click "Continue with Google" to authenticate with your Gmail account
2. **Sync Emails**: Click "Sync Emails" to fetch your Gmail messages
3. **Browse**: View your emails in the responsive interface
4. **Search**: Use the search bar to find specific emails
5. **Manage**: Mark emails as read/unread, important, or delete them
6. **Navigate**: Use pagination to browse through your email collection

## Security Features

- OAuth2 authentication with Google
- JWT token-based session management
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Secure database connections

## Technologies Used

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- Sequelize ORM
- MySQL database
- IMAP protocol for email access
- Google APIs for OAuth2
- JWT for authentication
- Helmet for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **OAuth2 Authentication Error**
   - Verify Google Cloud Console configuration
   - Check redirect URI matches exactly
   - Ensure Gmail API is enabled

3. **IMAP Connection Error**
   - Verify Gmail account has IMAP enabled
   - Check OAuth2 tokens are valid
   - Ensure proper Gmail API permissions

4. **Frontend Build Error**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

For more help, please check the issues section or create a new issue.
