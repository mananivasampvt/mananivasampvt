import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuthUsers, useFirebaseAuthAnalytics } from '@/hooks/useFirebaseAuthUsers';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  BarChart3,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';

interface FirebaseAuthUserManagementProps {
  className?: string;
}

const FirebaseAuthUserManagement: React.FC<FirebaseAuthUserManagementProps> = ({ className }) => {
  const { authUsers, authStats, loading, error, refreshUsers, syncWithFirestore } = useFirebaseAuthUsers();
  const { getSignupTrendData, getUsersByProvider, getActiveUsersTrend } = useFirebaseAuthAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Filter users based on search and filters
  const filteredUsers = authUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.disabled) ||
      (statusFilter === 'disabled' && user.disabled);

    const matchesVerification = verificationFilter === 'all' ||
      (verificationFilter === 'verified' && user.emailVerified) ||
      (verificationFilter === 'unverified' && !user.emailVerified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleExportData = () => {
    try {
      const csvData = filteredUsers.map(user => ({
        'Firebase UID': user.uid,
        'Email': user.email || '',
        'Display Name': user.displayName || '',
        'Phone': user.phoneNumber || '',
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Account Creation': user.creationTime ? format(new Date(user.creationTime), 'yyyy-MM-dd HH:mm:ss') : '',
        'Last Sign In': user.lastSignInTime ? format(new Date(user.lastSignInTime), 'yyyy-MM-dd HH:mm:ss') : '',
        'Account Status': user.disabled ? 'Disabled' : 'Active',
        'Anonymous': user.isAnonymous ? 'Yes' : 'No',
        'Role': user.role || 'user',
        'Account Age (Days)': user.accountAge,
        'Days Since Last Login': user.daysSinceLastLogin
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firebase-auth-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredUsers.length} Firebase Auth users to CSV`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export user data",
        variant: "destructive",
      });
    }
  };

  const handleSyncData = async () => {
    try {
      await syncWithFirestore();
      toast({
        title: "Sync Completed",
        description: "Firebase Auth data synchronized successfully",
      });
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Firebase Auth data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.disabled) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Disabled</Badge>;
    }
    if (user.daysSinceLastLogin <= 1) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Active</Badge>;
    }
    if (user.daysSinceLastLogin <= 7) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Recent</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Inactive</Badge>;
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? 
      <Badge variant="default" className="bg-blue-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</Badge> :
      <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Unverified</Badge>;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading Firebase Authentication data...</span>
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
              Error loading Firebase Auth data: {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={refreshUsers}
              >
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Firebase Auth Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Firebase Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Directly from Firebase Auth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Signed in within 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.verifiedEmails.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {authStats.totalUsers > 0 ? Math.round((authStats.verifiedEmails / authStats.totalUsers) * 100) : 0}% of total users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{authStats.newUsersToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Growth: +{authStats.growthRate.daily} today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Account Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Accounts:</span>
                  <span className="font-medium">{(authStats.totalUsers - authStats.disabledUsers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Disabled Accounts:</span>
                  <span className="font-medium text-red-600">{authStats.disabledUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">With Firestore Profile:</span>
                  <span className="font-medium">{authStats.usersWithProfiles.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Growth Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">This Week:</span>
                  <span className="font-medium">{authStats.newUsersThisWeek.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month:</span>
                  <span className="font-medium">{authStats.newUsersThisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Growth:</span>
                  <span className={`font-medium ${authStats.growthRate.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {authStats.growthRate.monthly >= 0 ? '+' : ''}{authStats.growthRate.monthly}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">User Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Verified Emails:</span>
                  <span className="font-medium text-green-600">{authStats.verifiedEmails.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Unverified Emails:</span>
                  <span className="font-medium text-orange-600">{authStats.unverifiedEmails.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Account Age:</span>
                  <span className="font-medium">{authStats.averageAccountAge} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Firebase Authentication Users
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Direct integration with Firebase Auth ({filteredUsers.length} of {authStats.totalUsers} users)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSyncData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, or UID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Firebase UID</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback>
                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.displayName || user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.role && (
                                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mr-1">
                                    {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                                    {user.role}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {user.uid.substring(0, 12)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getVerificationBadge(user.emailVerified)}
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.creationTime ? format(new Date(user.creationTime), 'MMM dd, yyyy') : 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.accountAge} days ago
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastSignInTime ? format(new Date(user.lastSignInTime), 'MMM dd, yyyy') : 'Never'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.lastSignInTime ? formatDistanceToNow(new Date(user.lastSignInTime), { addSuffix: true }) : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog open={showUserDetails && selectedUser?.uid === user.uid} onOpenChange={setShowUserDetails}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Firebase Auth User Details</DialogTitle>
                                <DialogDescription>
                                  Complete Firebase Authentication information for {user.displayName || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Firebase UID</label>
                                      <code className="block text-xs bg-muted p-2 rounded mt-1">{selectedUser.uid}</code>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm mt-1">{selectedUser.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Display Name</label>
                                      <p className="text-sm mt-1">{selectedUser.displayName || 'Not set'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Phone Number</label>
                                      <p className="text-sm mt-1">{selectedUser.phoneNumber || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email Verified</label>
                                      <p className="text-sm mt-1">
                                        {getVerificationBadge(selectedUser.emailVerified)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Account Status</label>
                                      <p className="text-sm mt-1">
                                        {getStatusBadge(selectedUser)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Account Created</label>
                                      <p className="text-sm mt-1">
                                        {selectedUser.creationTime ? format(new Date(selectedUser.creationTime), 'PPP pp') : 'Unknown'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Last Sign In</label>
                                      <p className="text-sm mt-1">
                                        {selectedUser.lastSignInTime ? format(new Date(selectedUser.lastSignInTime), 'PPP pp') : 'Never'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {selectedUser.hasFirestoreProfile && (
                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-2">Firestore Profile Data</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Username</label>
                                          <p className="text-sm mt-1">{selectedUser.username || 'Not set'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Role</label>
                                          <p className="text-sm mt-1">
                                            <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                              {selectedUser.role || 'user'}
                                            </Badge>
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Location</label>
                                          <p className="text-sm mt-1">{selectedUser.location || 'Not provided'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Device Info</label>
                                          <p className="text-xs mt-1 bg-muted p-2 rounded max-h-20 overflow-y-auto">
                                            {selectedUser.deviceInfo || 'Not available'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Authentication Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUsersByProvider().map((provider, index) => (
                    <div key={provider.provider} className="flex justify-between items-center">
                      <span className="text-sm">{provider.provider}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(provider.count / authStats.totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{provider.count}</span>
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
                  Account Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Active (Last 24h)</span>
                    <span className="font-medium">
                      {authUsers.filter(u => u.daysSinceLastLogin <= 1).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active (Last 7 days)</span>
                    <span className="font-medium">{authStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inactive (30+ days)</span>
                    <span className="font-medium">
                      {authUsers.filter(u => u.daysSinceLastLogin > 30).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Never signed in</span>
                    <span className="font-medium">
                      {authUsers.filter(u => !u.lastSignInTime || u.lastSignInTime === u.creationTime).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Firebase Auth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{authStats.verifiedEmails}</div>
                  <div className="text-sm text-muted-foreground">Verified Emails</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">{authStats.unverifiedEmails}</div>
                  <div className="text-sm text-muted-foreground">Unverified Emails</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{authStats.usersWithProfiles}</div>
                  <div className="text-sm text-muted-foreground">With Profiles</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">{authStats.averageAccountAge}</div>
                  <div className="text-sm text-muted-foreground">Avg Age (Days)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseAuthUserManagement;