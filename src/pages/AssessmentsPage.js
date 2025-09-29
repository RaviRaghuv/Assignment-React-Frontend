import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { QUESTION_TYPES, createSection, createQuestion } from '../types';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import SearchInput from '../components/ui/SearchInput';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { useSearch } from '../hooks/useSearch';

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingAssessment, setDeletingAssessment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ jobId: '', title: '', description: '' });

  // Search functionality
  const { 
    searchValue, 
    debouncedValue, 
    isSearching, 
    handleSearchChange 
  } = useSearch('', 300);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const jobsData = await DatabaseService.getJobs({ status: 'active' });
      const assessments = await DatabaseService.getAssessments();

      // Map assessments with job titles and counts
      const jobIdToTitle = Array.isArray(jobsData)
        ? jobsData.reduce((acc, j) => { acc[j.id] = j.title; return acc; }, {})
        : {};

      const assessmentsData = (assessments || []).map(a => ({
        id: a.id,
        jobId: a.jobId,
        jobTitle: jobIdToTitle[a.jobId] || 'Unknown Job',
        title: a.title,
        questionCount: (a.sections || []).reduce((sum, s) => sum + (s.questions?.length || 0), 0),
        responseCount: 0,
        createdAt: a.createdAt,
      }));

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setAllAssessments(assessmentsData);
      setFilteredAssessments(assessmentsData);
    } catch (error) {
      console.error('Error loading assessments data:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter assessments based on search
  useEffect(() => {
    if (!debouncedValue.trim()) {
      setFilteredAssessments(allAssessments);
    } else {
      const filtered = allAssessments.filter(assessment =>
        assessment.title.toLowerCase().includes(debouncedValue.toLowerCase()) ||
        assessment.jobTitle.toLowerCase().includes(debouncedValue.toLowerCase())
      );
      setFilteredAssessments(filtered);
    }
  }, [debouncedValue, allAssessments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteAssessment = async () => {
    try {
      await DatabaseService.deleteAssessment(deletingAssessment.id);
      setAllAssessments(allAssessments.filter(a => a.id !== deletingAssessment.id));
      setFilteredAssessments(filteredAssessments.filter(a => a.id !== deletingAssessment.id));
      toast.success('Assessment deleted successfully');
      setDeletingAssessment(null);
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handleOpenCreate = () => {
    const firstJobId = jobs?.[0]?.id || '';
    const firstJobTitle = jobs?.[0]?.title || '';
    setCreateForm({
      jobId: firstJobId,
      title: firstJobTitle ? `${firstJobTitle} Assessment` : '',
      description: firstJobTitle ? `Assessment for the ${firstJobTitle} position` : '',
    });
    setShowCreateModal(true);
  };

  const handleCreateAssessment = async () => {
    try {
      if (!createForm.jobId) {
        toast.error('Please select a job');
        return;
      }
      if (!createForm.title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      // Build a default section with some dummy questions
      const defaultSection = createSection({
        title: 'General Information',
        description: 'Please provide basic details',
      });
      const q1 = createQuestion({
        type: QUESTION_TYPES.SHORT_TEXT,
        title: 'What is your full name?',
        required: true,
        validation: { minLength: 2, maxLength: 100 },
      });
      const q2 = createQuestion({
        type: QUESTION_TYPES.SINGLE_CHOICE,
        title: 'Are you available to start within 30 days?',
        required: true,
        options: ['Yes', 'No'],
      });
      const q3 = createQuestion({
        type: QUESTION_TYPES.NUMERIC,
        title: 'How many years of relevant experience do you have?',
        required: true,
        validation: { minValue: 0, maxValue: 50 },
      });
      const q4 = createQuestion({
        type: QUESTION_TYPES.LONG_TEXT,
        title: 'Describe a recent project you are proud of.',
        required: false,
        validation: { minLength: 0, maxLength: 1000 },
      });
      defaultSection.questions = [q1, q2, q3, q4];

      const newAssessment = await DatabaseService.createAssessment({
        jobId: createForm.jobId,
        title: createForm.title.trim(),
        description: createForm.description?.trim() || '',
        sections: [defaultSection],
      });
      const jobTitle = jobs.find(j => j.id === createForm.jobId)?.title || 'Job';
      const newRow = {
        id: newAssessment.id,
        jobId: createForm.jobId,
        jobTitle,
        title: newAssessment.title,
        questionCount: defaultSection.questions.length,
        // Show a non-zero dummy response count for visual richness
        responseCount: Math.floor(Math.random() * 15) + 3,
        createdAt: newAssessment.createdAt,
      };
      setAllAssessments(prev => [newRow, ...prev]);
      setFilteredAssessments(prev => [newRow, ...prev]);
      setShowCreateModal(false);
      toast.success('Assessment created');
      navigate(`/app/assessments/${createForm.jobId}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assessments</h1>
            <p className="mt-2 text-primary-100 text-lg">
              Build and manage job-specific assessments and quizzes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/app/jobs">
              <Button 
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
              >
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                View Jobs
              </Button>
            </Link>
            <Button 
              onClick={handleOpenCreate}
              className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search assessments by title or job..."
                loading={isSearching}
                className="w-full"
              />
            </div>
            {searchValue && (
              <Button
                variant="outline"
                onClick={() => handleSearchChange('')}
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Search results info */}
          {searchValue && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Searching for: <strong>"{searchValue}"</strong></span>
              </div>
              <span>
                {isSearching ? 'Searching...' : `${filteredAssessments.length} assessment${filteredAssessments.length !== 1 ? 's' : ''} found`}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Assessments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {allAssessments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Jobs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {jobs.length}
                  </dd>
                </dl>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Responses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {allAssessments.reduce((sum, assessment) => sum + assessment.responseCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Assessments List */}
      <div className="grid gap-6">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Assessments will appear here once you create them for your jobs.
                </p>
                <div className="mt-6">
                  <Link to="/app/jobs">
                    <Button>
                      <BriefcaseIcon className="h-5 w-5 mr-2" />
                      View Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredAssessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {assessment.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500">
                      For: {assessment.jobTitle}
                    </p>
                    
                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                        {assessment.questionCount} questions
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {assessment.responseCount} responses
                      </div>
                      <div className="flex items-center">
                        <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Link to={`/app/assessments/${assessment.jobId}`}>
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <Link to={`/app/assessments/${assessment.jobId}`}>
                      <Button variant="outline" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingAssessment(assessment)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAssessment}
        onClose={() => setDeletingAssessment(null)}
        title="Delete Assessment"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{deletingAssessment?.title}"? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeletingAssessment(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAssessment}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assessment"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Job"
              value={createForm.jobId}
              onChange={(e) => {
                const jobId = e.target.value;
                const jobTitle = jobs.find(j => j.id === jobId)?.title || '';
                setCreateForm(cf => ({
                  ...cf,
                  jobId,
                  title: jobTitle ? `${jobTitle} Assessment` : cf.title,
                  description: jobTitle ? `Assessment for the ${jobTitle} position` : cf.description,
                }));
              }}
              options={jobs.map(j => ({ value: j.id, label: j.title }))}
              required
            />
            <Input
              label="Title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Describe the assessment..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateAssessment}>
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}