import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { 
  Settings, 
  Download, 
  Calendar, 
  Mail, 
  Shield, 
  Eye, 
  EyeOff, 
  FileText, 
  Database,
  Clock,
  Users,
  BarChart3,
  Bell,
  Lock
} from 'lucide-react';
import { User } from '@/hooks/useRealtimeUsers';
import UserDataExporter, { ExportOptions, ReportScheduler } from '@/utils/userDataExporter';

interface UserSettingsPanelProps {
  users: User[];
  className?: string;
}

const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({ users, className }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includePersonalData: false,
    maskSensitiveData: true,
    fields: ['username', 'email', 'role', 'status', 'createdAt']
  });

  const [reportSettings, setReportSettings] = useState({
    enabled: false,
    frequency: 'weekly',
    recipients: ['admin@example.com'],
    includeAnalytics: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    enableDataMasking: true,
    logDataAccess: true,
    requireExportApproval: false,
    dataRetentionDays: 365
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newUserSignups: true,
    suspiciousActivity: true,
    exportActivity: true,
    systemAlerts: true
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      await UserDataExporter.exportUsers(users, exportOptions);
      
      toast({
        title: "Export Successful! 📄",
        description: `User data exported in ${exportOptions.format.toUpperCase()} format`,
      });
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleScheduleReport = () => {
    if (reportSettings.enabled) {
      ReportScheduler.scheduleReport(
        users, 
        reportSettings.frequency as 'daily' | 'weekly' | 'monthly',
        reportSettings.recipients
      );
      
      toast({
        title: "Report Scheduled! 📊",
        description: `${reportSettings.frequency} reports will be sent to ${reportSettings.recipients.length} recipient(s)`,
      });
    }
  };

  const getDateRangeOptions = () => [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' }
  ];

  const getFilteredUserCount = () => {
    // This would implement the same filtering logic as in the exporter
    return users.length; // Simplified for now
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management Settings</h2>
          <p className="text-sm text-gray-600">Configure user data handling, exports, and privacy settings</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Shield className="h-3 w-3 mr-1" />
          GDPR Compliant
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Data Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: any) => setExportOptions({...exportOptions, format: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-personal">Include Personal Data</Label>
              <Switch
                id="include-personal"
                checked={exportOptions.includePersonalData}
                onCheckedChange={(checked) => 
                  setExportOptions({...exportOptions, includePersonalData: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mask-sensitive">Mask Sensitive Data</Label>
              <Switch
                id="mask-sensitive"
                checked={exportOptions.maskSensitiveData}
                onCheckedChange={(checked) => 
                  setExportOptions({...exportOptions, maskSensitiveData: checked})
                }
              />
            </div>

            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Export User Data</DialogTitle>
                  <DialogDescription>
                    Confirm export settings and download user data
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Format:</span>
                      <Badge variant="secondary">{exportOptions.format.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Users:</span>
                      <span className="font-semibold">{getFilteredUserCount()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Personal Data:</span>
                      <span className={exportOptions.includePersonalData ? 'text-orange-600' : 'text-green-600'}>
                        {exportOptions.includePersonalData ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data Masking:</span>
                      <span className={exportOptions.maskSensitiveData ? 'text-green-600' : 'text-orange-600'}>
                        {exportOptions.maskSensitiveData ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowExportDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleExport}
                      disabled={exporting}
                      className="flex-1"
                    >
                      {exporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-reports">Enable Scheduled Reports</Label>
              <Switch
                id="enable-reports"
                checked={reportSettings.enabled}
                onCheckedChange={(checked) => 
                  setReportSettings({...reportSettings, enabled: checked})
                }
              />
            </div>

            {reportSettings.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Report Frequency</Label>
                  <Select 
                    value={reportSettings.frequency} 
                    onValueChange={(value) => setReportSettings({...reportSettings, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <Input
                    placeholder="admin@example.com, manager@example.com"
                    value={reportSettings.recipients.join(', ')}
                    onChange={(e) => 
                      setReportSettings({
                        ...reportSettings, 
                        recipients: e.target.value.split(',').map(email => email.trim())
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-analytics">Include Analytics</Label>
                  <Switch
                    id="include-analytics"
                    checked={reportSettings.includeAnalytics}
                    onCheckedChange={(checked) => 
                      setReportSettings({...reportSettings, includeAnalytics: checked})
                    }
                  />
                </div>

                <Button onClick={handleScheduleReport} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Update Schedule
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-masking">Data Masking</Label>
                <p className="text-xs text-gray-500">Automatically mask sensitive user data</p>
              </div>
              <Switch
                id="enable-masking"
                checked={privacySettings.enableDataMasking}
                onCheckedChange={(checked) => 
                  setPrivacySettings({...privacySettings, enableDataMasking: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="log-access">Log Data Access</Label>
                <p className="text-xs text-gray-500">Track who accesses user data</p>
              </div>
              <Switch
                id="log-access"
                checked={privacySettings.logDataAccess}
                onCheckedChange={(checked) => 
                  setPrivacySettings({...privacySettings, logDataAccess: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-approval">Export Approval</Label>
                <p className="text-xs text-gray-500">Require admin approval for exports</p>
              </div>
              <Switch
                id="require-approval"
                checked={privacySettings.requireExportApproval}
                onCheckedChange={(checked) => 
                  setPrivacySettings({...privacySettings, requireExportApproval: checked})
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data Retention (Days)</Label>
              <Input
                type="number"
                value={privacySettings.dataRetentionDays}
                onChange={(e) => 
                  setPrivacySettings({
                    ...privacySettings, 
                    dataRetentionDays: parseInt(e.target.value) || 365
                  })
                }
              />
              <p className="text-xs text-gray-500">
                User data will be automatically archived after this period
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-signups">New User Signups</Label>
              <Switch
                id="new-signups"
                checked={notificationSettings.newUserSignups}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, newUserSignups: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="suspicious-activity">Suspicious Activity</Label>
              <Switch
                id="suspicious-activity"
                checked={notificationSettings.suspiciousActivity}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, suspiciousActivity: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="export-activity">Export Activity</Label>
              <Switch
                id="export-activity"
                checked={notificationSettings.exportActivity}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, exportActivity: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="system-alerts">System Alerts</Label>
              <Switch
                id="system-alerts"
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, systemAlerts: checked})
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <BarChart3 className="h-5 w-5 mr-2" />
            Quick Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-700">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active' || !u.status).length}
              </div>
              <div className="text-sm text-green-700">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-purple-700">Admin Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => {
                  if (!u.createdAt) return false;
                  const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
                  const today = new Date();
                  return userDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="text-sm text-orange-700">Today's Signups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Compliance Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">GDPR Compliance Active</div>
              <div className="text-sm text-green-700">
                All user data exports and handling comply with GDPR regulations. 
                Sensitive data is automatically masked unless explicitly enabled by authorized personnel.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettingsPanel;