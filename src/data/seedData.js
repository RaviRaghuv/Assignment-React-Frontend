import { 
  createJob, 
  createCandidate, 
  createAssessment, 
  createSection, 
  createQuestion,
  createJobApplication,
  JOB_STATUS,
  CANDIDATE_STAGES,
  QUESTION_TYPES 
} from '../types';

// Job titles and descriptions
const jobTemplates = [
  {
    title: "Senior Frontend Developer",
    description: "We're looking for an experienced frontend developer to join our growing team. You'll work with React, TypeScript, and modern web technologies to build amazing user experiences.",
    requirements: ["5+ years React experience", "TypeScript proficiency", "Experience with state management", "Strong CSS skills"],
    benefits: ["Competitive salary", "Health insurance", "Remote work", "Professional development"],
    tags: ["Frontend", "React", "TypeScript", "Remote"],
    location: "Remote",
    salary: "$90,000 - $120,000",
    department: "Engineering"
  },
  {
    title: "Backend Engineer",
    description: "Join our backend team to build scalable APIs and microservices. Work with Node.js, Python, and cloud technologies.",
    requirements: ["3+ years backend experience", "Node.js or Python", "Database design", "API development"],
    benefits: ["Competitive salary", "Health insurance", "Stock options", "Flexible hours"],
    tags: ["Backend", "Node.js", "Python", "APIs"],
    location: "San Francisco, CA",
    salary: "$100,000 - $140,000",
    department: "Engineering"
  },
  {
    title: "Product Manager",
    description: "Lead product strategy and work with cross-functional teams to deliver exceptional user experiences.",
    requirements: ["3+ years PM experience", "Analytical thinking", "User research", "Agile methodology"],
    benefits: ["Competitive salary", "Health insurance", "Stock options", "Unlimited PTO"],
    tags: ["Product", "Strategy", "Leadership", "Analytics"],
    location: "New York, NY",
    salary: "$110,000 - $150,000",
    department: "Product"
  },
  {
    title: "UX Designer",
    description: "Create intuitive and beautiful user experiences. Work closely with product and engineering teams.",
    requirements: ["3+ years UX experience", "Figma proficiency", "User research", "Prototyping"],
    benefits: ["Competitive salary", "Health insurance", "Design budget", "Conference attendance"],
    tags: ["UX", "Design", "Figma", "Research"],
    location: "Austin, TX",
    salary: "$80,000 - $110,000",
    department: "Design"
  },
  {
    title: "DevOps Engineer",
    description: "Build and maintain our cloud infrastructure. Work with AWS, Docker, and CI/CD pipelines.",
    requirements: ["3+ years DevOps experience", "AWS expertise", "Docker/Kubernetes", "CI/CD"],
    benefits: ["Competitive salary", "Health insurance", "Stock options", "Certification support"],
    tags: ["DevOps", "AWS", "Docker", "Infrastructure"],
    location: "Seattle, WA",
    salary: "$95,000 - $130,000",
    department: "Engineering"
  },
  {
    title: "Data Scientist",
    description: "Extract insights from data to drive business decisions. Work with machine learning and statistical analysis.",
    requirements: ["2+ years data science experience", "Python/R proficiency", "Machine learning", "Statistics"],
    benefits: ["Competitive salary", "Health insurance", "Stock options", "Research time"],
    tags: ["Data Science", "Machine Learning", "Python", "Analytics"],
    location: "Boston, MA",
    salary: "$85,000 - $120,000",
    department: "Data"
  },
  {
    title: "Marketing Manager",
    description: "Lead marketing campaigns and grow our user base. Work with digital marketing and content creation.",
    requirements: ["3+ years marketing experience", "Digital marketing", "Content creation", "Analytics"],
    benefits: ["Competitive salary", "Health insurance", "Marketing budget", "Creative freedom"],
    tags: ["Marketing", "Digital", "Content", "Growth"],
    location: "Los Angeles, CA",
    salary: "$70,000 - $95,000",
    department: "Marketing"
  },
  {
    title: "Sales Representative",
    description: "Drive revenue growth by building relationships with enterprise clients.",
    requirements: ["2+ years sales experience", "B2B sales", "CRM proficiency", "Communication skills"],
    benefits: ["Competitive base + commission", "Health insurance", "Car allowance", "Unlimited earning potential"],
    tags: ["Sales", "B2B", "Enterprise", "Relationship Building"],
    location: "Chicago, IL",
    salary: "$50,000 + Commission",
    department: "Sales"
  },
  {
    title: "QA Engineer",
    description: "Ensure product quality through comprehensive testing. Work with automated testing frameworks.",
    requirements: ["2+ years QA experience", "Test automation", "Selenium/Cypress", "Bug tracking"],
    benefits: ["Competitive salary", "Health insurance", "Learning budget", "Flexible schedule"],
    tags: ["QA", "Testing", "Automation", "Quality"],
    location: "Denver, CO",
    salary: "$65,000 - $90,000",
    department: "Engineering"
  },
  {
    title: "Customer Success Manager",
    description: "Help customers achieve their goals with our product. Drive customer satisfaction and retention.",
    requirements: ["2+ years customer success experience", "Communication skills", "Problem solving", "CRM usage"],
    benefits: ["Competitive salary", "Health insurance", "Customer visits", "Growth opportunities"],
    tags: ["Customer Success", "Retention", "Support", "Relationship Management"],
    location: "Miami, FL",
    salary: "$60,000 - $80,000",
    department: "Customer Success"
  }
];

// Generate 25 jobs
export const generateJobs = () => {
  const jobs = [];
  const jobTypes = ['full-time', 'part-time', 'contract'];
  
  for (let i = 0; i < 25; i++) {
    const template = jobTemplates[Math.floor(Math.random() * jobTemplates.length)];
    const isArchived = Math.random() < 0.2; // 20% chance of being archived
    
    const job = createJob({
      title: `${template.title} ${i > 10 ? `#${Math.floor(Math.random() * 100)}` : ''}`,
      description: template.description,
      requirements: template.requirements,
      benefits: template.benefits,
      tags: [...template.tags, `Tag${i + 1}`],
      location: template.location,
      salary: template.salary,
      type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      department: template.department,
      status: isArchived ? JOB_STATUS.ARCHIVED : JOB_STATUS.ACTIVE,
      order: i + 1,
    });
    
    jobs.push(job);
  }
  
  return jobs;
};

// Generate 1000+ candidates
export const generateCandidates = (jobs) => {
  const candidates = [];
  const firstNames = [
    'Siddharth', 'Layla', 'Aditya', 'Léa', 'Mohammed', 'Lena', 'Quinn',
    'Drew', 'Lillian', 'Svetlana', 'Jose', 'Sophia', 'Haruto', 'Avery',
    'Jordan', 'Vihaan', 'Cameron', 'Ananya', 'Chloe', 'Manon', 'Arjun',
    'Jing', 'Louis', 'Charlotte', 'Kendall', 'Nora', 'Stella', 'Wei',
    'Santiago', 'Aarav', 'Fatima', 'Penelope', 'Taylor', 'Riya', 'Finley',
    'Layla', 'Riley', 'Kabir', 'Aisha', 'Madison', 'Lukas', 'Sakura',
    'Alex', 'Amelia', 'Grace', 'Mei', 'Olivia', 'Yuki', 'Hazel', 'Zoe',
    'Kenji', 'Leon', 'Natalie', 'Isabella', 'Thiago', 'Luna', 'Kavya',
    'Ivan', 'Evelyn', 'Zion', 'Harper', 'Riley', 'Morgan', 'Ellie',
    'Emery', 'River', 'Reese', 'Lily', 'Ella', 'Audrey', 'Scarlett',
    'Hayden', 'Brooklyn', 'Parker', 'Priya', 'Mila', 'Skyler', 'Zoe',
    'Leah', 'Sam', 'Rowan', 'Elizabeth', 'Hannah', 'Diya', 'Rohan',
    'Jamie', 'Phoenix', 'Sage', 'Mateo', 'Winter', 'Violet', 'Dakota',
    'Sawyer', 'Camila', 'Blake', 'True', 'Victoria', 'Hanna', 'Gabriel',

    'Avery', 'Abigail', 'Tatum', 'Addison', 'Saanvi', 'Bella', 'Zara',
    'Zoey', 'Casey', 'Emily', 'Maria', 'Dmitri', 'Eleanor', 'Sofia',
    'Omar', 'Li', 'Emma', 'Ava', 'Aurora', 'Savannah', 'Valentina',
    'Ishaan', 'Anastasia', 'Mia', 'Aria', 'Luna', 'Aubrey', 'Aria'
  ];
  
  const lastNames = [ 
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
    'Singh', 'Kumar', 'Patel', 'Sharma', 'Khan', 'Gupta', 'Verma', 'Das',
    'Roy', 'Reddy', 'Rao', 'Jain', 'Mishra', 'Mehta', 'Shah', 'Nair',
    'Iyer', 'Jha', 'Chopra', 'Yadav', 'Aggarwal', 'Menon', 'Joshi'
  ];
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'];
  
  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    
    const stages = Object.values(CANDIDATE_STAGES);
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    const candidate = createCandidate({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      stage,
      jobId: job.id,
      coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.title} position. I believe my skills and experience make me a strong candidate for this role.\n\nBest regards,\n${firstName} ${lastName}`,
    });
    
    candidates.push(candidate);
  }
  
  return candidates;
};

// Generate assessments
export const generateAssessments = (jobs) => {
  const assessments = [];
  const selectedJobs = jobs.slice(0, 5); // Create assessments for first 5 jobs
  
  selectedJobs.forEach((job, index) => {
    const sections = [];
    
    // Technical Skills Section
    if (job.tags.includes('Frontend') || job.tags.includes('Backend') || job.tags.includes('React')) {
      sections.push(createSection({
        title: 'Technical Skills',
        description: 'Evaluate the candidate\'s technical knowledge',
        questions: [
          createQuestion({
            type: QUESTION_TYPES.SINGLE_CHOICE,
            title: 'How many years of experience do you have with React?',
            required: true,
            options: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years'],
          }),
          createQuestion({
            type: QUESTION_TYPES.MULTI_CHOICE,
            title: 'Which technologies are you familiar with?',
            required: true,
            options: ['JavaScript', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
          }),
          createQuestion({
            type: QUESTION_TYPES.LONG_TEXT,
            title: 'Describe a challenging project you worked on and how you solved it.',
            required: true,
            validation: { minLength: 100, maxLength: 1000 },
          }),
          createQuestion({
            type: QUESTION_TYPES.SHORT_TEXT,
            title: 'What is your preferred development environment?',
            required: false,
            validation: { maxLength: 200 },
          }),
          createQuestion({
            type: QUESTION_TYPES.NUMERIC,
            title: 'Rate your confidence with version control (Git) on a scale of 1-10',
            required: true,
            validation: { minValue: 1, maxValue: 10 },
          }),
        ],
      }));
    }
    
    // Problem Solving Section
    sections.push(createSection({
      title: 'Problem Solving',
      description: 'Assess critical thinking and problem-solving abilities',
      questions: [
        createQuestion({
          type: QUESTION_TYPES.SHORT_TEXT,
          title: 'How would you debug a performance issue in a web application?',
          required: true,
          validation: { maxLength: 500 },
        }),
        createQuestion({
          type: QUESTION_TYPES.NUMERIC,
          title: 'Rate your problem-solving skills on a scale of 1-10',
          required: true,
          validation: { minValue: 1, maxValue: 10 },
        }),
        createQuestion({
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'When facing a difficult problem, your first approach is:',
          required: true,
          options: [
            'Break it down into smaller parts',
            'Ask for help from colleagues',
            'Research similar problems online',
            'Try different solutions until one works'
          ],
        }),
        createQuestion({
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Describe a time when you had to learn a new technology quickly for a project.',
          required: true,
          validation: { minLength: 50, maxLength: 600 },
        }),
        createQuestion({
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'How do you prioritize tasks when multiple deadlines are approaching?',
          required: true,
          options: [
            'Focus on the most urgent task first',
            'Work on multiple tasks simultaneously',
            'Delegate when possible',
            'Reassess deadlines with stakeholders'
          ],
        }),
      ],
    }));
    
    // Cultural Fit Section
    sections.push(createSection({
      title: 'Cultural Fit',
      description: 'Understand the candidate\'s work style and values',
      questions: [
        createQuestion({
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'What motivates you most in your work?',
          required: true,
          options: [
            'Learning new technologies',
            'Solving complex problems',
            'Working with a great team',
            'Making a positive impact'
          ],
        }),
        createQuestion({
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Describe your ideal work environment and team culture.',
          required: false,
          validation: { maxLength: 800 },
        }),
        createQuestion({
          type: QUESTION_TYPES.SHORT_TEXT,
          title: 'What are your career goals for the next 2 years?',
          required: true,
          validation: { maxLength: 300 },
        }),
        createQuestion({
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'How do you prefer to receive feedback?',
          required: true,
          options: [
            'In-person meetings',
            'Written feedback',
            'Regular check-ins',
            'Peer reviews'
          ],
        }),
        createQuestion({
          type: QUESTION_TYPES.MULTI_CHOICE,
          title: 'Which work arrangements appeal to you?',
          required: true,
          options: [
            'Remote work',
            'Hybrid schedule',
            'Office-based',
            'Flexible hours',
            'Four-day work week'
          ],
        }),
      ],
    }));
    
    const assessment = createAssessment({
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Comprehensive assessment for the ${job.title} position`,
      sections,
      settings: {
        timeLimit: 60, // 60 minutes
        allowMultipleAttempts: false,
        showResults: true,
      },
    });
    
    assessments.push(assessment);
  });
  
  return assessments;
};

// Generate all seed data
export const generateSeedData = () => {
  const jobs = generateJobs();
  const candidates = generateCandidates(jobs);
  const assessments = generateAssessments(jobs);
  
  return {
    jobs,
    candidates,
    assessments,
  };
};

// Generate job applications for candidates
export const generateJobApplications = (candidates, jobs) => {
  const applications = [];
  const stages = Object.values(CANDIDATE_STAGES);
  
  // Create applications for 30% of candidates (300+ applications)
  const candidatesWithApplications = candidates.slice(0, Math.floor(candidates.length * 0.3));
  
  candidatesWithApplications.forEach((candidate) => {
    // Each candidate applies to 1-3 jobs
    const numApplications = Math.floor(Math.random() * 3) + 1;
    const appliedJobs = jobs.slice(0, numApplications);
    
    appliedJobs.forEach((job, index) => {
      // First application is usually the primary job
      if (index === 0) {
        applications.push(createJobApplication({
          candidateId: candidate.id,
          jobId: job.id,
          jobTitle: job.title,
          status: candidate.stage, // Use candidate's current stage
          appliedAt: candidate.createdAt,
          notes: index === 0 ? 'Primary application' : '',
        }));
      } else {
        // Additional applications with random status
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        applications.push(createJobApplication({
          candidateId: candidate.id,
          jobId: job.id,
          jobTitle: job.title,
          status: randomStage,
          appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Applied to ${job.title}`,
        }));
      }
    });
  });
  
  return applications;
};
