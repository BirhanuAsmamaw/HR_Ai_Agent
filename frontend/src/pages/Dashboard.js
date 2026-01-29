import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    pendingReviews: 0,
    shortlisted: 0,
    thisWeekJobs: 0,
    thisWeekApplicants: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs and applicants
      const [jobsResponse, applicantsResponse] = await Promise.all([
        api.get('/jobs'),
        api.get('/applicants')
      ]);

      const jobs = jobsResponse.data.data || [];
      const applicants = applicantsResponse.data.data || [];

      // Calculate stats
      const pendingReviews = applicants.filter(app => !app.ai_score).length;
      const shortlisted = applicants.filter(app => app.ai_verdict === 'shortlist').length;
      
      // Calculate this week's data
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const thisWeekJobs = jobs.filter(job => new Date(job.created_at) > oneWeekAgo).length;
      const thisWeekApplicants = applicants.filter(app => new Date(app.applied_at) > oneWeekAgo).length;

      setStats({
        totalJobs: jobs.length,
        totalApplicants: applicants.length,
        pendingReviews,
        shortlisted,
        thisWeekJobs,
        thisWeekApplicants
      });

      // Set recent data (last 5)
      setRecentJobs(jobs.slice(0, 5));
      setRecentApplicants(applicants.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description, trend, trendValue }) => (
    <Card className="card-hover">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 flex-shrink-0`}>
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-xl sm:text-2xl font-bold">{value}</p>
            </div>
          </div>
          {/* {trend && (
            <div className="text-right flex-shrink-0 ml-2 hidden lg:block">
              <div className={`flex items-center justify-end text-xs sm:text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <ArrowTrendingUpIcon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0 ${
                  trend === 'down' ? 'rotate-180' : ''
                }`} />
                <span className="whitespace-nowrap">{trendValue}</span>
              </div>
              
            </div>
          )} */}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 bg-muted rounded-lg"></div>
            <div className="h-80 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your HR operations.
            </p>
          </div>
          
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={BriefcaseIcon}
          color="text-blue-600"
          description="Active job listings"
          trend={stats.thisWeekJobs > 0 ? 'up' : 'neutral'}
          trendValue={`+${stats.thisWeekJobs} this week`}
        />
        <StatCard
          title="Total Applicants"
          value={stats.totalApplicants}
          icon={UserGroupIcon}
          color="text-green-600"
          description="All applications received"
          trend={stats.thisWeekApplicants > 0 ? 'up' : 'neutral'}
          trendValue={`+${stats.thisWeekApplicants} this week`}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={ClockIcon}
          color="text-yellow-600"
          description="Awaiting AI analysis"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={CheckCircleIcon}
          color="text-purple-600"
          description="Candidates to interview"
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={itemVariants}
      >
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Jobs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest job postings</CardDescription>
              </div>
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link to="/create-job" className="flex items-center justify-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Job
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job, index) => (
                  <motion.div 
                    key={job.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">{job.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {job.department && <span className="truncate">{job.department} • </span>}
                        <span>Created {formatRelativeTime(job.created_at)}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                      <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                        <Link to={`/jobs`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <BriefcaseIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">No jobs created yet.</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link to="/create-job">Create your first job</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Applicants</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest applications received</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                <Link to="/applicants">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentApplicants.length > 0 ? (
                recentApplicants.map((applicant, index) => (
                  <motion.div 
                    key={applicant.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">{applicant.name || 'Unknown Applicant'}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{applicant.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied {formatRelativeTime(applicant.applied_at || applicant.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-1">
                      {applicant.ai_verdict && (
                        <Badge 
                          variant={applicant.ai_verdict === 'shortlist' ? 'success' : 
                                  applicant.ai_verdict === 'reject' ? 'destructive' : 'warning'}
                          className="text-xs"
                        >
                          {applicant.ai_verdict}
                        </Badge>
                      )}
                      {applicant.ai_score && (
                        <p className="text-xs text-muted-foreground">
                          Score: {applicant.ai_score}/100
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">No applications received yet.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Applications will appear here once candidates apply to your jobs.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
