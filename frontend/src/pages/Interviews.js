import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { interviewsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const Interviews = () => {
  const [availability, setAvailability] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [sendingEmailToAll, setSendingEmailToAll] = useState(false);
  const [showEditAvailability, setShowEditAvailability] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 2,
    start_time: '08:00',
    end_time: '12:00'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availabilityRes, interviewsRes] = await Promise.all([
        interviewsAPI.getAvailability().catch(() => ({ data: { data: [] } })),
        interviewsAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      
      setAvailability(availabilityRes.data.data || []);
      // Handle both array and object responses from Supabase
      const interviewsData = interviewsRes.data.data || [];
      const normalizedInterviews = interviewsData.map(interview => ({
        ...interview,
        applicants: Array.isArray(interview.applicants) ? interview.applicants[0] : interview.applicants
      }));
      setInterviews(normalizedInterviews);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load interviews data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = () => {
    if (!formData.start_time || !formData.end_time) {
      toast.error('Please fill in both start and end times');
      return;
    }
    
    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    setAvailability([...availability, { ...formData }]);
    setFormData({
      day_of_week: 2,
      start_time: '08:00',
      end_time: '12:00'
    });
  };

  const handleRemoveTimeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSaveAvailability = async () => {
    if (availability.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    try {
      setSavingAvailability(true);
      await interviewsAPI.setAvailability(availability);
      toast.success('Availability saved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error.response?.data?.error || 'Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleSendEmail = async (interviewId) => {
    try {
      setSendingEmail(interviewId);
      await interviewsAPI.sendEmails([interviewId]);
      toast.success('Interview email sent successfully!');
      fetchData();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.error || 'Failed to send email');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSendEmailToAll = async () => {
    if (interviews.length === 0) {
      toast.error('No interviews to send emails to');
      return;
    }

    try {
      setSendingEmailToAll(true);
      await interviewsAPI.sendEmails();
      toast.success('Interview emails sent to all applicants!');
      fetchData();
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error(error.response?.data?.error || 'Failed to send emails');
    } finally {
      setSendingEmailToAll(false);
    }
  };

  const formatInterviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatInterviewTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayName = (dayOfWeek) => {
    return DAYS.find(d => d.value === dayOfWeek)?.label || 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show availability form if no availability exists
  if (availability.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Set Your Availability</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Set your available days and time ranges for interviews
          </p>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Add Time Slots</CardTitle>
            <CardDescription>
              Define when you're available for interviews. You can add multiple time slots.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium mb-2 block">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {DAYS.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-1">
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              
              <div className="sm:col-span-1">
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              
              <div className="sm:col-span-1 flex items-end">
                <Button onClick={handleAddTimeSlot} className="w-full">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </div>
            </div>

            {availability.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Availability:</h3>
                <div className="space-y-2">
                  {availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{getDayName(slot.day_of_week)}</Badge>
                        <span className="text-sm">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTimeSlot(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availability.length > 0 && (
              <Button
                onClick={handleSaveAvailability}
                loading={savingAvailability}
                className="w-full sm:w-auto"
                size="lg"
              >
                Save Availability
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show interviews if availability exists
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your scheduled interviews
          </p>
        </div>
        
        <div className="flex gap-2">
          {interviews.length > 0 && (
            <Button
              onClick={handleSendEmailToAll}
              loading={sendingEmailToAll}
              className="w-full sm:w-auto"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Send Emails to All</span>
              <span className="sm:hidden">Send All</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setShowEditAvailability(!showEditAvailability);
              if (!showEditAvailability) {
                // Load current availability into form
                fetchData();
              }
            }}
            className="w-full sm:w-auto"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Edit Availability</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      {/* Edit Availability Section */}
      <AnimatePresence>
        {showEditAvailability && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Edit Availability</CardTitle>
                <CardDescription>
                  Update your available days and time ranges for interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium mb-2 block">Day of Week</label>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {DAYS.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium mb-2 block">End Time</label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                  
                  <div className="sm:col-span-1 flex items-end">
                    <Button onClick={handleAddTimeSlot} className="w-full">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Availability:</h3>
                  <div className="space-y-2">
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">{getDayName(slot.day_of_week)}</Badge>
                          <span className="text-sm">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTimeSlot(index)}
                        >
                          <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    await handleSaveAvailability();
                    setShowEditAvailability(false);
                  }}
                  loading={savingAvailability}
                  className="w-full sm:w-auto"
                >
                  Save Availability
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDaysIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Interviews Scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Interviews will appear here once they are scheduled.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {interviews.map((interview, index) => {
            const applicant = interview.applicants;
            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl mb-1">
                          {applicant?.name || 'Unknown Applicant'}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">
                          {applicant?.email || 'No email'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CalendarDaysIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium">{formatInterviewDate(interview.scheduled_at)}</p>
                          <p className="text-muted-foreground">{formatInterviewTime(interview.scheduled_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-muted-foreground">Office Location</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(interview.id)}
                        loading={sendingEmail === interview.id}
                        className="flex-1"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Send Email</span>
                        <span className="sm:hidden">Email</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Availability Summary Card */}
      {!showEditAvailability && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Your Availability</CardTitle>
            <CardDescription>Current time slots for interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availability.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{getDayName(slot.day_of_week)}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Interviews;

