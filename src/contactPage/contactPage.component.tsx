import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      '& a': {
        '&:link': {
          color: '#1E5DF8',
        },
        '&:visited': {
          color: '#BE2BBB',
        },
        '&:active': {
          color: '#E94D36',
        },
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
    titleText: {
      fontWeight: 'bold',
      color: theme.palette.secondary.main,
    },
    contactDetails: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  });

interface ContactPageProps {
  res: AppStrings | undefined;
}

export type CombinedContactPageProps = ContactPageProps &
  WithStyles<typeof styles>;

const ContactPage = (props: CombinedContactPageProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <div className={props.classes.container}>
        <Typography variant="h4">
          {getString(props.res, 'contact-details-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.contactDetails}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'contact-details-description'),
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: StateType): ContactPageProps => ({
  res: getAppStrings(state, 'contact-page'),
});

export const ContactPageWithoutStyles = ContactPage;
export const ContactPageWithStyles = withStyles(styles)(ContactPage);

export default connect(mapStateToProps)(ContactPageWithStyles);
