import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles, Theme, WithStyles, Grid } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import Image from '../images/Jasmin4 _DSC7054.jpg';
import ExploreImage from '../images/explore.jpg';
import AnalyseImage from '../images/analyse.jpg';
import RecordImage from '../images/record.jpg';
import { UKRITheme } from '../theming';

const styles = (theme: Theme): StyleRules => ({
  title: {
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    padding: 80,
    textShadow: '0 0 20px #000000',
  },
  bigImage: {
    backgroundImage: `url("${Image}")`,
    height: 350,
    width: '100%',
  },
  howItWorks: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: '10vw',
    paddingRight: '10vw',
    paddingTop: 30,
  },
  howItWorksTitle: {
    fontWeight: 'bold',
    color: theme.palette.secondary.dark,
    paddingBottom: 30,
  },
  howItWorksGridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  howItWorksGridItemTitle: {
    color: (theme as UKRITheme).ukri.orange,
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
    color: theme.palette.secondary.light,
  },
  strapline: {
    paddingTop: 50,
    fontStyle: 'italic',
    color: theme.palette.secondary.main,
  },
  purpose: {
    paddingTop: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.palette.primary.main,
  },
});

const HomePage = (props: WithStyles<typeof styles>): React.ReactElement => (
  <div>
    <div className={props.classes.bigImage}>
      <Typography variant="h2" className={props.classes.title}>
        Data Analysis as a Service
      </Typography>
    </div>
    <div className={props.classes.howItWorks}>
      <Typography variant="h4" className={props.classes.howItWorksTitle}>
        How it works...
      </Typography>
      <Grid container spacing={24}>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            1. Explore
          </Typography>
          <img
            src={ExploreImage}
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            Explore and visualise your data. Select and pre-process data to pull
            in to your analysis environment.
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            2. Analyse
          </Typography>
          <img
            src={AnalyseImage}
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            Connect to a virtual environment already equipped with the software
            and tools to analyse your data.
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            3. Record
          </Typography>
          <img
            src={RecordImage}
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            Store your results and findings, making them available to others for
            review and further research.
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="h6" className={props.classes.strapline}>
        transforming the use of real time data processing, computer simulation
        and data analytics...
      </Typography>
      <Typography variant="h5" className={props.classes.purpose}>
        ...to deliver more effective research at our national facilities
      </Typography>
    </div>
  </div>
);

export default withStyles(styles)(HomePage);
