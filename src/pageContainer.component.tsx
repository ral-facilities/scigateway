import React from 'react';
import {
  WithStyles,
  withStyles,
  StyleRules,
  Theme,
} from '@material-ui/core/styles';
import Preloader from './preloader/preloader.component';
import MainAppBar from './mainAppBar/mainAppBar.component';
import NavigationDrawer from './navigationDrawer/navigationDrawer.component';
import Routing from './routing/routing.component';
import Tour from './tour/tour.component';
import CookieConsent from './cookieConsent/cookieConsent.component';

const styles = (theme: Theme): StyleRules => ({
  root: {
    background: theme.palette.background.default,
    minHeight: '100vh',
  },
});

const PageContainer = (
  props: WithStyles<typeof styles>
): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Preloader />
      <MainAppBar />
      <NavigationDrawer />
      <Tour />
      <CookieConsent />
      <Routing />
    </div>
  );
};

export default withStyles(styles)(PageContainer);
