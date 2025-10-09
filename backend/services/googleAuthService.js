const { google } = require('googleapis');
const { User } = require('../models');

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  async getUserInfo(tokens) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  async findOrCreateUser(userInfo, tokens) {
    try {
      let user = await User.findOne({ where: { googleId: userInfo.id } });

      if (!user) {
        user = await User.create({
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(tokens.expiry_date)
        });
      } else {
        // Update tokens
        await user.update({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(tokens.expiry_date),
          lastLogin: new Date()
        });
      }

      return user;
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw error;
    }
  }

  async refreshAccessToken(user) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: user.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update user with new tokens
      await user.update({
        accessToken: credentials.access_token,
        tokenExpiry: new Date(credentials.expiry_date)
      });

      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  isTokenExpired(user) {
    if (!user.tokenExpiry) return true;
    return new Date() >= new Date(user.tokenExpiry);
  }
}

module.exports = GoogleAuthService;
