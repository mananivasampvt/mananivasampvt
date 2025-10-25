import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths, parseISO } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  Activity, 
  BarChart3, 
  PieChart, 
  Calendar,
  RefreshCw,
  Download,
  Globe,
  Smartphone,
  Monitor,
  MapPin
} from 'lucide-react';

interface UserAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  totalUsers: number;
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  usersByRole: {
    users: number;
    admins: number;
  };
  usersByStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
  signupTrend: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats: {
    country: string;
    count: number;
  }[];
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsProps> = ({ className }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Real-time analytics data subscription
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        processAnalyticsData(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      },
      (error) => {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dateRange, toast]);

  const processAnalyticsData = (users: any[]) => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));
    const weekAgo = startOfDay(subDays(now, 7));
    const lastWeek = startOfDay(subDays(now, 14));
    const monthAgo = startOfDay(subDays(now, 30));
    const lastMonth = startOfDay(subDays(now, 60));

    // Filter users by date range
    let filteredUsers = users;
    let rangeStart = weekAgo; // default 7 days

    switch (dateRange) {
      case '30days':
        rangeStart = monthAgo;
        break;
      case '90days':
        rangeStart = startOfDay(subDays(now, 90));
        break;
      case '1year':
        rangeStart = startOfDay(subDays(now, 365));
        break;
    }

    filteredUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= rangeStart;
    });

    // Calculate basic metrics
    const totalUsers = users.length;
    
    const newUsersToday = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= today;
    }).length;

    const newUsersThisWeek = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= weekAgo;
    }).length;

    const newUsersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= monthAgo;
    }).length;

    const newUsersYesterday = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= yesterday && userDate < today;
    }).length;

    const newUsersLastWeek = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= lastWeek && userDate < weekAgo;
    }).length;

    const newUsersLastMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= lastMonth && userDate < monthAgo;
    }).length;

    // Calculate growth rates
    const dailyGrowth = newUsersYesterday === 0 ? 100 : ((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100;
    const weeklyGrowth = newUsersLastWeek === 0 ? 100 : ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100;
    const monthlyGrowth = newUsersLastMonth === 0 ? 100 : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

    // User breakdown by role and status
    const usersByRole = {
      users: users.filter(u => u.role === 'user' || !u.role).length,
      admins: users.filter(u => u.role === 'admin').length
    };

    const usersByStatus = {
      active: users.filter(u => u.status === 'active' || !u.status).length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length
    };

    // Generate signup trend data
    const days = parseInt(dateRange.replace('days', '')) || 7;
    const signupTrend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(now, i));
      const nextDate = startOfDay(subDays(now, i - 1));
      
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return userDate >= date && userDate < nextDate;
      }).length;

      signupTrend.push({
        date: format(date, 'MMM dd'),
        count
      });
    }

    // Device breakdown (mock data for now - in real implementation, you'd track this during signup)
    const deviceBreakdown = {
      desktop: Math.floor(totalUsers * 0.6),
      mobile: Math.floor(totalUsers * 0.35),
      tablet: Math.floor(totalUsers * 0.05)
    };

    // Location stats (mock data - in real implementation, you'd collect this during signup)
    const locationStats = [
      { country: 'India', count: Math.floor(totalUsers * 0.45) },
      { country: 'United States', count: Math.floor(totalUsers * 0.20) },
      { country: 'United Kingdom', count: Math.floor(totalUsers * 0.15) },
      { country: 'Canada', count: Math.floor(totalUsers * 0.10) },
      { country: 'Australia', count: Math.floor(totalUsers * 0.10) }
    ];

    setAnalyticsData({
      totalUsers,
      newUsers: {
        today: newUsersToday,
        thisWeek: newUsersThisWeek,
        thisMonth: newUsersThisMonth
      },
      growthRate: {
        daily: dailyGrowth,
        weekly: weeklyGrowth,
        monthly: monthlyGrowth
      },
      usersByRole,
      usersByStatus,
      signupTrend,
      deviceBreakdown,
      locationStats
    });
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Success",
        description: "Analytics data refreshed",
      });
    }, 1000);
  };

  const exportAnalyticsData = () => {
    if (!analyticsData) return;

    const data = {
      summary: {
        totalUsers: analyticsData.totalUsers,
        newUsersToday: analyticsData.newUsers.today,
        newUsersThisWeek: analyticsData.newUsers.thisWeek,
        newUsersThisMonth: analyticsData.newUsers.thisMonth,
        dailyGrowthRate: `${analyticsData.growthRate.daily.toFixed(2)}%`,
        weeklyGrowthRate: `${analyticsData.growthRate.weekly.toFixed(2)}%`,
        monthlyGrowthRate: `${analyticsData.growthRate.monthly.toFixed(2)}%`
      },
      breakdown: {
        usersByRole: analyticsData.usersByRole,
        usersByStatus: analyticsData.usersByStatus,
        deviceBreakdown: analyticsData.deviceBreakdown
      },
      signupTrend: analyticsData.signupTrend,
      locationStats: analyticsData.locationStats
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Analytics data exported successfully",
    });
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Analytics</h2>
          <p className="text-sm text-gray-600">Real-time user signup tracking and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportAnalyticsData} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">New Today</p>
                <p className="text-3xl font-bold text-green-900">+{analyticsData.newUsers.today}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.growthRate.daily >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.growthRate.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.growthRate.daily > 0 ? '+' : ''}{analyticsData.growthRate.daily.toFixed(1)}%
                  </span>
                </div>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Week</p>
                <p className="text-3xl font-bold text-purple-900">+{analyticsData.newUsers.thisWeek}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.growthRate.weekly >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.growthRate.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.growthRate.weekly > 0 ? '+' : ''}{analyticsData.growthRate.weekly.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">This Month</p>
                <p className="text-3xl font-bold text-orange-900">+{analyticsData.newUsers.thisMonth}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.growthRate.monthly >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.growthRate.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.growthRate.monthly > 0 ? '+' : ''}{analyticsData.growthRate.monthly.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signup Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Signup Trend
              <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.signupTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.date}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ 
                        width: `${Math.max(8, (item.count / Math.max(...analyticsData.signupTrend.map(d => d.count))) * 100)}px` 
                      }}
                    />
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Breakdown Pie Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">By Role</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.usersByRole.users}</span>
                    <span className="text-xs text-gray-500">
                      ({((analyticsData.usersByRole.users / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Admins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.usersByRole.admins}</span>
                    <span className="text-xs text-gray-500">
                      ({((analyticsData.usersByRole.admins / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">By Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.usersByStatus.active}</span>
                    <span className="text-xs text-gray-500">
                      ({((analyticsData.usersByStatus.active / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Inactive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.usersByStatus.inactive}</span>
                    <span className="text-xs text-gray-500">
                      ({((analyticsData.usersByStatus.inactive / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Suspended</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.usersByStatus.suspended}</span>
                    <span className="text-xs text-gray-500">
                      ({((analyticsData.usersByStatus.suspended / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ 
                      width: `${(analyticsData.deviceBreakdown.desktop / analyticsData.totalUsers) * 100}px` 
                    }}
                  />
                  <span className="text-sm font-medium">{analyticsData.deviceBreakdown.desktop}</span>
                  <span className="text-xs text-gray-500">
                    ({((analyticsData.deviceBreakdown.desktop / analyticsData.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mobile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 bg-green-500 rounded-full"
                    style={{ 
                      width: `${(analyticsData.deviceBreakdown.mobile / analyticsData.totalUsers) * 100}px` 
                    }}
                  />
                  <span className="text-sm font-medium">{analyticsData.deviceBreakdown.mobile}</span>
                  <span className="text-xs text-gray-500">
                    ({((analyticsData.deviceBreakdown.mobile / analyticsData.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Tablet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ 
                      width: `${Math.max(8, (analyticsData.deviceBreakdown.tablet / analyticsData.totalUsers) * 100)}px` 
                    }}
                  />
                  <span className="text-sm font-medium">{analyticsData.deviceBreakdown.tablet}</span>
                  <span className="text-xs text-gray-500">
                    ({((analyticsData.deviceBreakdown.tablet / analyticsData.totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Top User Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.locationStats.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{location.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{ 
                        width: `${(location.count / analyticsData.totalUsers) * 100}px` 
                      }}
                    />
                    <span className="text-sm font-medium">{location.count}</span>
                    <span className="text-xs text-gray-500">
                      ({((location.count / analyticsData.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;