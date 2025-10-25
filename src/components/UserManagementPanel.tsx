import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldOff,
  Clock,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Edit
} from 'lucide-react';

interface User {
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
  deviceInfo?: string;
}

interface UserManagementPanelProps {
  className?: string;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ className }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPrivacyMode, setShowPrivacyMode] = useState(true);
  const { toast } = useToast();

  // Real-time user data subscription
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            uid: doc.id,
            username: data.username || 'Unknown User',
            email: data.email || '',
            phone: data.phone,
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
            profileImage: data.profileImage,
            location: data.location,
            deviceInfo: data.deviceInfo
          });
        });
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all' && user.createdAt) {
        const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = userDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = userDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = userDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }, [users, searchTerm, roleFilter, statusFilter, dateFilter]);

  // User statistics
  const userStats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      admins: users.filter(u => u.role === 'admin').length,
      newToday: users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return userDate.toDateString() === today;
      }).length,
      newThisWeek: users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return userDate >= weekAgo;
      }).length,
      newThisMonth: users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return userDate >= monthAgo;
      }).length,
    };
  }, [users]);

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        promotedAt: newRole === 'admin' ? new Date() : null,
        promotedBy: newRole === 'admin' ? 'admin-panel' : null
      });
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const exportUserData = () => {
    const csvData = filteredUsers.map(user => ({
      'Full Name': user.username,
      'Email': showPrivacyMode ? maskEmail(user.email) : user.email,
      'Phone': showPrivacyMode ? maskPhone(user.phone) : user.phone || 'N/A',
      'Role': user.role,
      'Status': user.status,
      'Signup Date': user.createdAt ? format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Last Login': user.lastLogin ? format(user.lastLogin.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin), 'yyyy-MM-dd HH:mm:ss') : 'Never'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "User data exported successfully",
    });
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}***@${domain}`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return `***${phone.slice(-4)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">Manage registered users and track signups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacyMode(!showPrivacyMode)}
          >
            {showPrivacyMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPrivacyMode ? 'Show Full Data' : 'Privacy Mode'}
          </Button>
          <Button onClick={exportUserData} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-3xl font-bold text-green-900">{userStats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">New Today</p>
                <p className="text-3xl font-bold text-purple-900">{userStats.newToday}</p>
                <p className="text-xs text-purple-500">This week: {userStats.newThisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Admins</p>
                <p className="text-3xl font-bold text-orange-900">{userStats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Real-time
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={user.profileImage} 
                            alt={user.username}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">ID: {user.uid.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {showPrivacyMode ? maskEmail(user.email) : user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {showPrivacyMode ? maskPhone(user.phone) : user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {user.createdAt ? format(
                          user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 
                          'MMM d, yyyy'
                        ) : 'Unknown'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {user.lastLogin ? format(
                          user.lastLogin.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin), 
                          'MMM d, HH:mm'
                        ) : 'Never'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.uid, user.role === 'admin' ? 'user' : 'admin')}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleUserStatusChange(user.uid, 'suspended')}
                              className="text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUserStatusChange(user.uid, 'active')}
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={selectedUser.profileImage} 
                    alt={selectedUser.username}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.username}</h3>
                  <p className="text-gray-600">{showPrivacyMode ? maskEmail(selectedUser.email) : selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusBadge(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{showPrivacyMode ? maskEmail(selectedUser.email) : selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{showPrivacyMode ? maskPhone(selectedUser.phone) : selectedUser.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <span className="ml-2 font-mono">{selectedUser.uid}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Signup Date:</span>
                      <span className="ml-2">
                        {selectedUser.createdAt ? format(
                          selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate() : new Date(selectedUser.createdAt), 
                          'PPP'
                        ) : 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2">
                        {selectedUser.lastLogin ? format(
                          selectedUser.lastLogin.toDate ? selectedUser.lastLogin.toDate() : new Date(selectedUser.lastLogin), 
                          'PPP'
                        ) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleRoleChange(selectedUser.uid, selectedUser.role === 'admin' ? 'user' : 'admin')}
                >
                  {selectedUser.role === 'admin' ? (
                    <>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </>
                  )}
                </Button>
                
                {selectedUser.status === 'active' ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleUserStatusChange(selectedUser.uid, 'suspended');
                      setShowUserDetails(false);
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleUserStatusChange(selectedUser.uid, 'active');
                      setShowUserDetails(false);
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPanel;