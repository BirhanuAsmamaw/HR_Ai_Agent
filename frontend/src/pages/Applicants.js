import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';
import { applicantsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState(null);
  const [sendingEmailToAll, setSendingEmailToAll] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [emailToSend, setEmailToSend] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicantsAPI.getAll();
      setApplicants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAI = async (applicantId) => {
    try {
      setProcessingAI(applicantId);
      await applicantsAPI.runAI(applicantId);
      toast.success('AI analysis completed!');
      fetchApplicants(); // Refresh to get updated data
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast.error('Failed to run AI analysis');
    } finally {
      setProcessingAI(null);
    }
  };

  const handleSendEmailToAll = async () => {
    try {
      setSendingEmailToAll(true);
      const response = await applicantsAPI.sendEmailToAll();
      const { processed, failed } = response.data.data;
      
      if (processed > 0) {
        toast.success(`Emails sent to ${processed} applicant(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      } else {
        toast.info('No applicants found that need emails sent');
      }
      
      fetchApplicants(); 
    } catch (error) {
      console.error('Error sending emails to all applicants:', error);
      toast.error(error.response?.data?.error || 'Failed to send emails to all applicants');
    } finally {
      setSendingEmailToAll(false);
    }
  };

  const handleSendEmailClick = (applicantId) => {
    setEmailToSend(applicantId);
    setShowEmailConfirm(true);
  };

  const handleConfirmSendEmail = async () => {
    if (!emailToSend) return;

    try {
      setSendingEmail(emailToSend);
      setShowEmailConfirm(false);
      const response = await applicantsAPI.sendEmail(emailToSend);
      toast.success(response.data.message || 'Email sent successfully!');
      fetchApplicants(); 
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.error || 'Failed to send email');
    } finally {
      setSendingEmail(null);
      setEmailToSend(null);
    }
  };

  const handleCancelSendEmail = () => {
    setShowEmailConfirm(false);
    setEmailToSend(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Applicants</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Review and manage job applications with AI-powered insights.
          </p>
        </div>
        {applicants.length > 0 && (
          <Button
            onClick={handleSendEmailToAll}
            disabled={sendingEmailToAll}
            loading={sendingEmailToAll}
            variant="default"
            className="w-full sm:w-auto"
            size="sm"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{sendingEmailToAll ? 'Sending...' : 'Send Email to All'}</span>
            <span className="sm:hidden">{sendingEmailToAll ? 'Sending...' : 'Send to All'}</span>
          </Button>
        )}
      </div>

      {applicants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No applicants yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here when candidates apply to your jobs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant, index) => (
            <motion.div
              key={applicant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                            {(applicant.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold truncate">
                              {applicant.name || 'Unknown Applicant'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                              <EnvelopeIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{applicant.email || 'No email provided'}</span>
                            </div>
                          </div>
                        </div>
                        {applicant.ai_verdict && (
                          <Badge 
                            variant={applicant.ai_verdict === 'shortlist' ? 'success' : 
                                    applicant.ai_verdict === 'reject' ? 'destructive' : 'secondary'}
                            className="self-start sm:self-center sm:ml-auto"
                          >
                            {applicant.ai_verdict}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        {applicant.job_listings && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <span className="text-muted-foreground">Position:</span>
                            <span className="font-medium truncate">{applicant.job_listings.title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Applied:</span>
                          <span>{formatRelativeTime(applicant.applied_at || applicant.created_at)}</span>
                        </div>
                      </div>

                      {/* AI Analysis Results */}
                      {applicant.ai_score && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                          <Badge 
                            variant={applicant.ai_score >= 80 ? 'success' : 
                                    applicant.ai_score >= 60 ? 'warning' : 'destructive'}
                            className="text-xs"
                          >
                            Score: {applicant.ai_score}/100
                          </Badge>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            AI Analysis Complete
                          </div>
                        </div>
                      )}

                      {/* AI Matches */}
                      {(() => {
                        // Ensure ai_matches is an array
                        let matches = applicant.ai_matches;
                        if (!matches) return null;
                        
                        // If it's a string, try to parse it
                        if (typeof matches === 'string') {
                          try {
                            matches = JSON.parse(matches);
                          } catch (e) {
                            // If parsing fails, treat as single item array
                            matches = [matches];
                          }
                        }
                        
                        // Ensure it's an array
                        if (!Array.isArray(matches) || matches.length === 0) {
                          return null;
                        }
                        
                        return (
                          <div>
                            <div className="text-sm font-medium mb-2">Key Matches:</div>
                            <div className="flex flex-wrap gap-2">
                              {matches.slice(0, 3).map((match, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {typeof match === 'string' ? match : JSON.stringify(match)}
                                </Badge>
                              ))}
                              {matches.length > 3 && (
                                <span className="text-xs text-muted-foreground self-center">
                                  +{matches.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 mt-4 sm:mt-0">
                      {!applicant.ai_score ? (
                        <Button
                          onClick={() => handleRunAI(applicant.id)}
                          loading={processingAI === applicant.id}
                          disabled={processingAI === applicant.id}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <SparklesIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">{processingAI === applicant.id ? 'Processing...' : 'Run AI Analysis'}</span>
                          <span className="sm:hidden">{processingAI === applicant.id ? 'Processing...' : 'Run AI'}</span>
                        </Button>
                      ) : (
                        <Badge variant="success" className="text-xs w-full sm:w-auto justify-center sm:justify-start">
                          ✓ AI Analyzed
                        </Badge>
                      )}
                      
                      {applicant.ai_generated_email && applicant.email && (
                        <Button
                          onClick={() => handleSendEmailClick(applicant.id)}
                          loading={sendingEmail === applicant.id}
                          disabled={sendingEmail === applicant.id}
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">{sendingEmail === applicant.id ? 'Sending...' : 'Send Email'}</span>
                          <span className="sm:hidden">{sendingEmail === applicant.id ? 'Sending...' : 'Send'}</span>
                        </Button>
                      )}
                      
                      {applicant.body && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplicant(applicant)}
                          title="View Application Email"
                          className="w-full sm:w-auto"
                        >
                          <DocumentTextIcon className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Email Body Modal */}
      {selectedApplicant && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedApplicant(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Application Email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  From: {selectedApplicant.name} ({selectedApplicant.email})
                </p>
                {selectedApplicant.subject && (
                  <p className="text-sm font-medium mt-1 text-foreground">Subject: {selectedApplicant.subject}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApplicant(null)}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none dark:prose-invert">
                {(() => {
                  // Parse MIME email body and extract readable content
                  const parseEmailBody = (body) => {
                    if (!body) return (
                      <div className="text-foreground">No email body available</div>
                    );
                    
                    // If body is an object (JSONB), convert to string first
                    let bodyStr = typeof body === 'object' ? JSON.stringify(body) : String(body);
                    
                    // Check if it's a MIME multipart message (handle both - and -- boundaries)
                    if (bodyStr.includes('Content-Type:') && (bodyStr.includes('--') || bodyStr.match(/^-?[0-9a-f]+/i))) {
                      // Function to decode quoted-printable
                      const decodeQuotedPrintable = (text) => {
                        if (!text) return '';
                        return text
                          .replace(/=\r?\n/g, '') // Remove soft line breaks
                          .replace(/=([0-9A-F]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode hex
                          .replace(/=3D/g, '=') // Decode =3D to =
                          .replace(/=E2=80=99/g, "'") // Decode smart quotes
                          .replace(/=20/g, ' ') // Decode spaces
                          .trim();
                      };
                      
                      let htmlContent = null;
                      let textContent = null;
                      
                      // Try to extract HTML content - handle both - and -- boundaries
                      const htmlPattern = /Content-Type:\s*text\/html[^\n]*\nContent-Transfer-Encoding:\s*quoted-printable\s*\n\n([\s\S]*?)(?=\n-{1,2}[0-9a-f]+|$)/i;
                      const htmlSection = bodyStr.match(htmlPattern);
                      if (htmlSection && htmlSection[1]) {
                        htmlContent = decodeQuotedPrintable(htmlSection[1]);
                      }
                      
                      // Try to extract plain text content - handle both - and -- boundaries
                      const textPattern = /Content-Type:\s*text\/plain[^\n]*\nContent-Transfer-Encoding:\s*quoted-printable\s*\n\n([\s\S]*?)(?=\n-{1,2}[0-9a-f]+|$)/i;
                      const textSection = bodyStr.match(textPattern);
                      if (textSection && textSection[1]) {
                        textContent = decodeQuotedPrintable(textSection[1]);
                      }
                      
                      // Prefer HTML, fallback to plain text
                      if (htmlContent) {
                        // Extract content from div if present
                        const divMatch = htmlContent.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
                        if (divMatch && divMatch[1]) {
                          htmlContent = divMatch[1];
                        }
                        
                        // Decode HTML entities
                        htmlContent = htmlContent.replace(/&#39;/g, "'");
                        htmlContent = htmlContent.replace(/&nbsp;/g, ' ');
                        htmlContent = htmlContent.replace(/&amp;/g, '&');
                        htmlContent = htmlContent.replace(/&lt;/g, '<');
                        htmlContent = htmlContent.replace(/&gt;/g, '>');
                        
                        // Remove images
                        htmlContent = htmlContent.replace(/<img[^>]*>/gi, '');
                        
                        // Convert <br> to newlines for better display
                        htmlContent = htmlContent.replace(/<br\s*\/?>/gi, '\n');
                        
                        // Remove remaining HTML tags for plain text display
                        const plainText = htmlContent.replace(/<[^>]+>/g, '');
                        
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {plainText}
                          </div>
                        );
                      }
                      
                      if (textContent) {
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {textContent}
                          </div>
                        );
                      }
                      
                      // If we couldn't extract content, try manual parsing
                      // Split by boundaries and process each part
                      const boundaryRegex = /-{1,2}[0-9a-f]+\n?/gi;
                      const parts = bodyStr.split(boundaryRegex);
                      
                      for (const part of parts) {
                        if (!part || !part.trim()) continue;
                        
                        if (part.includes('Content-Type: text/html') && !htmlContent) {
                          const match = part.match(/Content-Transfer-Encoding:\s*quoted-printable\s*\n\n([\s\S]*?)(?=\n-{1,2}|$)/i);
                          if (match && match[1]) {
                            htmlContent = decodeQuotedPrintable(match[1]);
                          }
                        }
                        
                        if (part.includes('Content-Type: text/plain') && !textContent) {
                          const match = part.match(/Content-Transfer-Encoding:\s*quoted-printable\s*\n\n([\s\S]*?)(?=\n-{1,2}|$)/i);
                          if (match && match[1]) {
                            textContent = decodeQuotedPrintable(match[1]);
                          }
                        }
                      }
                      
                      // If we still have content, use it
                      if (htmlContent) {
                        const divMatch = htmlContent.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
                        if (divMatch && divMatch[1]) {
                          htmlContent = divMatch[1];
                        }
                        htmlContent = htmlContent.replace(/&#39;/g, "'");
                        htmlContent = htmlContent.replace(/&nbsp;/g, ' ');
                        htmlContent = htmlContent.replace(/<img[^>]*>/gi, '');
                        htmlContent = htmlContent.replace(/<br\s*\/?>/gi, '\n');
                        const plainText = htmlContent.replace(/<[^>]+>/g, '');
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {plainText}
                          </div>
                        );
                      }
                      
                      if (textContent) {
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {textContent}
                          </div>
                        );
                      }
                    }
                    
                    // If not MIME format, try to parse as JSON
                    if (typeof body === 'object' && body !== null) {
                      return (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-foreground">
                          {JSON.stringify(body, null, 2)}
                        </div>
                      );
                    }
                    
                    // If it's a string, try to parse as JSON
                    if (typeof body === 'string') {
                      try {
                        const parsed = JSON.parse(body);
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-foreground">
                            {JSON.stringify(parsed, null, 2)}
                          </div>
                        );
                      } catch (e) {
                        // Not JSON, return as plain text
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {body}
                          </div>
                        );
                      }
                    }
                    
                    // Fallback
                    return (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {String(body)}
                      </div>
                    );
                  };
                  
                  return parseEmailBody(selectedApplicant.body);
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {showEmailConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleCancelSendEmail}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">Confirm Send Email</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to send an email to this applicant?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelSendEmail}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSendEmail}
              >
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Applicants;
