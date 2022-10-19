import { useLocation } from 'react-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { StateType } from '../state/state.types';

/**
 * A React hook that detects fragments in the current URL, and makes the page jump to the element with the corresponding ID if required.
 *
 * For example,
 * https://example.com#section causes useAnchor to jump to the element with ID 'section'
 */
function useAnchor(): void {
  // get the current fragment of the URL from react-router
  const { hash } = useLocation();
  const isSiteLoading = useSelector<StateType>(
    (state) => state.scigateway.siteLoading
  );

  useEffect(() => {
    // need to make sure the website is not loading,
    // if the website is not done loading and the hook runs prematurely,
    // document.getElementById will return null because the page is not rendered fully.
    // once the website is done loading, the page should be fully rendered, and the target element should be available.
    if (hash && !isSiteLoading) {
      const elemId = hash.replace('#', '');
      // find the element with the ID specified by the fragment
      // scroll to the element if found
      setTimeout(() => {
        document.getElementById(elemId)?.scrollIntoView(true);
      }, 0);
    }
  }, [hash, isSiteLoading]);
}

export default useAnchor;
