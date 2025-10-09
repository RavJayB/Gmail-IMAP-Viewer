const Imap = require('imap');
const { simpleParser } = require('mailparser');

class ImapService {
  constructor(user) {
    this.user = user;
    this.imap = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: this.user.email,
        password: this.user.accessToken, // For OAuth2, this would be the access token
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000,
        connTimeout: 30000,
        keepalive: {
          interval: 10000,
          idleInterval: 300000,
          forceNoop: true
        }
      });

      this.imap.once('ready', () => {
        console.log('IMAP connection established');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP connection ended');
      });

      this.imap.connect();
    });
  }

  async openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
        } else {
          resolve(box);
        }
      });
    });
  }

  async searchEmails(criteria = ['ALL'], limit = 50) {
    return new Promise((resolve, reject) => {
      this.imap.search(criteria, (err, results) => {
        if (err) {
          reject(err);
        } else {
          // Get the most recent emails
          const uids = results.slice(-limit);
          resolve(uids);
        }
      });
    });
  }

  async fetchEmails(uids) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(uids, {
        bodies: '',
        struct: true
      });

      const emails = [];

      fetch.on('message', (msg, seqno) => {
        let buffer = '';

        msg.on('body', (stream, info) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', () => {
            simpleParser(buffer, (err, parsed) => {
              if (err) {
                console.error('Error parsing email:', err);
                return;
              }

              const email = {
                messageId: parsed.messageId,
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                subject: parsed.subject || '',
                date: parsed.date,
                size: buffer.length,
                body: parsed.text || '',
                htmlBody: parsed.html || '',
                attachments: parsed.attachments?.map(att => ({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size
                })) || [],
                flags: parsed.flags || []
              };

              emails.push(email);
            });
          });
        });

        msg.once('attributes', (attrs) => {
          // Store UID for later reference
          emails[emails.length - 1] = {
            ...emails[emails.length - 1],
            uid: attrs.uid
          };
        });

        msg.once('end', () => {
          // Message processing complete
        });
      });

      fetch.once('error', (err) => {
        reject(err);
      });

      fetch.once('end', () => {
        resolve(emails);
      });
    });
  }

  async disconnect() {
    if (this.imap) {
      this.imap.end();
    }
  }

  async getEmails(limit = 50) {
    try {
      await this.connect();
      await this.openInbox();
      
      const uids = await this.searchEmails(['ALL'], limit);
      const emails = await this.fetchEmails(uids);
      
      await this.disconnect();
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }
}

module.exports = ImapService;
