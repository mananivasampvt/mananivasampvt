import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebaseAuthUsers, useFirebaseAuthAnalytics } from '@/hooks/useFirebaseAuthUsers';
import { format } from 'date-fns';
import { 
  Users, 
  Database, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Mail,
  Clock,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';

interface FirebaseAuthDashboardProps {
  className?: string;
}

const FirebaseAuthDashboard: React.FC<FirebaseAuthDashboardProps> = ({ className }) => {
  const { authUsers, authStats, loading, error, refreshUsers } = useFirebaseAuthUsers();
  const { getSignupTrendData, getUsersByProvider } = useFirebaseAuthAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  const signupTrends = getSignupTrendData(7); // Last 7 days
  const providerStats = getUsersByProvider();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading Firebase Authentication Dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading Firebase Auth dashboard: {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={refreshUsers}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6" />
          Firebase Authentication Dashboard
        </h2>
        <p className="text-muted-foreground">
          Real-time Firebase Authentication data and user management analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Primary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{authStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Firebase Authentication</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{authStats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {authStats.totalUsers > 0 ? Math.round((authStats.activeUsers / authStats.totalUsers) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{authStats.newUsersToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Signed up today</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{authStats.verifiedEmails.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {authStats.totalUsers > 0 ? Math.round((authStats.verifiedEmails / authStats.totalUsers) * 100) : 0}% verified emails
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Registered</span>
                  <Badge variant="default" className="bg-blue-500">
                    {authStats.totalUsers.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active (7 days)</span>
                  <Badge variant="default" className="bg-green-500">
                    {authStats.activeUsers.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Profiles</span>
                  <Badge variant="secondary">
                    {authStats.usersWithProfiles.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disabled</span>
                  <Badge variant="destructive">
                    {authStats.disabledUsers.toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verified Emails</span>
                  <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {authStats.verifiedEmails.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unverified Emails</span>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {authStats.unverifiedEmails.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verification Rate</span>
                  <Badge variant="outline">
                    {authStats.totalUsers > 0 ? Math.round((authStats.verifiedEmails / authStats.totalUsers) * 100) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Week</span>
                  <Badge variant="default" className="bg-blue-500">
                    +{authStats.newUsersThisWeek.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <Badge variant="default" className="bg-purple-500">
                    +{authStats.newUsersThisMonth.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Growth</span>
                  <Badge variant={authStats.growthRate.monthly >= 0 ? "default" : "destructive"} 
                         className={authStats.growthRate.monthly >= 0 ? "bg-green-500" : ""}>
                    {authStats.growthRate.monthly >= 0 ? '+' : ''}{authStats.growthRate.monthly}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Account Age</span>
                  <Badge variant="outline">
                    {authStats.averageAccountAge} days
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authUsers.slice(0, 5).map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${user.daysSinceLastLogin <= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="font-medium">{user.displayName || user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role === 'admin' && <Shield className="inline w-3 h-3 mr-1" />}
                          UID: {user.uid.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {user.creationTime ? format(new Date(user.creationTime), 'MMM dd') : 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.emailVerified ? (
                          <CheckCircle className="inline w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="inline w-3 h-3 text-red-500 mr-1" />
                        )}
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Authentication Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerStats.map((provider, index) => (
                    <div key={provider.provider} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{provider.provider}</span>
                        <span className="text-sm text-muted-foreground">
                          {provider.count} users ({Math.round((provider.count / authStats.totalUsers) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(provider.count / authStats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  User Activity Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Active (Last 24h)', count: authUsers.filter(u => u.daysSinceLastLogin <= 1).length, color: 'bg-green-500' },
                    { label: 'Recent (2-7 days)', count: authUsers.filter(u => u.daysSinceLastLogin > 1 && u.daysSinceLastLogin <= 7).length, color: 'bg-blue-500' },
                    { label: 'Dormant (8-30 days)', count: authUsers.filter(u => u.daysSinceLastLogin > 7 && u.daysSinceLastLogin <= 30).length, color: 'bg-orange-500' },
                    { label: 'Inactive (30+ days)', count: authUsers.filter(u => u.daysSinceLastLogin > 30).length, color: 'bg-red-500' }
                  ].map((activity, index) => (
                    <div key={activity.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{activity.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {activity.count} users ({Math.round((activity.count / authStats.totalUsers) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`${activity.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${(activity.count / authStats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{authStats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{authStats.verifiedEmails}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{authStats.unverifiedEmails}</div>
                <div className="text-sm text-muted-foreground">Unverified</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{authStats.usersWithProfiles}</div>
                <div className="text-sm text-muted-foreground">With Profiles</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                7-Day Signup Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signupTrends.map((trend, index) => (
                  <div key={trend.date} className="flex items-center space-x-4">
                    <div className="w-20 text-sm">{format(new Date(trend.date), 'MMM dd')}</div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max((trend.count / Math.max(...signupTrends.map(t => t.count), 1)) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-right font-medium">{trend.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{authStats.newUsersToday}</div>
                <p className="text-sm text-muted-foreground">New signups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{authStats.newUsersThisWeek}</div>
                <p className="text-sm text-muted-foreground">New signups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{authStats.newUsersThisMonth}</div>
                <p className="text-sm text-muted-foreground">New signups</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">Email Verification Rate</span>
                  <Badge variant={authStats.verifiedEmails / authStats.totalUsers > 0.8 ? "default" : "destructive"} className="bg-green-500">
                    {Math.round((authStats.verifiedEmails / authStats.totalUsers) * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">Disabled Accounts</span>
                  <Badge variant={authStats.disabledUsers === 0 ? "default" : "destructive"}>
                    {authStats.disabledUsers}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="text-sm">Anonymous Users</span>
                  <Badge variant="outline">
                    {authStats.anonymousUsers}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {authStats.unverifiedEmails > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {authStats.unverifiedEmails} users have unverified email addresses
                      </AlertDescription>
                    </Alert>
                  )}
                  {authStats.disabledUsers > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {authStats.disabledUsers} accounts are currently disabled
                      </AlertDescription>
                    </Alert>
                  )}
                  {authStats.unverifiedEmails === 0 && authStats.disabledUsers === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        All security checks passed ✓
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={refreshUsers}>
                  <RefreshCw className="w-6 h-6 mb-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" className="h-20 flex-col" disabled>
                  <Mail className="w-6 h-6 mb-2" />
                  Send Verification
                </Button>
                <Button variant="outline" className="h-20 flex-col" disabled>
                  <Database className="w-6 h-6 mb-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseAuthDashboard;