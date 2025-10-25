import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';

interface TestUser {
  uid: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: any;
}

const FirebaseConnectionTest: React.FC = () => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [adding, setAdding] = useState(false);

  // Test Firebase connection
  useEffect(() => {
    console.log('🔗 Testing Firebase connection...');
    console.log('📁 Firebase Config:', {
      projectId: 'real-estate-ee44e',
      databaseURL: 'Firebase Firestore',
      collection: 'users'
    });

    const usersRef = collection(db, 'users');
    
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        console.log('✅ Firebase connection successful!');
        console.log('📊 Users collection size:', snapshot.size);
        
        const usersData: TestUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            uid: doc.id,
            username: data.username || data.displayName || 'Unknown',
            email: data.email || 'No email',
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt
          });
        });
        
        setUsers(usersData);
        setLoading(false);
        setError(null);
        setIsConnected(true);
        
        console.log('📋 Users loaded:', usersData.length);
      },
      (error) => {
        console.error('❌ Firebase connection failed:', error);
        setError(`Connection failed: ${error.message}`);
        setLoading(false);
        setIsConnected(false);
      }
    );

    return unsubscribe;
  }, []);

  const addTestUser = async () => {
    if (!testEmail || !testName) return;
    
    setAdding(true);
    try {
      const usersRef = collection(db, 'users');
      await addDoc(usersRef, {
        username: testName,
        email: testEmail,
        role: 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        isTestUser: true
      });
      
      setTestEmail('');
      setTestName('');
      console.log('✅ Test user added successfully');
    } catch (error) {
      console.error('❌ Failed to add test user:', error);
      setError(`Failed to add user: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Firebase Connection Test
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Testing Firebase connection...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              <strong>Connection Error:</strong> {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <strong>Firebase Status</strong>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Connected Successfully</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Users className="h-4 w-4" />
                    <strong>Users Found</strong>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{users.length} users in collection</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Connection Details:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Firebase Project: real-estate-ee44e</li>
                  <li>✅ Database: Firestore</li>
                  <li>✅ Collection: users</li>
                  <li>✅ Real-time Listener: Active</li>
                  <li>✅ Data Access: Successful</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test User Addition */}
      {isConnected && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Test Real-Time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add a test user to verify real-time updates are working:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Test user name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
                <Input
                  placeholder="test@example.com"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={addTestUser}
                disabled={!testEmail || !testName || adding}
                className="w-full"
              >
                {adding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding Test User...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test User
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Preview */}
      {isConnected && users.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              Live Users Preview ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.slice(0, 10).map((user) => (
                <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {users.length - 10} more users
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseConnectionTest;