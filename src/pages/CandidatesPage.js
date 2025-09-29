import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS, STAGE_COLORS } from '../types';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchInput from '../components/ui/SearchInput';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useSearch } from '../hooks/useSearch';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingCandidate, setApplyingCandidate] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Show 50 candidates per page
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
    stage: searchParams.get('stage') || '',
    jobId: searchParams.get('jobId') || '',
  });

  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  
  const candidatesByStage = useMemo(() => {
    const grouped = {};
    Object.values(CANDIDATE_STAGES).forEach(stage => {
      grouped[stage] = candidates.filter(candidate => candidate.stage === stage);
    });
    return grouped;
  }, [candidates]);

  const loadCandidates = React.useCallback(async () => {
    try {
      setLoading(true);
      const candidatesData = await DatabaseService.getCandidates(filters);
      console.log('Loaded candidates:', candidatesData.length, 'candidates');
      console.log('First few candidates:', candidatesData.slice(0, 3));
      console.log('Sample candidate IDs:', candidatesData.slice(0, 5).map(c => c.id));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters when debounced search value changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedValue
    }));
  }, [debouncedValue]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.jobId) params.set('jobId', filters.jobId);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleCreateCandidate = async (candidateData) => {
    try {
      await DatabaseService.createCandidate(candidateData);
      toast.success('Candidate created successfully');
      setShowCreateModal(false);
      loadCandidates();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Failed to create candidate');
    }
  };

  const handleUpdateCandidate = async (candidateData) => {
    try {
      await DatabaseService.updateCandidate(editingCandidate.id, candidateData);
      toast.success('Candidate updated successfully');
      setEditingCandidate(null);
      loadCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await DatabaseService.deleteCandidate(deletingCandidate.id);
      toast.success('Candidate deleted successfully');
      setDeletingCandidate(null);
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleOpenApplyModal = async (candidate) => {
    try {
      setApplyingCandidate(candidate);
      const jobs = await DatabaseService.getJobs({ status: 'active' });
      setAvailableJobs(jobs);
      setShowApplyModal(true);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load available jobs');
    }
  };

  const handleApplyToJob = async () => {
    if (!applyingCandidate || !selectedJobId) return;
    
    try {
      await DatabaseService.applyCandidateToJob(applyingCandidate.id, selectedJobId);
      toast.success('Candidate applied to job successfully');
      setShowApplyModal(false);
      setApplyingCandidate(null);
      setSelectedJobId('');
    } catch (error) {
      console.error('Error applying candidate to job:', error);
      toast.error(error.message || 'Failed to apply candidate to job');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDragging(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (!over) return;

    const candidateId = active.id;
    const newStage = over.id;

    // Find the candidate
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update
    setCandidates(prev => 
      prev.map(c => 
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
    );

    try {
      await DatabaseService.updateCandidate(candidateId, { stage: newStage });
      toast.success(`Candidate moved to ${STAGE_LABELS[newStage]}`);
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      // Rollback on failure
      setCandidates(prev => 
        prev.map(c => 
          c.id === candidateId ? { ...c, stage: candidate.stage } : c
        )
      );
      toast.error('Failed to update candidate stage');
    }
  };

  const stageOptions = [
    { value: '', label: 'All Stages' },
    ...Object.values(CANDIDATE_STAGES).map(stage => ({
      value: stage,
      label: STAGE_LABELS[stage],
    })),
  ];

  // Pagination logic
  const totalPages = Math.ceil(candidates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCandidates = candidates.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
            <h1 className="text-3xl font-bold">Candidates</h1>
            <p className="mt-2 text-primary-100 text-lg">
              Manage candidates and track their progress through the hiring pipeline
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 rounded-lg p-1">
  <Button
    variant="ghost"
    size="sm"
    className={`${viewMode === 'list' 
      ? 'bg-blue-600 text-white' 
      : 'text-white '} border-0 px-3 py-2`}
    onClick={() => setViewMode('list')}
  >
    <ListBulletIcon className="h-4 w-4 mr-2" />
    List View
  </Button>

  <Button
    variant="ghost"
    size="sm"
    className={`${viewMode === 'kanban' 
      ? 'bg-blue-600 text-white' 
      : 'text-white hover:bg-blue-100'} border-0 px-3 py-2`}
    onClick={() => setViewMode('kanban')}
  >
    <ViewColumnsIcon className="h-4 w-4 mr-2" />
    Kanban View
  </Button>
</div>

            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 px-4 py-2 text-sm"
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
                      loadCandidates();
                    }
                  } catch (error) {
                    console.error('Error resetting database:', error);
                    toast.error('Failed to reset database');
                  }
                }}
              >
                Reset Database
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-lg hover:shadow-xl px-4 py-2 text-sm font-semibold"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search candidates by name or email..."
              loading={isSearching || loading}
              className="w-full"
            />
            
            <Select
              options={stageOptions}
              value={filters.stage}
              className="px-4 py-2 border border-gray-300 rounded-md"
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            />
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ search: '', stage: '', jobId: '' });
                  handleSearchChange('');
                }}
                disabled={!filters.search && !filters.stage && !filters.jobId}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Search results info */}
          {(filters.search || filters.stage) && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                {filters.search && (
                  <span>Searching for: <strong>"{filters.search}"</strong></span>
                )}
                {filters.stage && (
                  <span>Stage: <strong>{STAGE_LABELS[filters.stage] || filters.stage}</strong></span>
                )}
              </div>
              <span>
                {loading ? 'Loading...' : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found`}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Candidates View */}
      {candidates.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.stage || filters.jobId
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding a new candidate.'
                }
              </p>
              {!filters.search && !filters.stage && !filters.jobId && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ) : viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {Object.values(CANDIDATE_STAGES).map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                candidates={candidatesByStage[stage] || []}
                onEdit={setEditingCandidate}
                onDelete={setDeletingCandidate}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <p className="font-medium text-gray-900">
                  {candidates.find(c => c.id === activeId)?.name}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Candidates List */}
              <div className="space-y-4">
                {paginatedCandidates.map((candidate) => (
                  <div key={candidate.id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-soft border border-gray-100 hover:shadow-medium hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                          <span className="text-lg font-bold text-white">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                          {candidate.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {candidate.email}
                        </p>
                        {candidate.phone && (
                          <p className="text-sm text-gray-500 truncate">
                            {candidate.phone}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${STAGE_COLORS[candidate.stage]} shadow-sm`}>
                          {STAGE_LABELS[candidate.stage]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link to={`/app/candidates/${candidate.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-primary-50 hover:border-primary-300 px-3 py-2"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenApplyModal(candidate)}
                        className="hover:bg-blue-50 hover:border-blue-300 px-3 py-2"
                        title="Apply to Job"
                      >
                        <BriefcaseIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCandidate(candidate)}
                        className="hover:bg-gray-50 hover:border-gray-300 px-3 py-2"
                        title="Edit Candidate"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingCandidate(candidate)}
                        className="px-3 py-2"
                        title="Delete Candidate"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, candidates.length)}</span> of{' '}
                        <span className="font-medium">{candidates.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="rounded-l-md px-4 py-2"
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "primary" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="rounded-none border-l-0 px-4 py-2"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="rounded-r-md border-l-0 px-4 py-2"
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Candidate Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Candidate"
        size="md"
      >
        <ModalBody>
          <CandidateForm
            onSubmit={handleCreateCandidate}
            onCancel={() => setShowCreateModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal
        isOpen={!!editingCandidate}
        onClose={() => setEditingCandidate(null)}
        title="Edit Candidate"
        size="md"
      >
        <ModalBody>
          <CandidateForm
            initialData={editingCandidate}
            onSubmit={handleUpdateCandidate}
            onCancel={() => setEditingCandidate(null)}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCandidate}
        onClose={() => setDeletingCandidate(null)}
        title="Delete Candidate"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{deletingCandidate?.name}"? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeletingCandidate(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCandidate}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Apply to Job Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply Candidate to Job"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{applyingCandidate?.name}</p>
                <p className="text-sm text-gray-500">{applyingCandidate?.email}</p>
              </div>
            </div>
            
            <div>
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
              <p className="text-sm text-gray-500">
                No available jobs to apply to.
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
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
            Apply to Job
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({ stage, candidates, onEdit, onDelete }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 min-h-[600px] max-h-[800px] overflow-y-auto shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur-sm rounded-lg p-2 -mx-2 -mt-2">
        <h3 className="font-bold text-gray-900 text-sm">{STAGE_LABELS[stage]}</h3>
        <span className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
          {candidates.length}
        </span>
      </div>
      
      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              No candidates
            </div>
          ) : (
            candidates.map((candidate) => (
              <SortableCandidateCard
                key={candidate.id}
                candidate={candidate}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Sortable Candidate Card Component
function SortableCandidateCard({ candidate, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-grab hover:shadow-lg hover:border-primary-200 transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {candidate.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {candidate.email}
              </p>
              {candidate.phone && (
                <p className="text-xs text-gray-400 truncate">
                  {candidate.phone}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(candidate);
            }}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            title="Edit candidate"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(candidate);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete candidate"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Candidate Form Component
function CandidateForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    stage: initialData?.stage || CANDIDATE_STAGES.APPLIED,
    jobId: initialData?.jobId || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    onSubmit(formData);
  };

  const stageOptions = Object.values(CANDIDATE_STAGES).map(stage => ({
    value: stage,
    label: STAGE_LABELS[stage],
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      
      <Select
        label="Stage"
        options={stageOptions}
        value={formData.stage}
        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Candidate' : 'Add Candidate'}
        </Button>
      </div>
    </form>
  );
}