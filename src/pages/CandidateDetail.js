import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS, STAGE_COLORS } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import CandidateJobApplications from '../components/CandidateJobApplications';

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const loadCandidateData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading candidate data for ID:', id);
      
      const stats = await DatabaseService.getStats();
      console.log('Database stats:', stats);
      
      const debugResult = await DatabaseService.debugCandidateById(id);
      console.log('Debug result:', debugResult);
      

      const allCandidates = await DatabaseService.getCandidates();
      console.log('All candidates in database:', allCandidates.length);
      console.log('Sample candidate IDs:', allCandidates.slice(0, 5).map(c => c.id));
      
      const [candidateData, timelineData, notesData] = await Promise.all([
        DatabaseService.getCandidateById(id),
        DatabaseService.getCandidateTimeline(id),
        DatabaseService.getCandidateNotes(id),
      ]);
      
      console.log('Candidate data loaded:', candidateData);
      console.log('Timeline data loaded:', timelineData);
      console.log('Notes data loaded:', notesData);
      
      if (!candidateData) {
        console.error('Candidate not found with ID:', id);
        toast.error(`Candidate with ID ${id} not found`);
        return;
      }
      
      setCandidate(candidateData);
      setTimeline(timelineData || []);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error loading candidate data:', error);
      toast.error('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      
      const timer = setTimeout(() => {
        loadCandidateData();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [id, loadCandidateData]);

  const handleUpdateCandidate = async (candidateData) => {
    try {
      const updatedCandidate = await DatabaseService.updateCandidate(id, candidateData);
      setCandidate(updatedCandidate);
      toast.success('Candidate updated successfully');
      setShowEditModal(false);
      loadCandidateData(); // Reload timeline
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await DatabaseService.deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      // Redirect to candidates page
      window.location.href = '/candidates';
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      await DatabaseService.createNote({
        ...noteData,
        candidateId: id,
      });
      toast.success('Note added successfully');
      setShowNoteModal(false);
      loadCandidateData(); // Reload notes and timeline
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Candidate not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The candidate you're looking for doesn't exist or has been deleted.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Candidate ID: {id}
        </p>
        <div className="mt-6 space-x-4">
          <Link to="/app/candidates">
            <Button variant="outline">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Attempting to reload candidate data...');
              loadCandidateData();
            }}
          >
            Retry Loading
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                // Create a test candidate with the requested ID for debugging
                console.log('Creating test candidate with ID:', id);
                const testCandidate = await DatabaseService.createCandidate({
                  id: id, // Use the exact ID from the URL
                  name: 'Test Candidate',
                  email: 'test@example.com',
                  phone: '+1-555-0123',
                  stage: 'applied',
                  jobId: 1, // Use first job ID
                  coverLetter: 'This is a test candidate created for debugging purposes.'
                });
                console.log('Test candidate created:', testCandidate);
                toast.success('Test candidate created successfully');
                loadCandidateData();
              } catch (error) {
                console.error('Error creating test candidate:', error);
                toast.error('Failed to create test candidate');
              }
            }}
          >
            Create Test Candidate
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
                  loadCandidateData();
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

  const stageOptions = Object.values(CANDIDATE_STAGES).map(stage => ({
    value: stage,
    label: STAGE_LABELS[stage],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/candidates">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[candidate.stage]}`}>
                {STAGE_LABELS[candidate.stage]}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Added {new Date(candidate.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowNoteModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Note
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
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
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{candidate.email}</p>
                  </div>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-500">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                
                {candidate.coverLetter && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Cover Letter</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{candidate.coverLetter}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="text-center py-6">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline events</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Timeline events will appear here as the candidate progresses.
                    </p>
                  </div>
                ) : (
                  timeline.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <ClockIcon className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNoteModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-6">
                    <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add notes to track important information about this candidate.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Job Applications */}
          <CandidateJobApplications 
            candidateId={id} 
            onStatusUpdate={loadCandidateData}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stage Management */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Stage Management</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${STAGE_COLORS[candidate.stage]}`}>
                    {STAGE_LABELS[candidate.stage]}
                  </div>
                </div>
                
                <Select
                  label="Move to Stage"
                  options={stageOptions.filter(option => option.value !== candidate.stage)}
                  onChange={async (e) => {
                    try {
                      await DatabaseService.updateCandidate(id, { stage: e.target.value });
                      toast.success('Stage updated successfully');
                      loadCandidateData();
                    } catch (error) {
                      toast.error('Failed to update stage');
                    }
                  }}
                />
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowNoteModal(true)}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowEditModal(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Edit Candidate Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Candidate"
        size="md"
      >
        <ModalBody>
          <CandidateEditForm
            candidate={candidate}
            onSubmit={handleUpdateCandidate}
            onCancel={() => setShowEditModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
        size="md"
      >
        <ModalBody>
          <NoteForm
            onSubmit={handleAddNote}
            onCancel={() => setShowNoteModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Candidate"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{candidate.name}"? This action cannot be undone and will also delete all associated notes and timeline events.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCandidate}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Edit Candidate Form Component
function CandidateEditForm({ candidate, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    stage: candidate.stage || CANDIDATE_STAGES.APPLIED,
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
          Update Candidate
        </Button>
      </div>
    </form>
  );
}

// Note Form Component with @mentions support
function NoteForm({ onSubmit, onCancel }) {
  const [content, setContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Mock team members for @mentions
  const teamMembers = [
    { id: '1', name: 'John Smith', role: 'HR Manager' },
    { id: '2', name: 'Sarah Johnson', role: 'Recruiter' },
    { id: '3', name: 'Mike Chen', role: 'Technical Lead' },
    { id: '4', name: 'Emily Davis', role: 'Hiring Manager' },
    { id: '5', name: 'Alex Rodriguez', role: 'HR Coordinator' },
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleContentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);
    setCursorPosition(cursorPos);

    // Check for @mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (member) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    
    const newContent = 
      content.substring(0, mentionStart) + 
      `@${member.name} ` + 
      textAfterCursor;
    
    setContent(newContent);
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note content is required');
      return;
    }
    onSubmit({ content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note Content
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Add your note here... Use @ to mention team members"
          required
        />
        
        {/* @mentions dropdown */}
        {showMentions && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleMentionSelect(member)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No team members found
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Tip: Use @ to mention team members in your notes
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Note
        </Button>
      </div>
    </form>
  );
}