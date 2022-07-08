import React from 'react';
import { styled } from '@mui/material/styles';
import Preloader from './preloader/preloader.component';
import MainAppBar from './mainAppBar/mainAppBar.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import Routing from './routing/routing.component';
import Tour from './tour/tour.component';
import CookieConsent from './cookieConsent/cookieConsent.component';
import Footer from './footer/footer.component';

const RootDiv = styled('div')(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.default,
  minHeight: '100vh',
}));

const PageContainer = (): React.ReactElement => {
  return (
    <RootDiv>
      <Preloader fullScreen={true} />
      <MainAppBar />
      <NavigationDrawer />
      <Tour />
      <CookieConsent />
      <Routing />
      <Footer />
    </RootDiv>
  );
};

export default PageContainer;
