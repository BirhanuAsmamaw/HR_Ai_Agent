import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime, truncateText } from '../lib/utils';
import api, { jobsAPI } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    requirements: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || (job.status || 'active') === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedDepartment, selectedStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await jobsAPI.delete(jobToDelete);
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setJobToDelete(null);
  };

  const handleEdit = async (jobId) => {
    try {
      setEditLoading(true);
      const response = await jobsAPI.getById(jobId);
      const jobData = response.data.data;
      setEditFormData({
        title: jobData.title || '',
        description: jobData.description || '',
        requirements: jobData.requirements || ''
      });
      setEditingJob(jobId);
    } catch (error) {
      console.error('Error fetching job data:', error);
      alert('Error loading job data. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      alert('Job title is required');
      return;
    }

    try {
      setEditLoading(true);
      const response = await jobsAPI.update(editingJob, editFormData);
      const updatedJob = response.data.data;
      
      // Update the job in the list
      setJobs(jobs.map(job => job.id === editingJob ? { ...job, ...updatedJob } : job));
      setEditingJob(null);
      setEditFormData({ title: '', description: '', requirements: '' });
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingJob(null);
    setEditFormData({ title: '', description: '', requirements: '' });
  };

  const departments = [...new Set(jobs.map(job => job.department).filter(Boolean))];
  const statuses = ['active', 'inactive', 'draft'];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
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
            <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your job postings and track applications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearchExpanded(!searchExpanded)}
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
            
            {/* Filter Toggle */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {(selectedDepartment !== 'all' || selectedStatus !== 'all') && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
            
            <Button asChild size="lg">
              <Link to="/create-job" className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Job
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Expandable Search */}
      <AnimatePresence>
        {searchExpanded && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by title, department, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-lg py-3"
                    autoFocus
                  />
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Jobs</CardTitle>
                <CardDescription>
                  Narrow down your search with these filters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="input w-full"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="input w-full"
                    >
                      <option value="all">All Status</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Filter Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredJobs.length} of {jobs.length} jobs
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedDepartment('all');
                        setSelectedStatus('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs Grid */}
      <motion.div variants={itemVariants}>
        <AnimatePresence>
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            {job.department && (
                              <span className="flex items-center gap-1">
                                <BuildingOfficeIcon className="h-4 w-4" />
                                {job.department}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                {job.location}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={job.status === 'active' ? 'success' : 
                                  job.status === 'inactive' ? 'secondary' : 'warning'}
                        >
                          {job.status || 'active'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {truncateText(job.description, 120)}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-3 w-3" />
                          Created {formatRelativeTime(job.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {job.applicant_count || 0} applicant{(job.applicant_count || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedJob(job)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(job.id)}
                          disabled={editLoading}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(job.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all' 
                    ? 'No jobs found' 
                    : 'No jobs created yet'
                  }
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your search terms or filters.'
                    : 'Get started by creating your first job listing.'
                  }
                </p>
                {(!searchTerm && selectedDepartment === 'all' && selectedStatus === 'all') && (
                  <Button asChild>
                    <Link to="/create-job">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Job
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleEditCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Edit Job</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditCancel}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    id="edit-title"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="edit-description"
                    rows={6}
                    required
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="input min-h-[150px] resize-y"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-requirements" className="block text-sm font-medium mb-2">
                    Requirements
                  </label>
                  <textarea
                    id="edit-requirements"
                    rows={4}
                    value={editFormData.requirements}
                    onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                    className="input min-h-[100px] resize-y"
                    placeholder="List the required skills, experience, and qualifications..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditCancel}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!editFormData.title.trim() || !editFormData.description.trim() || editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {selectedJob.department && (
                    <span className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      {selectedJob.department}
                    </span>
                  )}
                  {selectedJob.location && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {selectedJob.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    {selectedJob.applicant_count || 0} applicant{(selectedJob.applicant_count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedJob(null)}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Description */}
                {selectedJob.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.description}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.requirements}
                    </div>
                  </div>
                )}

                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatRelativeTime(selectedJob.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge 
                      variant={selectedJob.status === 'active' ? 'success' : 
                              selectedJob.status === 'inactive' ? 'secondary' : 'warning'}
                    >
                      {selectedJob.status || 'active'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleCancelDelete}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">Confirm Delete Job</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Jobs;
