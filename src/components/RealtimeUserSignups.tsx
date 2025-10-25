import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  UserPlus, 
  Bell, 
  BellOff, 
  Users, 
  Eye, 
  Activity,
  Clock,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RealtimeUser {
  uid: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: any;
  isNew?: boolean;
}

interface RealtimeUserSignupsProps {
  className?: string;
  onUserClick?: (user: RealtimeUser) => void;
}

const RealtimeUserSignups: React.FC<RealtimeUserSignupsProps> = ({ 
  className, 
  onUserClick 
}) => {
  const [recentUsers, setRecentUsers] = useState<RealtimeUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todaySignups, setTodaySignups] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const { toast } = useToast();

  // Real-time listener for recent user signups
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const recentUsersQuery = query(
      usersRef, 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );

    const unsubscribe = onSnapshot(
      recentUsersQuery,
      (snapshot) => {
        const users: RealtimeUser[] = [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let todayCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const user: RealtimeUser = {
            uid: doc.id,
            username: data.username || 'Unknown User',
            email: data.email || '',
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt
          };

          // Check if user signed up today
          if (data.createdAt) {
            const userDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            if (userDate >= todayStart) {
              todayCount++;
            }

            // Mark as new if signed up after last check and notifications are enabled
            if (notifications && userDate > lastCheckTime) {
              user.isNew = true;
              
              // Show toast notification for new signup
              toast({
                title: "New User Signup! 🎉",
                description: `${user.username} just joined the platform`,
                duration: 5000,
              });
            }
          }

          users.push(user);
        });

        setRecentUsers(users);
        setTodaySignups(todayCount);
        setTotalUsers(snapshot.size);
        setLoading(false);
        
        // Update last check time
        setLastCheckTime(new Date());
      },
      (error) => {
        console.error('Error fetching recent users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch recent user signups",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [notifications, lastCheckTime, toast]);

  // Get total user count with separate listener
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const allUsersQuery = query(usersRef);

    const unsubscribe = onSnapshot(
      allUsersQuery,
      (snapshot) => {
        setTotalUsers(snapshot.size);
      },
      (error) => {
        console.error('Error fetching total users:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: notifications ? "Notifications Disabled" : "Notifications Enabled",
      description: notifications 
        ? "You won't receive new signup notifications" 
        : "You'll receive notifications for new signups",
    });
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'inactive':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 rounded">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Live User Activity</h3>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{totalUsers} total users</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserPlus className="h-4 w-4" />
                    <span>{todaySignups} signups today</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNotifications}
              className={notifications ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50'}
            >
              {notifications ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications On
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Notifications Off
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Recent Signups
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.uid}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md cursor-pointer ${
                    user.isNew 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => onUserClick?.(user)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage alt={user.username} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.isNew && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        {user.isNew && (
                          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                            New!
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(user.status)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 border-purple-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-32">{user.email}</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {getTimeAgo(user.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent signups</h3>
                <p className="text-gray-500">New user registrations will appear here in real-time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>Updates automatically • Last refresh: {format(lastCheckTime, 'HH:mm:ss')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeUserSignups;