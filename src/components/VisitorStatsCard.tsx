import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  Users, 
  RefreshCw, 
  Info, 
  TrendingUp, 
  Calendar,
  Globe,
  MousePointer,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useRealTimeVisitorStats } from '@/hooks/useRealTimeVisitorStats';

interface VisitorStatsCardProps {
  className?: string;
}

export const VisitorStatsCard: React.FC<VisitorStatsCardProps> = ({ className }) => {
  const { visitorStats, isLoading, error, refreshStats } = useRealTimeVisitorStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback
  };

  const getGrowthPercentage = () => {
    const { dailyStats } = visitorStats;
    if (dailyStats.length < 2) return null;
    
    const today = dailyStats[dailyStats.length - 1];
    const yesterday = dailyStats[dailyStats.length - 2];
    
    if (yesterday.uniqueVisitors === 0) return null;
    
    const growth = ((today.uniqueVisitors - yesterday.uniqueVisitors) / yesterday.uniqueVisitors) * 100;
    return growth;
  };

  const growth = getGrowthPercentage();

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">
            Visitor Statistics Error
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unique Visitors Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Unique individuals who visited the website, 
                      counted once per day using browser fingerprinting 
                      and session tracking.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    visitorStats.uniqueVisitors.toLocaleString()
                  )}
                </div>
                {growth !== null && (
                  <div className={`flex items-center text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}% vs yesterday
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Globe className="h-3 w-3 mr-1" />
                Unique
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Page Views Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Total number of pages viewed, including refreshes 
                      and multiple visits from the same user.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    visitorStats.pageViews.toLocaleString()
                  )}
                </div>
                {visitorStats.uniqueVisitors > 0 && (
                  <div className="text-sm text-gray-600">
                    {(visitorStats.pageViews / visitorStats.uniqueVisitors).toFixed(1)} pages per visitor
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <MousePointer className="h-3 w-3 mr-1" />
                Views
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold">Visitor Analytics</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Activity className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Last Visit */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Last Visit</span>
            </div>
            <div className="text-sm text-gray-600">
              {visitorStats.lastVisit ? (
                <span title={format(visitorStats.lastVisit, 'PPpp')}>
                  {format(visitorStats.lastVisit, 'MMM d, h:mm a')}
                </span>
              ) : (
                'No visits yet'
              )}
            </div>
          </div>

          {/* Daily Stats */}
          {visitorStats.dailyStats.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm text-gray-700">Recent Daily Activity</h4>
              <div className="space-y-2">
                {visitorStats.dailyStats.slice(-5).map((stat, index) => (
                  <div key={stat.date} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="text-sm font-medium">
                      {format(new Date(stat.date), 'MMM d')}
                    </div>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1 text-blue-500" />
                        {stat.uniqueVisitors}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1 text-green-500" />
                        {stat.pageViews}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {visitorStats.uniqueVisitors > 0 ? 
                  ((visitorStats.pageViews / visitorStats.uniqueVisitors).toFixed(1)) : '0'
                }
              </div>
              <div className="text-xs text-gray-500">Avg. Pages/Visitor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {visitorStats.dailyStats.length > 0 ? 
                  Math.round(visitorStats.uniqueVisitors / Math.max(visitorStats.dailyStats.length, 1)) : '0'
                }
              </div>
              <div className="text-xs text-gray-500">Daily Avg. Visitors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};