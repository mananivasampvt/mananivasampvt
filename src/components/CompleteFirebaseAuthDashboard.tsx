import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Database,
  Clock,
  Mail,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useCompleteFirebaseAuth } from '@/hooks/useCompleteFirebaseAuth';
import type { CompleteFirebaseUser } from '@/hooks/useCompleteFirebaseAuth';

export const CompleteFirebaseAuthDashboard: React.FC = () => {
  const { 
    users, 
    authStats, 
    loading, 
    error, 
    refreshUsers, 
    syncMissingProfiles, 
    detectMissingUsers 
  } = useCompleteFirebaseAuth();

  const [syncing, setSyncing] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const handleSyncMissingProfiles = async () => {
    setSyncing(true);
    try {
      await syncMissingProfiles();
    } finally {
      setSyncing(false);
    }
  };

  const handleDetectMissingUsers = async () => {
    setDetecting(true);
    try {
      await detectMissingUsers();
    } finally {
      setDetecting(false);
    }
  };

  const getSyncStatusIcon = () => {
    switch (authStats.syncStatus) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSyncStatusColor = () => {
    switch (authStats.syncStatus) {
      case 'synced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading Firebase Authentication data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Firebase Authentication Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Complete user management with Firebase Auth & Firestore sync
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDetectMissingUsers}
            disabled={detecting}
          >
            {detecting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Detect Missing
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSyncMissingProfiles}
            disabled={syncing}
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Sync Profiles
          </Button>
          <Button onClick={refreshUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sync Status Alert */}
      {authStats.missingProfiles > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sync Issue Detected:</strong> {authStats.missingProfiles} users exist in Firebase Authentication 
            but don't have Firestore profiles. This explains why the admin dashboard shows fewer users than Firebase Console.
            <Button 
              variant="link" 
              className="p-0 ml-2 h-auto" 
              onClick={handleSyncMissingProfiles}
              disabled={syncing}
            >
              Fix Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firebase Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{authStats.totalFirebaseUsers}</div>
            <p className="text-xs text-muted-foreground">
              In Firebase Console
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firestore Profiles</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{authStats.usersWithProfiles}</div>
            <p className="text-xs text-muted-foreground">
              Complete profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Profiles</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{authStats.missingProfiles}</div>
            <p className="text-xs text-muted-foreground">
              Need sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{authStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSyncStatusIcon()}
            Synchronization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Sync Status</span>
              <Badge className={getSyncStatusColor()}>
                {authStats.syncStatus.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span>{Math.round((authStats.usersWithProfiles / authStats.totalFirebaseUsers) * 100)}%</span>
              </div>
              <Progress 
                value={(authStats.usersWithProfiles / authStats.totalFirebaseUsers) * 100} 
                className="h-2"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Last sync: {authStats.lastSyncTime.toLocaleString()}
            </div>

            {authStats.missingProfiles > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {authStats.missingProfiles} users need Firestore profiles to appear in the admin dashboard.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="users">User List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-green-500" />
                      Verified
                    </span>
                    <span className="font-semibold">{authStats.verifiedEmails}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-red-500" />
                      Unverified
                    </span>
                    <span className="font-semibold">{authStats.unverifiedEmails}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      Active
                    </span>
                    <span className="font-semibold">{authStats.usersWithProfiles - authStats.disabledUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <UserX className="h-4 w-4 text-red-500" />
                      Disabled
                    </span>
                    <span className="font-semibold">{authStats.disabledUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Account Age</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.averageAccountAge} days</div>
                <p className="text-xs text-muted-foreground">Average age</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.newUsersToday}</div>
                <p className="text-xs text-muted-foreground">New registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.newUsersThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  {authStats.growthRate.weekly > 0 ? '+' : ''}{authStats.growthRate.weekly}% vs last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {authStats.growthRate.monthly > 0 ? '+' : ''}{authStats.growthRate.monthly}% vs last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verification Rate</span>
                    <span>{Math.round((authStats.verifiedEmails / authStats.totalFirebaseUsers) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(authStats.verifiedEmails / authStats.totalFirebaseUsers) * 100} 
                    className="h-2"
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{authStats.verifiedEmails}</div>
                    <div className="text-sm text-muted-foreground">Verified Emails</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{authStats.unverifiedEmails}</div>
                    <div className="text-sm text-muted-foreground">Unverified Emails</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {users.length} users with Firestore profiles
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 10).map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.displayName || user.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {user.emailVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role || 'user'}
                      </Badge>
                      
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {user.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {users.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All {users.length} Users
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};