import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DatabaseService } from '../services/database';
import { JOB_STATUS } from '../types';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchInput from '../components/ui/SearchInput';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import JobForm from '../components/forms/JobForm';
import { useSearch } from '../hooks/useSearch';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Search functionality
  const { 
    searchValue, 
    debouncedValue, 
    isSearching, 
    handleSearchChange 
  } = useSearch(searchParams.get('search') || '', 300);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
  });

  const loadJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      const filtersWithPagination = {
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
      
      const result = await DatabaseService.getJobs(filtersWithPagination);
      
      if (result.pagination) {
        setJobs(result.data);
        setPagination(result.pagination);
      } else {
        setJobs(result);
      }
      
      // Load available tags for filtering
      const allJobs = await DatabaseService.getJobs({});
      const tags = [...new Set(allJobs.flatMap(job => job.tags || []))];
      setAvailableTags(tags.sort());
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Update filters when debounced search value changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedValue
    }));
  }, [debouncedValue]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleCreateJob = async (jobData) => {
    try {
      await DatabaseService.createJob(jobData);
      toast.success('Job created successfully');
      setShowCreateModal(false);
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  };

  const handleUpdateJob = async (jobData) => {
    try {
      await DatabaseService.updateJob(editingJob.id, jobData);
      toast.success('Job updated successfully');
      setEditingJob(null);
      loadJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleArchiveJob = async (job) => {
    try {
      const newStatus = job.status === JOB_STATUS.ACTIVE ? JOB_STATUS.ARCHIVED : JOB_STATUS.ACTIVE;
      await DatabaseService.updateJob(job.id, { status: newStatus });
      toast.success(`Job ${newStatus === JOB_STATUS.ARCHIVED ? 'archived' : 'unarchived'} successfully`);
      loadJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await DatabaseService.deleteJob(deletingJob.id);
      toast.success('Job deleted successfully');
      setDeletingJob(null);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: JOB_STATUS.ACTIVE, label: 'Active' },
    { value: JOB_STATUS.ARCHIVED, label: 'Archived' },
  ];
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handlePageSizeChange = (pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = jobs.findIndex(job => job.id === active.id);
      const newIndex = jobs.findIndex(job => job.id === over.id);
      
      // Optimistic update
      const newJobs = arrayMove(jobs, oldIndex, newIndex);
      setJobs(newJobs);
      
      try {
        setIsReordering(true);
        // Update order in database
        await DatabaseService.reorderJobs(
          jobs[oldIndex].order,
          jobs[newIndex].order
        );
        toast.success('Jobs reordered successfully');
      } catch (error) {
        console.error('Error reordering jobs:', error);
        // Rollback on failure
        setJobs(jobs);
        toast.error('Failed to reorder jobs');
      } finally {
        setIsReordering(false);
      }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="mt-2 text-primary-100 text-lg">
            Manage job postings and track applications
          </p>
        </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-lg hover:shadow-xl"
          >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Job
        </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search Input */}
            <div className="flex-1">
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search jobs by title, description, or tags..."
                loading={isSearching || loading}
                className="w-full"
              />
            </div>
            
            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select
                options={statusOptions}
                value={filters.status}
                placeholder="Filter by Status"
                className="px-4 py-2 border border-gray-300 rounded-md"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              />
            </div>
            
            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <div className="w-full lg:w-48">
                <Select
                  options={[
                    { value: '', label: 'All Tags' },
                    ...availableTags.map(tag => ({
                      value: tag,
                      label: tag
                    }))
                  ]}
                  value={filters.tags.length === 1 ? filters.tags[0] : ''}
                  placeholder="Filter by Tag"
                  onChange={(e) => {
                    const selectedTag = e.target.value;
                    setFilters(prev => ({
                      ...prev,
                      tags: selectedTag ? [selectedTag] : []
                    }));
                  }}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Clear Filters Button */}
            <div className="w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ search: '', status: '', tags: [] });
                  handleSearchChange('');
                }}
                disabled={!filters.search && !filters.status && filters.tags.length === 0}
                className="w-full lg:w-auto"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Search results info */}
          {(filters.search || filters.status || filters.tags.length > 0) && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                {filters.search && (
                  <span>Searching for: <strong>"{filters.search}"</strong></span>
                )}
                {filters.status && (
                  <span>Status: <strong>{filters.status === JOB_STATUS.ACTIVE ? 'Active' : 'Archived'}</strong></span>
                )}
                {filters.tags.length > 0 && (
                  <span>Tags: <strong>{filters.tags.join(', ')}</strong></span>
                )}
              </div>
              <span>
                {loading ? 'Loading...' : `${pagination.total} job${pagination.total !== 1 ? 's' : ''} found`}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Jobs List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-6">
            {jobs.length === 0 ? (
              <Card>
                <CardBody>
                  <div className="text-center py-12">
                    <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filters.search || filters.status || filters.tags.length > 0
                        ? 'Try adjusting your search criteria.'
                        : 'Get started by creating a new job posting.'
                      }
                    </p>
                    {!filters.search && !filters.status && filters.tags.length === 0 && (
                      <div className="mt-6">
                        <Button onClick={() => setShowCreateModal(true)}>
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Create Job
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ) : (
              jobs.map((job) => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={() => setEditingJob(job)}
                  onArchive={() => handleArchiveJob(job)}
                  onDelete={() => setDeletingJob(job)}
                  isReordering={isReordering}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                  {pagination.total} results
                </span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded-md border-gray-300 text-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
        size="lg"
      >
        <ModalBody>
          <JobForm
            onSubmit={handleCreateJob}
            onCancel={() => setShowCreateModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job"
        size="lg"
      >
        <ModalBody>
          <JobForm
            initialData={editingJob}
            onSubmit={handleUpdateJob}
            onCancel={() => setEditingJob(null)}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        title="Delete Job"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{deletingJob?.title}"? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeletingJob(null)}>
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

// Sortable Job Card Component
function SortableJobCard({ job, onEdit, onArchive, onDelete, isReordering }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      hover
      className={`group ${isDragging ? 'shadow-2xl' : ''} ${isReordering ? 'pointer-events-none' : ''}`}
    >
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder"
              >
                <Bars3Icon className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {job.title}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                job.status === JOB_STATUS.ACTIVE 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                {job.status === JOB_STATUS.ACTIVE ? 'Active' : 'Archived'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.type}
              </span>
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.department}
              </span>
            </div>
            
            {job.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {job.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="ml-6 flex items-center space-x-2">
            <Link to={`/app/jobs/${job.id}`}>
              <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:border-primary-300">
                View
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="hover:bg-yellow-50 hover:border-yellow-300"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
