import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import TalentFlowLogo from './TalentFlowLogo';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Jobs', href: '/app/jobs', icon: BriefcaseIcon },
  { name: 'Candidates', href: '/app/candidates', icon: UsersIcon },
  { name: 'Assessments', href: '/app/assessments', icon: ClipboardDocumentListIcon },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 flex z-40 md:hidden',
        sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}>
        <div className={clsx(
          'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        )} onClick={() => setSidebarOpen(false)} />
        
        <div className={clsx(
          'relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100">
          <button
            type="button"
            className="px-4 border-r border-gray-100 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex items-center">
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                  <span className="text-sm font-medium text-primary-700">
                    HR Dashboard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <div className="flex flex-col h-0 flex-1 border-r border-gray-100 bg-white shadow-soft">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <Link to="/" className="group">
              <TalentFlowLogo 
                size="default" 
                className="group-hover:scale-105 transition-transform duration-200" 
                variant="modern"
              />
            </Link>
          </div>
          
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105',
                    isActive
                      ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-900 shadow-md border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">HT</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-700">HR Team</p>
              <p className="text-xs text-gray-500">Admin User</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
