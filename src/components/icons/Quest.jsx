import React from "react";

const Quest = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M23 18H9V19H23V18Z" fill="white" />
      <path d="M23 12H9V13H23V12Z" fill="white" />
      <path d="M23 6H9V7H23V6Z" fill="white" />
      <path
        d="M7 15H8V17H7V18H6V19H5V20H4V21H3V20H2V19H1V17H2V18H3V19H4V18H5V17H6V16H7V15Z"
        fill="white"
      />
      <path
        d="M8 9V11H7V12H6V13H5V14H4V15H3V14H2V13H1V11H2V12H3V13H4V12H5V11H6V10H7V9H8Z"
        fill="white"
      />
      <path
        d="M8 3V5H7V6H6V7H5V8H4V9H3V8H2V7H1V5H2V6H3V7H4V6H5V5H6V4H7V3H8Z"
        fill="white"
      />
    </svg>
  );
};

export default Quest;
