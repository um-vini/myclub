import * as React from 'react';

// Breakpoint for mobile devices in pixels
const MOBILE_BREAKPOINT = 1024;

/**
 * Custom hook to detect if the user is on a mobile device
 * based on the window width
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Define the media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Update state based on the current window width
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add event listener for window resizing/orientation changes
    mql.addEventListener('change', onChange);

    // Initial check on component mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup listener on component unmount
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Return double negation to ensure a boolean value
  return !!isMobile;
}
