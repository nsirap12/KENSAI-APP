
import React from 'react';

const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
            d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5m-7.5 0-1 3m7.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25l1.5 1.5L12 15l1.5-1.5 1.5-1.5M8.25 15h7.5" 
        />
    </svg>
);

export default ArchiveBoxIcon;
