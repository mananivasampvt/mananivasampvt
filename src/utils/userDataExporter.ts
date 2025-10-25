import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface User {
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
  signupSource?: string;
  referrer?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includePersonalData: boolean;
  maskSensitiveData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userRoles?: ('user' | 'admin')[];
  userStatuses?: ('active' | 'inactive' | 'suspended')[];
  fields?: string[];
}

export class UserDataExporter {
  private static maskEmail(email: string): string {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}***@${domain}`;
  }

  private static maskPhone(phone?: string): string {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return `***${phone.slice(-4)}`;
  }

  private static filterUsers(users: User[], options: ExportOptions): User[] {
    let filteredUsers = [...users];

    // Filter by date range
    if (options.dateRange) {
      filteredUsers = filteredUsers.filter(user => {
        if (!user.createdAt) return false;
        const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return userDate >= options.dateRange!.start && userDate <= options.dateRange!.end;
      });
    }

    // Filter by roles
    if (options.userRoles && options.userRoles.length > 0) {
      filteredUsers = filteredUsers.filter(user => 
        options.userRoles!.includes(user.role)
      );
    }

    // Filter by statuses
    if (options.userStatuses && options.userStatuses.length > 0) {
      filteredUsers = filteredUsers.filter(user => 
        options.userStatuses!.includes(user.status)
      );
    }

    return filteredUsers;
  }

  private static processUserData(users: User[], options: ExportOptions): any[] {
    const filteredUsers = this.filterUsers(users, options);

    return filteredUsers.map(user => {
      const processedUser: any = {};

      // Basic fields (always included)
      processedUser['Full Name'] = user.username;
      processedUser['Role'] = user.role;
      processedUser['Status'] = user.status;
      processedUser['Signup Date'] = user.createdAt ? 
        format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : 
        'N/A';

      // Personal data (conditionally included)
      if (options.includePersonalData) {
        processedUser['Email'] = options.maskSensitiveData ? 
          this.maskEmail(user.email) : user.email;
        
        if (user.phone) {
          processedUser['Phone'] = options.maskSensitiveData ? 
            this.maskPhone(user.phone) : user.phone;
        }

        processedUser['User ID'] = options.maskSensitiveData ? 
          `***${user.uid.slice(-8)}` : user.uid;
      }

      // Additional fields
      processedUser['Last Login'] = user.lastLogin ? 
        format(user.lastLogin.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin), 'yyyy-MM-dd HH:mm:ss') : 
        'Never';

      if (user.location) {
        processedUser['Location'] = user.location;
      }

      if (user.signupSource) {
        processedUser['Signup Source'] = user.signupSource;
      }

      if (user.referrer && !options.maskSensitiveData) {
        processedUser['Referrer'] = user.referrer;
      }

      return processedUser;
    });
  }

  static async exportToCSV(users: User[], options: ExportOptions): Promise<string> {
    const processedData = this.processUserData(users, options);
    
    if (processedData.length === 0) {
      throw new Error('No users match the specified criteria');
    }

    const headers = Object.keys(processedData[0]);
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          return value.toString().includes(',') ? `"${value.toString().replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return csvContent;
  }

  static async exportToJSON(users: User[], options: ExportOptions): Promise<object> {
    const processedData = this.processUserData(users, options);
    
    const exportData = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        totalUsers: processedData.length,
        exportOptions: {
          format: options.format,
          includePersonalData: options.includePersonalData,
          maskSensitiveData: options.maskSensitiveData,
          gdprCompliant: options.maskSensitiveData || !options.includePersonalData
        },
        filters: {
          dateRange: options.dateRange,
          userRoles: options.userRoles,
          userStatuses: options.userStatuses
        }
      },
      users: processedData
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return exportData;
  }

  static async exportToPDF(users: User[], options: ExportOptions): Promise<void> {
    const processedData = this.processUserData(users, options);
    
    if (processedData.length === 0) {
      throw new Error('No users match the specified criteria');
    }

    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text('User Export Report', 20, 20);
    
    // Metadata
    pdf.setFontSize(12);
    pdf.text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, 35);
    pdf.text(`Total Users: ${processedData.length}`, 20, 45);
    pdf.text(`GDPR Compliant: ${options.maskSensitiveData || !options.includePersonalData ? 'Yes' : 'No'}`, 20, 55);

    // Table headers and data
    const headers = Object.keys(processedData[0]);
    const tableData = processedData.map(user => headers.map(header => user[header] || ''));

    // Add table using autoTable plugin
    (pdf as any).autoTable({
      startY: 70,
      head: [headers],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 70 }
    });

    // Save the PDF
    pdf.save(`users-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
  }

  static async exportUsers(users: User[], options: ExportOptions): Promise<any> {
    switch (options.format) {
      case 'csv':
        return await this.exportToCSV(users, options);
      case 'json':
        return await this.exportToJSON(users, options);
      case 'pdf':
        await this.exportToPDF(users, options);
        return null;
      case 'excel':
        // For Excel export, we'll use CSV format as a fallback
        // In a real implementation, you'd use a library like xlsx
        return await this.exportToCSV(users, { ...options, format: 'csv' });
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Generate scheduled report data
  static generateScheduledReport(users: User[], reportType: 'daily' | 'weekly' | 'monthly'): object {
    const now = new Date();
    let startDate: Date;
    let reportTitle: string;

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        reportTitle = 'Daily User Signup Report';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        reportTitle = 'Weekly User Signup Report';
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        reportTitle = 'Monthly User Signup Report';
        break;
    }

    const filteredUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= startDate;
    });

    const report = {
      title: reportTitle,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        reportType
      },
      summary: {
        totalNewUsers: filteredUsers.length,
        activeUsers: filteredUsers.filter(u => u.status === 'active' || !u.status).length,
        adminUsers: filteredUsers.filter(u => u.role === 'admin').length,
        suspendedUsers: filteredUsers.filter(u => u.status === 'suspended').length
      },
      breakdown: {
        byRole: {
          users: filteredUsers.filter(u => u.role === 'user' || !u.role).length,
          admins: filteredUsers.filter(u => u.role === 'admin').length
        },
        byStatus: {
          active: filteredUsers.filter(u => u.status === 'active' || !u.status).length,
          inactive: filteredUsers.filter(u => u.status === 'inactive').length,
          suspended: filteredUsers.filter(u => u.status === 'suspended').length
        }
      },
      users: filteredUsers.map(user => ({
        username: user.username,
        email: this.maskEmail(user.email), // Always mask in reports
        role: user.role,
        status: user.status,
        signupDate: user.createdAt ? 
          format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : 
          'N/A'
      }))
    };

    return report;
  }
}

// Email integration for scheduled reports (mock implementation)
export class ReportScheduler {
  static async sendScheduledReport(
    reportData: object, 
    recipients: string[], 
    reportType: 'daily' | 'weekly' | 'monthly'
  ): Promise<boolean> {
    // In a real implementation, this would integrate with an email service
    // like SendGrid, AWS SES, or EmailJS
    console.log('Scheduled report would be sent to:', recipients);
    console.log('Report data:', reportData);
    
    // Mock success
    return true;
  }

  static scheduleReport(
    users: User[], 
    reportType: 'daily' | 'weekly' | 'monthly', 
    recipients: string[]
  ): void {
    // In a real implementation, this would set up a cron job or use a task scheduler
    const reportData = UserDataExporter.generateScheduledReport(users, reportType);
    
    // For demo purposes, we'll just log the report
    console.log(`${reportType} report scheduled for:`, recipients);
    console.log('Report preview:', reportData);
  }
}

export default UserDataExporter;