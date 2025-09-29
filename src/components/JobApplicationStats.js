import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../types';
import Card from './ui/Card';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarDaysIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  [CANDIDATE_STAGES.APPLIED]: 'text-blue-600',
  [CANDIDATE_STAGES.SCREEN]: 'text-yellow-600',
  [CANDIDATE_STAGES.TECH]: 'text-orange-600',
  [CANDIDATE_STAGES.OFFER]: 'text-purple-600',
  [CANDIDATE_STAGES.HIRED]: 'text-green-600',
  [CANDIDATE_STAGES.REJECTED]: 'text-red-600',
};

const STATUS_ICONS = {
  [CANDIDATE_STAGES.APPLIED]: ClockIcon,
  [CANDIDATE_STAGES.SCREEN]: CalendarDaysIcon,
  [CANDIDATE_STAGES.TECH]: CalendarDaysIcon,
  [CANDIDATE_STAGES.OFFER]: CalendarDaysIcon,
  [CANDIDATE_STAGES.HIRED]: CheckCircleIcon,
  [CANDIDATE_STAGES.REJECTED]: XCircleIcon,
};

export default function JobApplicationStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get all job applications grouped by status
      const allApplications = await Promise.all(
        Object.values(CANDIDATE_STAGES).map(async (status) => {
          const applications = await DatabaseService.getJobApplicationsByStatus(status);
          return { status, applications };
        })
      );
      
      // Calculate summary statistics
      const totalApplications = allApplications.reduce((sum, group) => sum + group.applications.length, 0);
      const hiredCount = allApplications.find(g => g.status === CANDIDATE_STAGES.HIRED)?.applications.length || 0;
      const rejectedCount = allApplications.find(g => g.status === CANDIDATE_STAGES.REJECTED)?.applications.length || 0;
      const interviewCount = allApplications
        .filter(g => [CANDIDATE_STAGES.SCREEN, CANDIDATE_STAGES.TECH, CANDIDATE_STAGES.OFFER].includes(g.status))
        .reduce((sum, group) => sum + group.applications.length, 0);
      
      setStats({
        totalApplications,
        hiredCount,
        rejectedCount,
        interviewCount,
        byStatus: allApplications.reduce((acc, group) => {
          acc[group.status] = group.applications.length;
          return acc;
        }, {}),
      });
    } catch (error) {
      console.error('Error loading job application stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
          <BriefcaseIcon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-3">
          <h3 className="text-xl font-bold text-gray-900">Job Applications Overview</h3>
          <p className="text-sm text-gray-600">Track application progress and outcomes</p>
        </div>
      </div>
      
      {/* Summary Stats - Modern Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/50 p-4 hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 transform hover:scale-105">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{stats.totalApplications}</div>
            <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">Total Applications</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 backdrop-blur-sm border border-emerald-200/50 p-4 hover:shadow-lg hover:border-emerald-300/50 transition-all duration-300 transform hover:scale-105">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">{stats.hiredCount}</div>
            <div className="text-sm text-emerald-500 group-hover:text-emerald-600 transition-colors">Hired</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/80 to-red-100/60 backdrop-blur-sm border border-red-200/50 p-4 hover:shadow-lg hover:border-red-300/50 transition-all duration-300 transform hover:scale-105">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">{stats.rejectedCount}</div>
            <div className="text-sm text-red-500 group-hover:text-red-600 transition-colors">Rejected</div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 backdrop-blur-sm border border-yellow-200/50 p-4 hover:shadow-lg hover:border-yellow-300/50 transition-all duration-300 transform hover:scale-105">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">{stats.interviewCount}</div>
            <div className="text-sm text-yellow-500 group-hover:text-yellow-600 transition-colors">In Interview</div>
          </div>
        </div>
      </div>
      
      {/* Status Breakdown - Modern Design */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mr-3"></div>
          Status Breakdown
        </h4>
        <div className="space-y-3">
          {Object.entries(stats.byStatus).map(([status, count], index) => {
            const Icon = STATUS_ICONS[status];
            return (
              <div 
                key={status} 
                className="group/stage flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-indigo-200/50 transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 shadow-md group-hover/stage:shadow-lg transition-all duration-300">
                    <Icon className={`h-5 w-5 ${STATUS_COLORS[status]}`} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 group-hover/stage:text-gray-800 transition-colors">{STAGE_LABELS[status]}</span>
                    <p className="text-xs text-gray-500">Applications in this stage</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-bold ${STATUS_COLORS[status]} group-hover/stage:text-gray-800 transition-colors`}>
                    {count}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2 shadow-inner group-hover/stage:shadow-md transition-all duration-300">
                    <div 
                      className={`h-2 rounded-full shadow-sm transition-all duration-500 ${
                        status === 'hired' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                        status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        status === 'offer' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                      style={{ 
                        width: `${stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
