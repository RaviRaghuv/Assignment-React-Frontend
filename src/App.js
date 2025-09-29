import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DatabaseService } from './services/database';
import { generateSeedData, generateJobApplications } from './data/seedData';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import JobDetail from './pages/JobDetail';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetail from './pages/CandidateDetail';
import AssessmentsPage from './pages/AssessmentsPage';
import AssessmentBuilder from './pages/AssessmentBuilder';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize database with seed data if empty
    const initializeData = async () => {
      try {
        const stats = await DatabaseService.getStats();
        console.log('Database initialization - current stats:', stats);
        
        // If no data exists, seed the database
        if (stats.jobs === 0) {
          console.log('Seeding database with initial data...');
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
          
          // Add job applications
          const jobApplications = generateJobApplications(seedData.candidates, seedData.jobs);
          for (const application of jobApplications) {
            await DatabaseService.createJobApplication(application);
          }
          
          console.log('Database seeded successfully!');
          console.log('Final stats after seeding:', await DatabaseService.getStats());
        } else {
          console.log('Database already has data, skipping seeding');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initializeData();
  }, []);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/candidates/:id" element={<CandidateDetail />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;