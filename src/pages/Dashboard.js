import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../services/database';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { STAGE_LABELS } from '../types';
import JobApplicationStats from '../components/JobApplicationStats';


export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    recentCandidates: [],
    stageDistribution: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [jobStats, candidateStats, recentCandidates] = await Promise.all([
        DatabaseService.getStats(),
        DatabaseService.getCandidates({}),
        DatabaseService.getCandidates({}).then(candidates => 
          candidates.slice(0, 5)
        ),
      ]);

      // Calculate stage distribution
      const stageDistribution = candidateStats.reduce((acc, candidate) => {
        acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
        return acc;
      }, {});

      // Get active jobs count
      const activeJobs = await DatabaseService.getJobs({ status: 'active' });

      setStats({
        totalJobs: jobStats.jobs,
        activeJobs: activeJobs.length,
        totalCandidates: jobStats.candidates,
        recentCandidates,
        stageDistribution,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Jobs',
      value: stats.totalJobs,
      icon: BriefcaseIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      href: '/app/jobs',
      trend: '+12%',
      trendUp: true,
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs,
      icon: FireIcon,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      href: '/app/jobs?status=active',
      trend: '+8%',
      trendUp: true,
    },
    {
      name: 'Total Candidates',
      value: stats.totalCandidates,
      icon: UsersIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      href: '/app/candidates',
      trend: '+24%',
      trendUp: true,
    },
    {
      name: 'Assessments',
      value: stats.totalCandidates > 0 ? Math.floor(stats.totalCandidates / 3) : 0,
      icon: ClipboardDocumentListIcon,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-600',
      href: '/app/assessments',
      trend: '+15%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="mt-2 text-primary-100 text-lg">
                Here's what's happening with your hiring pipeline
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="text-right">
                <p className="text-sm text-primary-100">Last updated</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

       
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-1"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    {stat.trendUp ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View details
                  <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Candidates - Modern Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Recent Candidates
                      </h3>
                      <p className="text-sm text-gray-600">Latest additions to your pipeline</p>
                    </div>
                  </div>
                  <Link
                    to="/app/candidates"
                    className="group/link flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span>View all</span>
                    <svg className="h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentCandidates.map((candidate, index) => (
                    <div 
                      key={candidate.id} 
                      className="group/candidate flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover/candidate:shadow-xl transition-all duration-300">
                            <span className="text-sm font-bold text-white">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover/candidate:text-gray-800 transition-colors">
                            {candidate.name}
                          </p>
                          <p className="text-sm text-gray-500 group-hover/candidate:text-gray-600 transition-colors">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ${
                          candidate.stage === 'hired' ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300' :
                          candidate.stage === 'rejected' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' :
                          candidate.stage === 'offer' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' :
                          'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                        }`}>
                          {STAGE_LABELS[candidate.stage]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Overview - Modern Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500"></div>
            <div className="relative">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Pipeline Overview
                    </h3>
                    <p className="text-sm text-gray-600">Track candidate progress through stages</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(stats.stageDistribution).map(([stage, count], index) => (
                    <div 
                      key={stage} 
                      className="group/stage flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-purple-200/50 transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 shadow-md group-hover/stage:shadow-lg transition-all duration-300">
                            <ClockIcon className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 group-hover/stage:text-gray-800 transition-colors">
                            {STAGE_LABELS[stage]}
                          </span>
                          <p className="text-xs text-gray-500">Candidates in this stage</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900 group-hover/stage:text-gray-800 transition-colors">{count}</span>
                          <p className="text-xs text-gray-500">
                            {stats.totalCandidates > 0 ? Math.round((count / stats.totalCandidates) * 100) : 0}%
                          </p>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-3 shadow-inner group-hover/stage:shadow-md transition-all duration-300">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full shadow-sm transition-all duration-700 group-hover/stage:shadow-md" 
                            style={{ 
                              width: `${stats.totalCandidates > 0 ? (count / stats.totalCandidates) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Applications Stats - Modern Card */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500"></div>
          <div className="relative">
            <JobApplicationStats />
          </div>
        </div>

        {/* Quick Actions - Modern Design */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                  <BoltIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-gray-600">Get things done faster</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/app/jobs?action=create"
                  className="group/action relative overflow-hidden rounded-2xl border-2 border-dashed border-blue-200/50 p-6 hover:border-blue-300/70 hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-blue-100/60 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 group-hover/action:from-blue-200 group-hover/action:to-blue-300 transition-all duration-300 shadow-lg group-hover/action:shadow-xl">
                      <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="mt-4 block text-sm font-semibold text-gray-900 group-hover/action:text-blue-700 transition-colors">
                      Create Job
                    </span>
                    <span className="mt-1 text-xs text-gray-500 group-hover/action:text-gray-600 transition-colors">
                      Post a new position
                    </span>
                  </div>
                </Link>
                
                <Link
                  to="/app/candidates?action=create"
                  className="group/action relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-200/50 p-6 hover:border-purple-300/70 hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-purple-100/60 focus:outline-none focus:ring-4 focus:ring-purple-100/50 focus:border-purple-400/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100 to-purple-200 group-hover/action:from-purple-200 group-hover/action:to-purple-300 transition-all duration-300 shadow-lg group-hover/action:shadow-xl">
                      <UsersIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <span className="mt-4 block text-sm font-semibold text-gray-900 group-hover/action:text-purple-700 transition-colors">
                      Add Candidate
                    </span>
                    <span className="mt-1 text-xs text-gray-500 group-hover/action:text-gray-600 transition-colors">
                      Add to pipeline
                    </span>
                  </div>
                </Link>
                
                <Link
                  to="/app/assessments"
                  className="group/action relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-200/50 p-6 hover:border-orange-300/70 hover:bg-gradient-to-br hover:from-orange-50/80 hover:to-orange-100/60 focus:outline-none focus:ring-4 focus:ring-orange-100/50 focus:border-orange-400/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-200 group-hover/action:from-orange-200 group-hover/action:to-orange-300 transition-all duration-300 shadow-lg group-hover/action:shadow-xl">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <span className="mt-4 block text-sm font-semibold text-gray-900 group-hover/action:text-orange-700 transition-colors">
                      Build Assessment
                    </span>
                    <span className="mt-1 text-xs text-gray-500 group-hover/action:text-gray-600 transition-colors">
                      Create evaluation
                    </span>
                  </div>
                </Link>
                
                <Link
                  to="/app/candidates"
                  className="group/action relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200/50 p-6 hover:border-emerald-300/70 hover:bg-gradient-to-br hover:from-emerald-50/80 hover:to-emerald-100/60 focus:outline-none focus:ring-4 focus:ring-emerald-100/50 focus:border-emerald-400/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-200 group-hover/action:from-emerald-200 group-hover/action:to-emerald-300 transition-all duration-300 shadow-lg group-hover/action:shadow-xl">
                      <UsersIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <span className="mt-4 block text-sm font-semibold text-gray-900 group-hover/action:text-emerald-700 transition-colors">
                      View Pipeline
                    </span>
                    <span className="mt-1 text-xs text-gray-500 group-hover/action:text-gray-600 transition-colors">
                      Track progress
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
