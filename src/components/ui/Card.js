import React from 'react';
import { clsx } from 'clsx';

const Card = ({ children, className = '', hover = false, ...props }) => (
  <div
    className={clsx(
      'bg-white overflow-hidden shadow-soft rounded-xl border border-gray-100 transition-all duration-300',
      hover && 'hover:shadow-medium hover:scale-[1.02] hover:border-primary-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={clsx('px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div
    className={clsx('px-6 py-6', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={clsx('px-6 py-4 border-t border-gray-100 bg-gray-50/50', className)}
    {...props}
  >
    {children}
  </div>
);

export default Card;
