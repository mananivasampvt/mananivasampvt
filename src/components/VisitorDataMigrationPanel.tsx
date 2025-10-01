import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  migrateVisitorData, 
  initializeDemoData, 
  cleanupOldVisitorData 
} from '@/utils/visitorDataMigration';
import { RefreshCw, Database, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export const VisitorDataMigrationPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleMigration = async () => {
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Starting migration...' });
    
    try {
      await migrateVisitorData();
      setStatus({ 
        type: 'success', 
        message: 'Migration completed successfully! Old visitor data has been migrated to the new enhanced system.' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoDataInit = async () => {
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Initializing demo data...' });
    
    try {
      await initializeDemoData();
      setStatus({ 
        type: 'success', 
        message: 'Demo data initialized successfully! The past 7 days of visitor data has been created for testing.' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Demo data initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Are you sure you want to clean up old visitor data? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Cleaning up old data...' });
    
    try {
      await cleanupOldVisitorData();
      setStatus({ 
        type: 'success', 
        message: 'Cleanup completed successfully!' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Visitor Data Migration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          <p>This panel helps you migrate from the old visitor tracking system to the new enhanced visitor analytics system.</p>
        </div>

        {status.type && (
          <Alert className={
            status.type === 'success' ? 'border-green-200 bg-green-50' :
            status.type === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }>
            {getStatusIcon()}
            <AlertDescription className="ml-2">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          <Button 
            onClick={handleMigration}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Migrate Existing Visitor Data
          </Button>
          
          <Button 
            onClick={handleDemoDataInit}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            Initialize Demo Data (7 days)
          </Button>
          
          <Button 
            onClick={handleCleanup}
            disabled={isLoading}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            variant="outline"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Up Old Data (Irreversible)
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <strong>Migration Steps:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>First, run "Migrate Existing Visitor Data" to preserve your current visitor count</li>
            <li>Optionally, run "Initialize Demo Data" to create sample analytics data</li>
            <li>Test the new system thoroughly</li>
            <li>Once confirmed working, run "Clean Up Old Data" to remove legacy data</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};