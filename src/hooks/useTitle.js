// src/hooks/useTitle.js
import { useEffect } from 'react';

function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title; // Store the previous title
    document.title = title;
    return () => {
      document.title = prevTitle; // Revert to previous title on unmount
    };
  }, [title]); // Rerun if the 'title' prop changes
}

export default useTitle;