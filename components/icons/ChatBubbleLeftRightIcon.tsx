import React from 'react';

const ChatBubbleLeftRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72.372a3.523 3.523 0 0 1-1.028 0l-3.72-.372c-1.133-.093-1.98-1.057-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097M16.5 6.75l3 3m0 0l-3 3m3-3H6.75m-1.5-3-3-3m0 0l3-3m-3 3h12.75"
    />
  </svg>
);

export default ChatBubbleLeftRightIcon;