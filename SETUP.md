# Setup Guide for Gmail IMAP Viewer

This guide will walk you through setting up the Gmail IMAP Viewer application step by step.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Database Setup

1. **Install and start MySQL**
   ```bash
   # On macOS with Homebrew
   brew install mysql
   brew services start mysql

   # On Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql

   # On Windows
   # Download and install MySQL from the official website
   ```

2. **Create the database**
   ```sql
   mysql -u root -p
   CREATE DATABASE gmail_imap_viewer;
   SHOW DATABASES;
   EXIT;
   ```

## Step 2: Google Cloud Console Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Enter project name: "Gmail IMAP Viewer"
   - Click "Create"

2. **Enable Gmail API**
   - In the project dashboard, go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

3. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Click "Create"
   - Copy the Client ID and Client Secret (you'll need these later)

## Step 3: Project Installation

1. **Clone and install dependencies**
   ```bash
   cd /path/to/your/projects
   # The project is already created, just install dependencies
   cd "Assignment _project"
   npm run install-all
   ```

## Step 4: Environment Configuration

1. **Backend Environment Setup**
   ```bash
   cd backend
   cp env.example .env
   ```

   Edit `backend/.env` with your actual values:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=gmail_imap_viewer
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password

   # Gmail OAuth2 Configuration (from Google Cloud Console)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

   # JWT Configuration (generate a random string)
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Session Configuration (generate a random string)
   SESSION_SECRET=your_super_secret_session_key_here
   ```

2. **Frontend Environment Setup**
   ```bash
   cd ../frontend
   cp env.example .env
   ```

   Edit `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

## Step 5: Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   You should see:
   ```
   Server running on port 3001
   Environment: development
   Health check: http://localhost:3001/health
   Database connection established successfully.
   Database models synchronized successfully.
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   The browser should automatically open to `http://localhost:3000`

3. **Or run both simultaneously**
   ```bash
   # From the root directory
   npm run dev
   ```

## Step 6: First Login

1. **Open the application**
   - Go to `http://localhost:3000`
   - You should see the login page

2. **Authenticate with Google**
   - Click "Continue with Google"
   - Sign in with your Gmail account
   - Grant permissions for the application
   - You'll be redirected back to the application

3. **Sync your emails**
   - Click "Sync Emails" to fetch your Gmail messages
   - Wait for the sync to complete
   - Browse your emails in the interface

## Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
brew services list | grep mysql  # macOS
sudo systemctl status mysql      # Linux

# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### OAuth2 Issues
- Verify the redirect URI in Google Cloud Console matches exactly: `http://localhost:3001/auth/google/callback`
- Ensure Gmail API is enabled in your Google Cloud project
- Check that Client ID and Client Secret are correctly set in `.env`

### Port Conflicts
- Backend runs on port 3001, frontend on port 3000
- If ports are in use, change them in the respective `.env` files

### Permission Issues
- Ensure your Gmail account has IMAP enabled
- Check that the OAuth2 scopes include Gmail read permissions

## Security Notes

- Never commit `.env` files to version control
- Use strong, random strings for JWT_SECRET and SESSION_SECRET
- Keep your Google OAuth2 credentials secure
- In production, use HTTPS and secure database connections

## Next Steps

Once the application is running:

1. **Explore the interface** - Browse your emails, use search, mark as read/unread
2. **Check the database** - Verify emails are being stored in MySQL
3. **Monitor logs** - Check console output for any errors
4. **Customize** - Modify the UI or add new features as needed

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services (MySQL, Node.js) are running
4. Check the network tab in browser dev tools for API errors

For additional help, refer to the main README.md file or create an issue in the project repository.
