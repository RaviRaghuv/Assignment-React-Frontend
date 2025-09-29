import { Link } from 'react-router-dom';
import {
  HomeIcon as HomeIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid
} from '@heroicons/react/24/solid';
import {
  HomeIcon as HomeIconOutline,
  BriefcaseIcon as BriefcaseIconOutline,
  UserGroupIcon as UserGroupIconOutline,
  ClipboardDocumentListIcon as ClipboardDocumentListIconOutline
} from '@heroicons/react/24/outline';

const NavigationIcon = ({ to, title, IconSolid, IconOutline, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 gap-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary-100 text-primary-900'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {isActive ? (
        <IconSolid className="w-6 h-6" />
      ) : (
        <IconOutline className="w-6 h-6" />
      )}
      <span className="font-medium">{title}</span>
    </Link>
  );
};

export const DashboardIcon = ({ isActive }) => (
  <NavigationIcon
    to="/app/dashboard"
    title="Dashboard"
    IconSolid={HomeIconSolid}
    IconOutline={HomeIconOutline}
    isActive={isActive}
  />
);

export const JobsIcon = ({ isActive }) => (
  <NavigationIcon
    to="/app/jobs"
    title="Jobs"
    IconSolid={BriefcaseIconSolid}
    IconOutline={BriefcaseIconOutline}
    isActive={isActive}
  />
);

export const CandidatesIcon = ({ isActive }) => (
  <NavigationIcon
    to="/app/candidates"
    title="Candidates"
    IconSolid={UserGroupIconSolid}
    IconOutline={UserGroupIconOutline}
    isActive={isActive}
  />
);

export const AssessmentsIcon = ({ isActive }) => (
  <NavigationIcon
    to="/app/assessments"
    title="Assessments"
    IconSolid={ClipboardDocumentListIconSolid}
    IconOutline={ClipboardDocumentListIconOutline}
    isActive={isActive}
  />
);