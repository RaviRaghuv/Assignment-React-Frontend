import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { JOB_STATUS } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import JobForm from '../components/forms/JobForm';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadJobData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading job data for ID:', id);
      
      // First, let's check if the database is properly initialized
      const stats = await DatabaseService.getStats();
      console.log('Database stats:', stats);
      
      // Use debug method to check the specific job
      const debugResult = await DatabaseService.debugJobById(id);
      console.log('Debug result:', debugResult);
      
      const [jobData, candidatesData] = await Promise.all([
        DatabaseService.getJobById(id),
        DatabaseService.getCandidates({ jobId: id }),
      ]);
      
      console.log('Job data loaded:', jobData);
      console.log('Candidates data loaded:', candidatesData);
      
      if (!jobData) {
        console.error('Job not found with ID:', id);
        toast.error(`Job with ID ${id} not found`);
        return;
      }
      
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading job data:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadJobData();
    }
  }, [id, loadJobData]);

  const handleUpdateJob = async (jobData) => {
    try {
      const updatedJob = await DatabaseService.updateJob(id, jobData);
      setJob(updatedJob);
      toast.success('Job updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleArchiveJob = async () => {
    try {
      const newStatus = job.status === JOB_STATUS.ACTIVE ? JOB_STATUS.ARCHIVED : JOB_STATUS.ACTIVE;
      const updatedJob = await DatabaseService.updateJob(id, { status: newStatus });
      setJob(updatedJob);
      toast.success(`Job ${newStatus === JOB_STATUS.ARCHIVED ? 'archived' : 'unarchived'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await DatabaseService.deleteJob(id);
      toast.success('Job deleted successfully');
      // Redirect to jobs page
      window.location.href = '/jobs';
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const getStageCounts = () => {
    const counts = {};
    candidates.forEach(candidate => {
      counts[candidate.stage] = (counts[candidate.stage] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job you're looking for doesn't exist or has been deleted.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Job ID: {id}
        </p>
        <div className="mt-6 space-x-4">
          <Link to="/app/jobs">
            <Button variant="outline">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Attempting to reload job data...');
              loadJobData();
            }}
          >
            Retry Loading
          </Button>
          <Button 
            variant="danger" 
            onClick={async () => {
              try {
                if (window.confirm('Are you sure you want to reset the database? This will delete all data and reseed with fresh data.')) {
                  console.log('Resetting database...');
                  await DatabaseService.clearAllData();
                  
                  // Re-seed the database
                  const { generateSeedData } = await import('../data/seedData');
                  const seedData = generateSeedData();
                  
                  // Add jobs
                  for (const job of seedData.jobs) {
                    await DatabaseService.createJob(job);
                  }
                  
                  // Add candidates
                  for (const candidate of seedData.candidates) {
                    await DatabaseService.createCandidate(candidate);
                  }
                  
                  // Add assessments
                  for (const assessment of seedData.assessments) {
                    await DatabaseService.createAssessment(assessment);
                  }
                  
                  console.log('Database reset and reseeded successfully!');
                  toast.success('Database reset successfully');
                  loadJobData();
                }
              } catch (error) {
                console.error('Error resetting database:', error);
                toast.error('Failed to reset database');
              }
            }}
          >
            Reset Database
          </Button>
        </div>
      </div>
    );
  }

  const stageCounts = getStageCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                job.status === JOB_STATUS.ACTIVE 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {job.status === JOB_STATUS.ACTIVE ? 'Active' : 'Archived'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {job.department} • {job.type} • Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            onClick={handleArchiveJob}
          >
            <ArchiveBoxIcon className="h-5 w-5 mr-2" />
            {job.status === JOB_STATUS.ACTIVE ? 'Archive' : 'Unarchive'}
          </Button>
          
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {job.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}
                
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Candidates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
                <Link to={`/app/candidates?jobId=${id}`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {candidates.length === 0 ? (
                <div className="text-center py-6">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Candidates who apply for this job will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {candidate.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                      <Link to={`/candidates/${candidate.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Job Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </div>
                </div>
                
                {job.salary && (
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Salary</p>
                      <p className="text-sm text-gray-500">{job.salary}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-500 capitalize">{job.type.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Candidate Pipeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Pipeline</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {stage.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link to={`/app/assessments/${id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Build Assessment
                  </Button>
                </Link>
                
                <Link to={`/candidates?jobId=${id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    View Candidates
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Edit Job Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Job"
        size="lg"
      >
        <ModalBody>
          <JobForm
            initialData={job}
            onSubmit={handleUpdateJob}
            onCancel={() => setShowEditModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{job.title}"? This action cannot be undone and will also delete all associated candidates and assessments.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteJob}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
