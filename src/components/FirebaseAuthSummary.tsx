import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirebaseAuthUsers } from '@/hooks/useFirebaseAuthUsers';
import { Database, Users, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface FirebaseAuthSummaryProps {
  className?: string;
}

const FirebaseAuthSummary: React.FC<FirebaseAuthSummaryProps> = ({ className }) => {
  const { authUsers, authStats, loading, error } = useFirebaseAuthUsers();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading Firebase Auth data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Firebase Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{authStats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{authStats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{authStats.newUsersToday}</div>
            <div className="text-sm text-muted-foreground">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{authStats.verifiedEmails}</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Firebase Auth Integration: Active</span>
          </div>
          <Badge variant="default" className="bg-green-500">
            Real-time Sync
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          <div>✅ Direct Firebase Authentication integration</div>
          <div>✅ Real-time user count synchronization</div>
          <div>✅ Complete user metadata access</div>
          <div>✅ Advanced analytics and reporting</div>
          <div>✅ GDPR-compliant data management</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseAuthSummary;