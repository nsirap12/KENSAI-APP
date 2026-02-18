
import React from 'react';

const WrenchScrewdriverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m0 0L11.42 15.17m5.878-5.878L15.17 11.42m5.878-5.878L21 17.25M3.375 10.5 21 10.5m-17.625 0L3.375 19.5m0-9L12.75 3" 
    />
  </svg>
);

export default WrenchScrewdriverIcon;
