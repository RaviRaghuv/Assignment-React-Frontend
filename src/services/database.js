import Dexie from 'dexie';
import {
  createJob,
  createCandidate,
  createAssessment,
  createTimelineEvent,
  createNote,
  createAssessmentResponse,
  createJobApplication,
} from '../types';

class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: '++id, title, slug, status, order, createdAt, updatedAt',
      candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
      assessments: '++id, jobId, title, createdAt, updatedAt',
      timelineEvents: '++id, candidateId, type, createdAt',
      notes: '++id, candidateId, createdAt, updatedAt',
      assessmentResponses: '++id, candidateId, assessmentId, createdAt',
      jobApplications: '++id, candidateId, jobId, status, appliedAt, updatedAt',
      settings: '++id, key',
    });
    
    // Hooks for automatic timestamps
    this.jobs.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.jobs.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.candidates.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.candidates.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.assessments.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.assessments.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.notes.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.notes.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }
}

// Create database instance
export const db = new TalentFlowDB();

// Database service methods
export class DatabaseService {
  // Jobs
  static async getJobs(filters = {}) {
    try {
      let query = db.jobs.orderBy('order');
      
      if (filters.status) {
        query = query.filter(job => job.status === filters.status);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.filter(job => 
          filters.tags.some(tag => job.tags.includes(tag))
        );
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.description?.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      // Handle pagination
      if (filters.page && filters.pageSize) {
        const offset = (filters.page - 1) * filters.pageSize;
        const jobs = await query.toArray();
        const total = jobs.length;
        const paginatedJobs = jobs.slice(offset, offset + filters.pageSize);
        
        return {
          data: paginatedJobs,
          pagination: {
            page: filters.page,
            pageSize: filters.pageSize,
            total,
            totalPages: Math.ceil(total / filters.pageSize),
            hasMore: offset + filters.pageSize < total
          }
        };
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }
  
  static async getJobById(id) {
    try {
      return await db.jobs.get(id);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }
  
  static async getJobBySlug(slug) {
    try {
      return await db.jobs.where('slug').equals(slug).first();
    } catch (error) {
      console.error('Error fetching job by slug:', error);
      throw error;
    }
  }
  
  static async isSlugUnique(slug, excludeId = null) {
    try {
      const existingJob = await db.jobs.where('slug').equals(slug).first();
      return !existingJob || existingJob.id === excludeId;
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      throw error;
    }
  }
  
  static async createJob(jobData) {
    try {
      // Generate slug if not provided
      if (!jobData.slug && jobData.title) {
        jobData.slug = this.generateSlug(jobData.title);
      }
      
      // Ensure slug is unique
      if (jobData.slug) {
        let baseSlug = jobData.slug;
        let counter = 1;
        while (!(await this.isSlugUnique(jobData.slug))) {
          jobData.slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      
      const job = createJob(jobData);
      console.log('Creating job with data:', job);
      
      // If an ID is provided, use put() to preserve it; otherwise use add() to let Dexie generate one
      let id;
      if (job.id) {
        id = await db.jobs.put(job);
        console.log('Job created with preserved ID:', id);
      } else {
        id = await db.jobs.add(job);
        console.log('Job created with generated ID:', id);
      }
      
      return { ...job, id };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
  
  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  static async updateJob(id, updates) {
    try {
      // Handle slug updates
      if (updates.title && !updates.slug) {
        updates.slug = this.generateSlug(updates.title);
      }
      
      // Ensure slug is unique (excluding current job)
      if (updates.slug) {
        let baseSlug = updates.slug;
        let counter = 1;
        while (!(await this.isSlugUnique(updates.slug, id))) {
          updates.slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      
      await db.jobs.update(id, updates);
      return await db.jobs.get(id);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }
  
  static async deleteJob(id) {
    try {
      await db.jobs.delete(id);
      // Also delete related candidates and assessments
      await db.candidates.where('jobId').equals(id).delete();
      await db.assessments.where('jobId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  
  static async reorderJobs(fromOrder, toOrder) {
    try {
      return await db.transaction('rw', db.jobs, async () => {
        const jobs = await db.jobs.orderBy('order').toArray();
        
        // Simple reordering logic
        const fromJob = jobs.find(job => job.order === fromOrder);
        const toJob = jobs.find(job => job.order === toOrder);
        
        if (fromJob && toJob) {
          await db.jobs.update(fromJob.id, { order: toOrder });
          await db.jobs.update(toJob.id, { order: fromOrder });
        }
        
        return await db.jobs.orderBy('order').toArray();
      });
    } catch (error) {
      console.error('Error reordering jobs:', error);
      throw error;
    }
  }
  
  // Candidates
  static async getCandidates(filters = {}) {
    try {
      let query = db.candidates.orderBy('createdAt');
      
      if (filters.stage) {
        query = query.filter(candidate => candidate.stage === filters.stage);
      }
      
      if (filters.jobId) {
        query = query.filter(candidate => candidate.jobId === filters.jobId);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.filter(candidate => 
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.email.toLowerCase().includes(searchTerm)
        );
      }
      
      return await query.reverse().toArray();
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }
  
  static async getCandidateById(id) {
    try {
      console.log('DatabaseService.getCandidateById called with ID:', id);
      const candidate = await db.candidates.get(id);
      console.log('DatabaseService.getCandidateById result:', candidate);
      return candidate;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }
  
  static async createCandidate(candidateData) {
    try {
      const candidate = createCandidate(candidateData);
      console.log('Creating candidate with data:', candidate);
      
      // If an ID is provided, use put() to preserve it; otherwise use add() to let Dexie generate one
      let id;
      if (candidate.id) {
        // Use put() to preserve the specific ID
        id = await db.candidates.put(candidate);
        console.log('Candidate created with preserved ID:', id);
      } else {
        // Use add() to let Dexie generate the ID
        id = await db.candidates.add(candidate);
        console.log('Candidate created with generated ID:', id);
      }
      
      // Create initial timeline event
      await this.createTimelineEvent({
        candidateId: id,
        type: 'stage_change',
        title: 'Application Submitted',
        description: 'Candidate applied for the position',
        metadata: { stage: candidate.stage },
      });
      
      return { ...candidate, id };
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }
  
  static async updateCandidate(id, updates) {
    try {
      const oldCandidate = await db.candidates.get(id);
      await db.candidates.update(id, updates);
      
      // Create timeline event if stage changed
      if (updates.stage && updates.stage !== oldCandidate?.stage) {
        await this.createTimelineEvent({
          candidateId: id,
          type: 'stage_change',
          title: `Stage Changed to ${updates.stage}`,
          description: `Candidate moved from ${oldCandidate?.stage} to ${updates.stage}`,
          metadata: { 
            fromStage: oldCandidate?.stage, 
            toStage: updates.stage 
          },
        });
      }
      
      return await db.candidates.get(id);
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }
  
  static async deleteCandidate(id) {
    try {
      await db.candidates.delete(id);
      // Also delete related timeline events and notes
      await db.timelineEvents.where('candidateId').equals(id).delete();
      await db.notes.where('candidateId').equals(id).delete();
      await db.assessmentResponses.where('candidateId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }
  
  // Timeline Events
  static async getCandidateTimeline(candidateId) {
    try {
      const events = await db.timelineEvents
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Sort by createdAt in descending order (newest first)
      return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }
  
  static async createTimelineEvent(eventData) {
    try {
      const event = createTimelineEvent(eventData);
      const id = await db.timelineEvents.add(event);
      return { ...event, id };
    } catch (error) {
      console.error('Error creating timeline event:', error);
      throw error;
    }
  }
  
  // Notes
  static async getCandidateNotes(candidateId) {
    try {
      const notes = await db.notes
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Sort by createdAt in descending order (newest first)
      return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }
  
  static async createNote(noteData) {
    try {
      const note = createNote(noteData);
      const id = await db.notes.add(note);
      
      // Create timeline event for note
      await this.createTimelineEvent({
        candidateId: noteData.candidateId,
        type: 'note_added',
        title: 'Note Added',
        description: 'A new note was added to the candidate',
        metadata: { noteId: id },
      });
      
      return { ...note, id };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }
  
  static async updateNote(id, updates) {
    try {
      await db.notes.update(id, updates);
      return await db.notes.get(id);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }
  
  static async deleteNote(id) {
    try {
      await db.notes.delete(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
  
  // Assessments
  static async getAssessments() {
    try {
      return await db.assessments.toArray();
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  static async getAssessmentByJobId(jobId) {
    try {
      return await db.assessments.where('jobId').equals(jobId).first();
    } catch (error) {
      console.error('Error fetching assessment:', error);
      throw error;
    }
  }
  
  static async createAssessment(assessmentData) {
    try {
      const assessment = createAssessment(assessmentData);
      console.log('Creating assessment with data:', assessment);
      
      // If an ID is provided, use put() to preserve it; otherwise use add() to let Dexie generate one
      let id;
      if (assessment.id) {
        id = await db.assessments.put(assessment);
        console.log('Assessment created with preserved ID:', id);
      } else {
        id = await db.assessments.add(assessment);
        console.log('Assessment created with generated ID:', id);
      }
      
      return { ...assessment, id };
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }
  
  static async updateAssessment(id, updates) {
    try {
      await db.assessments.update(id, updates);
      return await db.assessments.get(id);
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  static async deleteAssessment(id) {
    try {
      await db.assessments.delete(id);
      await db.assessmentResponses.where('assessmentId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }
  
  // Assessment Responses
  static async getAssessmentResponse(candidateId, assessmentId) {
    try {
      return await db.assessmentResponses
        .where('[candidateId+assessmentId]')
        .equals([candidateId, assessmentId])
        .first();
    } catch (error) {
      console.error('Error fetching assessment response:', error);
      throw error;
    }
  }
  
  static async createAssessmentResponse(responseData) {
    try {
      const response = createAssessmentResponse(responseData);
      const id = await db.assessmentResponses.add(response);
      
      // Create timeline event
      await this.createTimelineEvent({
        candidateId: responseData.candidateId,
        type: 'assessment_completed',
        title: 'Assessment Completed',
        description: 'Candidate completed the assessment',
        metadata: { assessmentId: responseData.assessmentId, responseId: id },
      });
      
      return { ...response, id };
    } catch (error) {
      console.error('Error creating assessment response:', error);
      throw error;
    }
  }
  
  // Utility methods
  static async clearAllData() {
    try {
      await db.transaction('rw', db.jobs, db.candidates, db.assessments, 
        db.timelineEvents, db.notes, db.assessmentResponses, async () => {
        await db.jobs.clear();
        await db.candidates.clear();
        await db.assessments.clear();
        await db.timelineEvents.clear();
        await db.notes.clear();
        await db.assessmentResponses.clear();
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
  
  static async getStats() {
    try {
      const [jobCount, candidateCount, assessmentCount] = await Promise.all([
        db.jobs.count(),
        db.candidates.count(),
        db.assessments.count(),
      ]);
      
      return {
        jobs: jobCount,
        candidates: candidateCount,
        assessments: assessmentCount,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
  
  // Job Applications
  static async createJobApplication(applicationData) {
    try {
      const application = createJobApplication(applicationData);
      const id = await db.jobApplications.add(application);
      
      // Create timeline event
      await this.createTimelineEvent({
        candidateId: applicationData.candidateId,
        type: 'job_application',
        title: `Applied for ${applicationData.jobTitle}`,
        description: `Candidate applied for the ${applicationData.jobTitle} position`,
        metadata: { 
          jobId: applicationData.jobId, 
          applicationId: id,
          status: applicationData.status 
        },
      });
      
      return { ...application, id };
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }
  
  static async updateJobApplication(id, updates) {
    try {
      await db.jobApplications.update(id, updates);
      return await db.jobApplications.get(id);
    } catch (error) {
      console.error('Error updating job application:', error);
      throw error;
    }
  }
  
  static async getCandidateJobApplications(candidateId) {
    try {
      const applications = await db.jobApplications
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Get job details for each application
      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await db.jobs.get(app.jobId);
          return {
            ...app,
            jobTitle: job?.title || app.jobTitle,
            jobDetails: job,
          };
        })
      );
      
      return applicationsWithJobs;
    } catch (error) {
      console.error('Error fetching candidate job applications:', error);
      throw error;
    }
  }
  
  static async getJobApplicationsByStatus(status) {
    try {
      const applications = await db.jobApplications
        .where('status')
        .equals(status)
        .toArray();
      
      // Get job and candidate details
      const applicationsWithDetails = await Promise.all(
        applications.map(async (app) => {
          const [job, candidate] = await Promise.all([
            db.jobs.get(app.jobId),
            db.candidates.get(app.candidateId),
          ]);
          return {
            ...app,
            jobTitle: job?.title || app.jobTitle,
            jobDetails: job,
            candidateDetails: candidate,
          };
        })
      );
      
      return applicationsWithDetails;
    } catch (error) {
      console.error('Error fetching job applications by status:', error);
      throw error;
    }
  }
  
  static async getCandidateJobStatus(candidateId) {
    try {
      const applications = await this.getCandidateJobApplications(candidateId);
      
      const statusSummary = {
        totalApplications: applications.length,
        hired: applications.filter(app => app.status === 'hired'),
        rejected: applications.filter(app => app.status === 'rejected'),
        interviewScheduled: applications.filter(app => 
          app.status === 'screen' || app.status === 'tech' || app.status === 'offer'
        ),
        applied: applications.filter(app => app.status === 'applied'),
      };
      
      return {
        applications,
        statusSummary,
      };
    } catch (error) {
      console.error('Error getting candidate job status:', error);
      throw error;
    }
  }
  
  static async applyCandidateToJob(candidateId, jobId) {
    try {
      const job = await db.jobs.get(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Check if candidate already applied to this job
      const existingApplication = await db.jobApplications
        .where('[candidateId+jobId]')
        .equals([candidateId, jobId])
        .first();
      
      if (existingApplication) {
        throw new Error('Candidate has already applied to this job');
      }
      
      const application = await this.createJobApplication({
        candidateId,
        jobId,
        jobTitle: job.title,
        status: 'applied',
      });
      
      return application;
    } catch (error) {
      console.error('Error applying candidate to job:', error);
      throw error;
    }
  }
  
  static async updateJobApplicationStatus(applicationId, newStatus, notes = '') {
    try {
      const application = await db.jobApplications.get(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }
      
      const oldStatus = application.status;
      await this.updateJobApplication(applicationId, {
        status: newStatus,
        notes: notes || application.notes,
        updatedAt: new Date().toISOString(),
      });
      
      // Create timeline event
      await this.createTimelineEvent({
        candidateId: application.candidateId,
        type: 'status_change',
        title: `Status changed to ${newStatus}`,
        description: `Application status changed from ${oldStatus} to ${newStatus}`,
        metadata: { 
          jobId: application.jobId,
          applicationId,
          oldStatus,
          newStatus,
          notes 
        },
      });
      
      return await db.jobApplications.get(applicationId);
    } catch (error) {
      console.error('Error updating job application status:', error);
      throw error;
    }
  }

  // Debug method to help troubleshoot issues
  static async debugCandidateById(id) {
    try {
      console.log('Debug: Looking for candidate with ID:', id);
      
      // Check if candidate exists
      const candidate = await db.candidates.get(id);
      console.log('Debug: Candidate found:', candidate);
      
      if (!candidate) {
        // Check all candidates to see what IDs exist
        const allCandidates = await db.candidates.toArray();
        console.log('Debug: All candidate IDs:', allCandidates.map(c => c.id));
        console.log('Debug: Total candidates:', allCandidates.length);
      }
      
      return candidate;
    } catch (error) {
      console.error('Debug: Error checking candidate:', error);
      throw error;
    }
  }
  
  static async debugJobById(id) {
    try {
      console.log('Debug: Looking for job with ID:', id);
      
      // Check if job exists
      const job = await db.jobs.get(id);
      console.log('Debug: Job found:', job);
      
      if (!job) {
        // Check all jobs to see what IDs exist
        const allJobs = await db.jobs.toArray();
        console.log('Debug: All job IDs:', allJobs.map(j => j.id));
        console.log('Debug: Total jobs:', allJobs.length);
      }
      
      return job;
    } catch (error) {
      console.error('Debug: Error checking job:', error);
      throw error;
    }
  }
}

export default DatabaseService;
