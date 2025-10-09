import React, { useState } from 'react';
import { Email, emailsAPI } from '../services/api';
import { Star, Clock, Paperclip, Trash2, Eye, EyeOff } from 'lucide-react';

interface EmailItemProps {
  email: Email;
  onUpdate: (emailId: number, updates: Partial<Email>) => void;
}

const EmailItem: React.FC<EmailItemProps> = ({ email, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleMarkAsRead = async (isRead: boolean) => {
    try {
      setLoading(true);
      await emailsAPI.markAsRead(email.id.toString(), isRead);
      onUpdate(email.id, { isRead });
    } catch (error) {
      console.error('Failed to update read status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsImportant = async (isImportant: boolean) => {
    try {
      setLoading(true);
      await emailsAPI.markAsImportant(email.id.toString(), isImportant);
      onUpdate(email.id, { isImportant });
    } catch (error) {
      console.error('Failed to update importance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        setLoading(true);
        await emailsAPI.deleteEmail(email.id.toString());
        onUpdate(email.id, { folder: 'TRASH' });
      } catch (error) {
        console.error('Failed to delete email:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${!email.isRead ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {email.from.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className={`text-sm font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {email.from}
              </h3>
              {email.isImportant && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(email.date)}</span>
              </span>
              
              {email.attachments.length > 0 && (
                <Paperclip className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          <div className="mb-2">
            <h4 className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {email.subject || '(No Subject)'}
            </h4>
          </div>

          {isExpanded ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {email.body || email.htmlBody?.replace(/<[^>]*>/g, '') || 'No content'}
              </div>
              
              {email.attachments.length > 0 && (
                <div className="border-t pt-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Attachments:</h5>
                  <div className="space-y-1">
                    {email.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                        <Paperclip className="w-3 h-3" />
                        <span>{attachment.filename}</span>
                        <span className="text-gray-400">({formatSize(attachment.size)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {truncateText(email.body || email.htmlBody?.replace(/<[^>]*>/g, '') || 'No content', 100)}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-3 h-3 inline mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 inline mr-1" />
                  Show More
                </>
              )}
            </button>

            <button
              onClick={() => handleMarkAsRead(!email.isRead)}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
            >
              Mark as {email.isRead ? 'Unread' : 'Read'}
            </button>

            <button
              onClick={() => handleMarkAsImportant(!email.isImportant)}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
            >
              {email.isImportant ? 'Remove Star' : 'Star'}
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailItem;
