import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import TalentFlowLogo from '../components/TalentFlowLogo';

export default function LandingPage() {
  const features = [
    {
      icon: BriefcaseIcon,
      title: "Job Management",
      description: "Create, edit, and manage job postings with advanced filtering, search, and drag-and-drop reordering.",
      highlights: [
        "Create & edit job postings",
        "Advanced search & filtering",
        "Drag-and-drop reordering",
        "Archive/unarchive jobs",
        "Deep linking support"
      ]
    },
    {
      icon: UsersIcon,
      title: "Candidate Pipeline",
      description: "Track candidates through the hiring process with kanban boards, detailed profiles, and timeline tracking.",
      highlights: [
        "Kanban board view",
        "Candidate profiles",
        "Stage progression tracking",
        "Timeline & activity logs",
        "Notes with @mentions"
      ]
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Assessment Builder",
      description: "Build comprehensive assessments with multiple question types, validation rules, and conditional logic.",
      highlights: [
        "Multiple question types",
        "Live preview mode",
        "Validation rules",
        "Conditional questions",
        "Response tracking"
      ]
    },
    {
      icon: SparklesIcon,
      title: "Analytics Dashboard",
      description: "Get insights into your hiring process with real-time statistics and candidate distribution.",
      highlights: [
        "Real-time statistics",
        "Stage distribution",
        "Recent activity",
        "Performance metrics",
        "Visual charts"
      ]
    }
  ];

  const questionTypes = [
    { name: "Single Choice", color: "bg-blue-100 text-blue-800" },
    { name: "Multiple Choice", color: "bg-green-100 text-green-800" },
    { name: "Short Text", color: "bg-yellow-100 text-yellow-800" },
    { name: "Long Text", color: "bg-purple-100 text-purple-800" },
    { name: "Numeric", color: "bg-orange-100 text-orange-800" },
    { name: "File Upload", color: "bg-gray-100 text-gray-800" }
  ];

  const stats = [
    { label: "Active Jobs", value: "25+" },
    { label: "Candidates", value: "1000+" },
    { label: "Assessments", value: "5+" },
    { label: "Question Types", value: "6" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <div className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TalentFlowLogo size="default" className="text-primary-600" />
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                to="/app/jobs" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Jobs
              </Link>
              <Link 
                to="/app/candidates" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Candidates
              </Link>
              <Link 
                to="/app/assessments" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Assessments
              </Link>
              <Link 
                to="/app/dashboard" 
                className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
          
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Built on Trust
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                {" "}Designed for HR
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              TalentFlow is a comprehensive hiring platform that helps HR teams manage jobs, 
              track candidates, and build assessments with modern, intuitive interfaces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg">
                  <RocketLaunchIcon className="h-6 w-6 mr-2" />
                  Get Started
                </Button>
              </Link>
              <Link to="/app/jobs">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <BriefcaseIcon className="h-6 w-6 mr-2" />
                  View Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Hire Better
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools you need to manage the entire hiring process 
              from job posting to candidate assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardBody className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-xl bg-primary-100">
                        <feature.icon className="h-8 w-8 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-700">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Builder Showcase */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Assessment Builder
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create comprehensive assessments with multiple question types, validation rules, 
              and conditional logic to evaluate candidates effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Question Types & Features
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {questionTypes.map((type, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${type.color}`}>
                      {type.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Validation Rules</h4>
                    <p className="text-gray-600">Required fields, length limits, numeric ranges, and regex patterns</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CpuChipIcon className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Conditional Logic</h4>
                    <p className="text-gray-600">Show questions based on previous answers for dynamic assessments</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <GlobeAltIcon className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Live Preview</h4>
                    <p className="text-gray-600">See exactly how your assessment will look to candidates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="mb-6">
                  <TalentFlowLogo size="xl" variant="modern" className="justify-center" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Build?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start creating assessments for your job postings and evaluate candidates effectively.
                </p>
                <Link to="/app/assessments">
                  <Button className="w-full">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Build Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is built using the latest technologies to ensure performance, 
              reliability, and a great user experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">React 19</div>
                <div className="text-gray-600">Frontend Framework</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-cyan-600 mb-2">Tailwind CSS</div>
                <div className="text-gray-600">Styling</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-2">IndexedDB</div>
                <div className="text-gray-600">Local Storage</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-2">MSW</div>
                <div className="text-gray-600">API Simulation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of HR teams who are already using TalentFlow to streamline their hiring process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app/dashboard">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg">
                <RocketLaunchIcon className="h-6 w-6 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/app/candidates">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg">
                <UsersIcon className="h-6 w-6 mr-2 transition-transform group-hover:scale-110" />
                View Candidates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}

    </div>
  );
}
