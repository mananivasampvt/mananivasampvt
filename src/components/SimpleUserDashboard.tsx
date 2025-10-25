import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Clock, 
  Mail, 
  Phone,
  RefreshCw,
  Activity,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface FirestoreUser {
  uid: string;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: any;
  lastLogin?: any;
  profileImage?: string;
  location?: string;
  emailVerified?: boolean;
}

interface SimpleUserDashboardProps {
  className?: string;
}

const SimpleUserDashboard: React.FC<SimpleUserDashboardProps> = ({ className }) => {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time user data subscription
  useEffect(() => {
    console.log('🔗 Setting up real-time user subscription...');
    
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        console.log('📊 Real-time update received:', snapshot.size, 'users');
        
        const usersData: FirestoreUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            uid: doc.id,
            username: data.username || data.displayName || 'Unknown User',
            email: data.email || '',
            phone: data.phone,
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
            profileImage: data.profileImage,
            location: data.location,
            emailVerified: data.emailVerified
          });
        });
        
        setUsers(usersData);
        setLoading(false);
        setError(null);
        setLastUpdated(new Date());
        
        console.log('✅ User data updated successfully:', usersData.length, 'users loaded');
      },
      (error) => {
        console.error('❌ Error fetching real-time user data:', error);
        setError('Failed to fetch user data: ' + error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 Cleaning up real-time user subscription');
      unsubscribe();
    };
  }, []);

  // Calculate real-time statistics
  const userStats = React.useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const recentUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      const daysDiff = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      recent: recentUsers,
      suspended: users.filter(user => user.status === 'suspended').length,
      verified: users.filter(user => user.emailVerified !== false).length
    };
  }, [users]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Never';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium text-blue-700">Loading user data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="text-red-600 font-medium">Error Loading User Data</div>
              <div className="text-sm text-red-500">{error}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Live Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Real-Time User Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Live data from Firestore • Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Real-Time Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">{userStats.total}</div>
            <p className="text-xs text-blue-600">From Firestore</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">{userStats.active}</div>
            <p className="text-xs text-green-600">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">{userStats.admins}</div>
            <p className="text-xs text-purple-600">Admin users</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              New This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">{userStats.recent}</div>
            <p className="text-xs text-orange-600">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time User List */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              All Users ({users.length})
            </span>
            <Badge variant="secondary" className="text-xs">
              Real-time Updates
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No users found</p>
                <p className="text-sm text-gray-400">Users will appear here when they sign up</p>
              </div>
            ) : (
              users.map((user) => (
                <div 
                  key={user.uid} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {user.username}
                        </h3>
                        {user.role === 'admin' && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.emailVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Last seen: {getTimeAgo(user.lastLogin)}</span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer with Real-time Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-blue-600">
                <Activity className="h-4 w-4" />
                <strong>Real-time Updates:</strong> ON
              </span>
              <span className="text-gray-600">
                Data refreshes automatically when users sign up, login, or update profiles
              </span>
            </div>
            <div className="text-gray-500">
              Firebase Project: real-estate-ee44e
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUserDashboard;