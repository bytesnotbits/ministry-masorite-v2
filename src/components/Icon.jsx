// src/components/Icon.jsx

import React from 'react';

function Icon({ name, className }) {
  let iconPath;

  switch (name) {
    case 'notAtHome':
      iconPath = <path d="M3.05 13H1V11H3.05C3.5 6.83 6.83 3.5 11 3.05V1H13V3.05C17.17 3.5 20.5 6.83 20.95 11H23V13H20.95C20.5 17.17 17.17 20.5 13 20.95V23H11V20.95C6.83 20.5 3.5 17.17 3.05 13M12 5C8.13 5 5 8.13 5 12S8.13 19 12 19 19 15.87 19 12 15.87 5 12 5M11.13 17.25H12.88V15.5H11.13V17.25M12 6.75C10.07 6.75 8.5 8.32 8.5 10.25H10.25C10.25 9.28 11.03 8.5 12 8.5S13.75 9.28 13.75 10.25C13.75 12 11.13 11.78 11.13 14.63H12.88C12.88 12.66 15.5 12.44 15.5 10.25C15.5 8.32 13.93 6.75 12 6.75Z" />;
      break;
    case 'notInterested':
      iconPath = <path d="M12,4A4,4 0 0,1 16,8C16,9.95 14.6,11.58 12.75,11.93L8.07,7.25C8.42,5.4 10.05,4 12,4M12.28,14L18.28,20L20,21.72L18.73,23L15.73,20H4V18C4,16.16 6.5,14.61 9.87,14.14L2.78,7.05L4.05,5.78L12.28,14M20,18V19.18L15.14,14.32C18,14.93 20,16.35 20,18Z" />;
      break;
    case 'mailbox':
      iconPath = <path d="M8,4A5,5 0 0,0 3,9V18H1V20H21A2,2 0 0,0 23,18V9A5,5 0 0,0 18,4H8M8,6A3,3 0 0,1 11,9V18H5V9A3,3 0 0,1 8,6M13,13V7H17V9H15V13H13Z" />;
      break;
    case 'noTrespassing':
      iconPath = <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z" />;
      break;
    case 'gate':
      iconPath = <path d="M9 6V11H7V7H5V11H3V9H1V21H3V19H5V21H7V19H9V21H11V19H13V21H15V19H17V21H19V19H21V21H23V9H21V11H19V7H17V11H15V6H13V11H11V6H9M3 13H5V17H3V13M7 13H9V17H7V13M11 13H13V17H11V13M15 13H17V17H15V13M19 13H21V17H19V13Z" />;
      break;
    case 'returnVisit':
        iconPath = <path d="M4,16H7V22H4V16M19,2.39C18.92,3.86 18.55,5.13 17.86,6.21C17.17,7.29 16.22,8 15,8.39V22H13V16H11V22H9V10.08C8.72,10.17 8.5,10.28 8.39,10.41C7.45,11.16 7,12.19 7,13.5V14H5V13.5C5,11.53 5.72,9.94 7.13,8.72C8.53,7.56 10.16,7 12,7C13.41,7 14.56,6.64 15.47,5.95C16.5,5.11 17,3.95 17,2.5V2H19V2.39M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2Z" />;
        break;
    case 'dbUploadDownload':
        iconPath = <path d="M19 13C19.34 13 19.67 13.04 20 13.09V8L14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H13.81C13.3 21.12 13 20.1 13 19C13 15.69 15.69 13 19 13M13 3.5L18.5 9H13V3.5M23.5 20L21 23L18.5 20H20V16H22V20H23.5M19.5 18H18V22H16V18H14.5L17 15L19.5 18Z" />;
        break;
    case 'letter':
        iconPath = <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />;
        break;

    default:
      iconPath = null;
  }

  if (!iconPath) {
    return null; // Don't render anything if the icon name is unknown
  }

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      {iconPath}
    </svg>
  );
}

export default Icon;
