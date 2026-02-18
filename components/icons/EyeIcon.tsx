import React from 'react';

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.42-7.58a1.012 1.012 0 0 1 .81-.38h8.468a1.012 1.012 0 0 1 .81.38l4.42 7.58a1.012 1.012 0 0 1 0 .639l-4.42 7.58a1.012 1.012 0 0 1-.81.38H7.266a1.012 1.012 0 0 1-.81-.38l-4.42-7.58Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

export default EyeIcon;