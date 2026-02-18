
import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023 1.535-1.85 2.723-2.322m-2.723 2.322L3 19a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6m-6 3.522 3.39-3.861a1.5 1.5 0 0 0-2.071-2.071L12 15.522M9 11.25h6m-6 3h6m-6-6h6" 
    />
  </svg>
);

export default UserGroupIcon;
