import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Select from './ui/Select';
import { 
  BriefcaseIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const STATUS_COLORS = {
  [CANDIDATE_STAGES.APPLIED]: 'bg-blue-100 text-blue-800',
  [CANDIDATE_STAGES.SCREEN]: 'bg-yellow-100 text-yellow-800',
  [CANDIDATE_STAGES.TECH]: 'bg-orange-100 text-orange-800',
  [CANDIDATE_STAGES.OFFER]: 'bg-purple-100 text-purple-800',
  [CANDIDATE_STAGES.HIRED]: 'bg-green-100 text-green-800',
  [CANDIDATE_STAGES.REJECTED]: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  [CANDIDATE_STAGES.APPLIED]: ClockIcon,
  [CANDIDATE_STAGES.SCREEN]: CalendarDaysIcon,
  [CANDIDATE_STAGES.TECH]: CalendarDaysIcon,
  [CANDIDATE_STAGES.OFFER]: CalendarDaysIcon,
  [CANDIDATE_STAGES.HIRED]: CheckCircleIcon,
  [CANDIDATE_STAGES.REJECTED]: XCircleIcon,
};

export default function CandidateJobApplications({ candidateId, onStatusUpdate }) {
  const [applications, setApplications] = useState([]);
  const [statusSummary, setStatusSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    loadJobApplications();
  }, [candidateId]);

  const loadJobApplications = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getCandidateJobStatus(candidateId);
      setApplications(data.applications);
      setStatusSummary(data.statusSummary);
    } catch (error) {
      console.error('Error loading job applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableJobs = async () => {
    try {
      const jobs = await DatabaseService.getJobs({ status: 'active' });
      // Filter out jobs the candidate has already applied to
      const appliedJobIds = applications.map(app => app.jobId);
      const available = jobs.filter(job => !appliedJobIds.includes(job.id));
      setAvailableJobs(available);
    } catch (error) {
      console.error('Error loading available jobs:', error);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await DatabaseService.updateJobApplicationStatus(applicationId, newStatus);
      await loadJobApplications();
      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleApplyToJob = async () => {
    if (!selectedJobId) return;
    
    try {
      await DatabaseService.applyCandidateToJob(candidateId, selectedJobId);
      await loadJobApplications();
      setShowApplyModal(false);
      setSelectedJobId('');
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const openApplyModal = () => {
    loadAvailableJobs();
    setShowApplyModal(true);
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      {statusSummary && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Application Summary</h3>
              <Button
                onClick={openApplyModal}
                size="sm"
                className="bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Apply to Job
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statusSummary.totalApplications}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusSummary.hired.length}</div>
                <div className="text-sm text-gray-500">Hired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusSummary.rejected.length}</div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusSummary.interviewScheduled.length}</div>
                <div className="text-sm text-gray-500">Interview Scheduled</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Applications List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applications</h3>
          
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No job applications yet</p>
              <Button onClick={openApplyModal} className="bg-primary-600 hover:bg-primary-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Apply to a Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = STATUS_ICONS[application.status];
                const isUpdating = updatingStatus === application.id;
                
                return (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              STATUS_COLORS[application.status]
                            )}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STAGE_LABELS[application.status]}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          {application.updatedAt !== application.appliedAt && (
                            <span className="ml-4">
                              Updated: {new Date(application.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {application.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Notes:</strong> {application.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          disabled={isUpdating}
                          className="min-w-[120px]"
                        >
                          <option value={CANDIDATE_STAGES.APPLIED}>Applied</option>
                          <option value={CANDIDATE_STAGES.SCREEN}>Screen</option>
                          <option value={CANDIDATE_STAGES.TECH}>Tech Interview</option>
                          <option value={CANDIDATE_STAGES.OFFER}>Offer</option>
                          <option value={CANDIDATE_STAGES.HIRED}>Hired</option>
                          <option value={CANDIDATE_STAGES.REJECTED}>Rejected</option>
                        </Select>
                        
                        {application.jobDetails && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/app/jobs/${application.jobId}`, '_blank')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Apply to Job Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply to Job</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">Choose a job...</option>
                {availableJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </Select>
            </div>
            
            {availableJobs.length === 0 && (
              <p className="text-sm text-gray-500 mb-4">
                No available jobs to apply to.
              </p>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowApplyModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyToJob}
                disabled={!selectedJobId}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
