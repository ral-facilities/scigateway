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
      console.log(
        'document.getElementById(elemId)',
        document.getElementById(elemId)
      );
      // find the element with the ID specified by the fragment
      // scroll to the element if found
      const elem = document.getElementById(elemId);
      if (elem) {
        // note: there is a problem where when this hook is run
        // even though the element that should be scrolled to is found
        // it is not actually mounted to the actual DOM yet
        // (I suspect it is a synchronization issue between the vDOM and the browser DOM,
        //  where the element is in the vDOM but not in the browser DOM)
        // setTimeout is a hacky solution to it. we wait for a tiny amount of time (100ms)
        // to wait for the element to be properly mounted, then we call scrollIntoView.
        // I tried to find better solutions online, but a lot of people point to setTimeout as the solution.
        setTimeout(() => {
          console.log('scrolled into view');
          elem.scrollIntoView(true);
        }, 100);
      }
    }
  }, [hash, isSiteLoading]);
}

export default useAnchor;
