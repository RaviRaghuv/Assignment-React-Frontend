// Core data types for TalentFlow

export const JOB_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const CANDIDATE_STAGES = {
  APPLIED: 'applied',
  SCREEN: 'screen',
  TECH: 'tech',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
};

export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTI_CHOICE: 'multi_choice',
  SHORT_TEXT: 'short_text',
  LONG_TEXT: 'long_text',
  NUMERIC: 'numeric',
  FILE_UPLOAD: 'file_upload',
};

export const STAGE_COLORS = {
  [CANDIDATE_STAGES.APPLIED]: 'bg-blue-100 text-blue-800',
  [CANDIDATE_STAGES.SCREEN]: 'bg-yellow-100 text-yellow-800',
  [CANDIDATE_STAGES.TECH]: 'bg-purple-100 text-purple-800',
  [CANDIDATE_STAGES.OFFER]: 'bg-green-100 text-green-800',
  [CANDIDATE_STAGES.HIRED]: 'bg-emerald-100 text-emerald-800',
  [CANDIDATE_STAGES.REJECTED]: 'bg-red-100 text-red-800',
};

export const STAGE_LABELS = {
  [CANDIDATE_STAGES.APPLIED]: 'Applied',
  [CANDIDATE_STAGES.SCREEN]: 'Phone Screen',
  [CANDIDATE_STAGES.TECH]: 'Technical Interview',
  [CANDIDATE_STAGES.OFFER]: 'Offer Extended',
  [CANDIDATE_STAGES.HIRED]: 'Hired',
  [CANDIDATE_STAGES.REJECTED]: 'Rejected',
};

// Job data structure
export const createJob = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID(),
  title: '',
  slug: '',
  status: JOB_STATUS.ACTIVE,
  tags: [],
  order: 0,
  description: '',
  requirements: [],
  benefits: [],
  location: '',
  salary: '',
  type: 'full-time',
  department: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Candidate data structure
export const createCandidate = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID(),
  name: '',
  email: '',
  phone: '',
  stage: CANDIDATE_STAGES.APPLIED,
  jobId: null, // Primary job (for backward compatibility)
  resume: null,
  coverLetter: null,
  notes: [],
  timeline: [],
  assessmentResponses: {},
  jobApplications: [], // Array of job applications with status
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Job Application data structure
export const createJobApplication = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID(),
  candidateId: null,
  jobId: null,
  jobTitle: '',
  status: CANDIDATE_STAGES.APPLIED, // applied, screen, tech, offer, hired, rejected
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: '',
  interviewScheduled: null,
  assessmentCompleted: false,
  ...overrides,
});

// Assessment data structure
export const createAssessment = (overrides = {}) => ({
  id: overrides.id || crypto.randomUUID(),
  jobId: null,
  title: '',
  description: '',
  sections: [],
  settings: {
    timeLimit: null,
    allowMultipleAttempts: false,
    showResults: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Question data structure
export const createQuestion = (overrides = {}) => ({
  id: crypto.randomUUID(),
  type: QUESTION_TYPES.SHORT_TEXT,
  title: '',
  description: '',
  required: false,
  options: [], // For choice questions
  validation: {
    minLength: null,
    maxLength: null,
    minValue: null,
    maxValue: null,
    pattern: null,
  },
  conditionalLogic: null,
  ...overrides,
});

// Section data structure
export const createSection = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  questions: [],
  order: 0,
  ...overrides,
});

// Timeline event data structure
export const createTimelineEvent = (overrides = {}) => ({
  id: crypto.randomUUID(),
  candidateId: null,
  type: 'stage_change', // stage_change, note_added, assessment_completed, etc.
  title: '',
  description: '',
  metadata: {},
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Note data structure with @mentions support
export const createNote = (overrides = {}) => ({
  id: crypto.randomUUID(),
  candidateId: null,
  content: '',
  mentions: [], // Array of user IDs mentioned
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Assessment response data structure
export const createAssessmentResponse = (overrides = {}) => ({
  id: crypto.randomUUID(),
  candidateId: null,
  assessmentId: null,
  responses: {}, // Question ID -> response mapping
  score: null,
  completedAt: null,
  timeSpent: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// API Response wrapper
export const createApiResponse = (data, success = true, message = '') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// Pagination metadata
export const createPaginationMeta = (page, pageSize, total, hasMore = false) => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
  hasMore,
});

// Search and filter options
export const createSearchOptions = (overrides = {}) => ({
  search: '',
  page: 1,
  pageSize: 20,
  sort: 'createdAt',
  order: 'desc',
  filters: {},
  ...overrides,
});

// Error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
};

export const createError = (type, message, details = {}) => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString(),
});
