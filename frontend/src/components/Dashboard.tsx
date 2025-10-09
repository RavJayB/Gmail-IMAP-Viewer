import React, { useState, useEffect } from 'react';
import { EmailStats, emailsAPI } from '../services/api';
import { Mail, MailOpen, Star, Clock, TrendingUp } from 'lucide-react';
import EmailList from './EmailList';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await emailsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Emails',
      value: stats?.totalEmails || 0,
      icon: Mail,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Unread',
      value: stats?.unreadEmails || 0,
      icon: MailOpen,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      title: 'Important',
      value: stats?.importantEmails || 0,
      icon: Star,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'This Week',
      value: stats?.recentEmails || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email List */}
      <EmailList />
    </div>
  );
};

export default Dashboard;
