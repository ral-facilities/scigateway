import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Preloader from './preloader/preloader.component';
import MainAppBar from './mainAppBar/mainAppBar.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import Routing from './routing/routing.component';
import Tour from './tour/tour.component';
import CookieConsent from './cookieConsent/cookieConsent.component';
import Footer from './footer/footer.component';
import { useMediaQuery } from '@mui/material';
import { toastr } from 'react-redux-toastr';

const RootDiv = styled('div')(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.default,
  minHeight: '100vh',
}));

const PageContainer = (): React.ReactElement => {
  const theme = useTheme();
  const isViewportMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  React.useEffect(() => {
    const clearToasts = (): void => {
      toastr.clean();
    };

    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        clearToasts();
      }
    };

    // Add event listeners for  keydown events

    document.addEventListener('keydown', handleKeyPress);

    // Clean up the event listeners when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <RootDiv>
      <Preloader fullScreen={true} />
      <MainAppBar />
      <NavigationDrawer />
      <Tour />
      <CookieConsent />
      <Routing />
      {isViewportMdOrLarger && <Footer />}
    </RootDiv>
  );
};

export default PageContainer;
