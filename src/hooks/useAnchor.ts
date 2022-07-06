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
      const elem = document.getElementById(elemId);
      if (elem) {
        // TODO: Remove usage of setTimeout after upgrade to React 18.
        //
        // useEffect does not work well with Suspense in React <18.
        // When any child of Suspense are suspended, React will add 'display: none' to hide all the children of Suspense
        // and show the fallback component. This means unsuspended children are still mounted despite being hidden
        // which also means useEffect is still called on them. at that point, the tree/DOM is "suspended" and unstable
        // so accessing the DOM will result in unexpected results.
        //
        // unfortunately, there is no good way to tell when the tree is no longer suspended and when the DOM is stable,
        // so the only hacky way is to set a short delay before accessing the DOM,
        // hoping that the tree will finish suspending and the DOM will be stable after the delay.
        //
        // related issue: https://github.com/facebook/react/issues/14536
        setTimeout(() => {
          elem.scrollIntoView(true);
        }, 100);
      }
    }
  }, [hash, isSiteLoading]);
}

export default useAnchor;
