import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  WithStyles,
  Grid,
  createStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import Image from '../images/Jasmin4 _DSC7054.jpg';
import ScigatewayLogo from '../images/scigateway-white.svg';
import ExploreImage from '../images/explore.jpg';
import AnalyseImage from '../images/analyse.jpg';
import RecordImage from '../images/record.jpg';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    bigImage: {
      backgroundImage: `url("${Image}")`,
      height: 350,
      width: '100%',
      '& img': {
        paddingLeft: 80,
        paddingTop: 100,
        height: 150,
      },
    },
    howItWorks: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingLeft: '10vw',
      paddingRight: '10vw',
      paddingTop: 30,
      backgroundColor: theme.palette.background.default,
    },
    howItWorksTitle: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      paddingBottom: 30,
    },
    howItWorksGridItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    howItWorksGridItemTitle: {
      color: (theme as UKRITheme).ukri.bright.orange,
      fontWeight: 'bold',
      paddingBottom: 10,
    },
    howItWorksGridItemImage: {
      height: 250,
      width: 250,
      borderRadius: 250 / 2,
      paddingBottom: 10,
    },
    howItWorksGridItemCaption: {
      textAlign: 'center',
      color: theme.palette.secondary.main,
    },
    strapline: {
      paddingTop: 50,
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
    },
    purpose: {
      paddingTop: 20,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: theme.palette.secondary.main,
    },
  });

interface HomePageProps {
  res: AppStrings | undefined;
}

export type CombinedHomePageProps = HomePageProps & WithStyles<typeof styles>;

const HomePage = (props: CombinedHomePageProps): React.ReactElement => (
  <div>
    <div className={props.classes.bigImage}>
      <img src={ScigatewayLogo} alt={getString(props.res, 'title')} />
    </div>
    <div className={props.classes.howItWorks}>
      <Typography variant="h4" className={props.classes.howItWorksTitle}>
        {getString(props.res, 'how-label')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'explore-label')}
          </Typography>
          <img
            src={ExploreImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {getString(props.res, 'explore-description')}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'analyse-label')}
          </Typography>
          <img
            src={AnalyseImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {getString(props.res, 'analyse-description')}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'record-label')}
          </Typography>
          <img
            src={RecordImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {getString(props.res, 'record-description')}
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="h6" className={props.classes.strapline}>
        {getString(props.res, 'banner-one')}
      </Typography>
      <Typography variant="h5" className={props.classes.purpose}>
        {getString(props.res, 'banner-two')}
      </Typography>
    </div>
  </div>
);

const mapStateToProps = (state: StateType): HomePageProps => ({
  res: getAppStrings(state, 'home-page'),
});

export const HomePageWithoutStyles = HomePage;
export const HomePageWithStyles = withStyles(styles)(HomePage);

export default connect(mapStateToProps)(HomePageWithStyles);
