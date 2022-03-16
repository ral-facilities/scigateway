import React from 'react';
import { StateType } from '../state/state.types';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
  Link,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    description: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
  });

interface ContactUsProps {
  contactUsAccessibilityFormUrl: string | undefined;
}

export type CombinedContactUsProps = WithStyles<typeof styles> & ContactUsProps;

const ContactUs = (props: CombinedContactUsProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <div id="contact-us">
      {props.contactUsAccessibilityFormUrl ? (
        <div id="contact-us-form">
          <iframe
            title="Contact Us"
            width="740px"
            height="840px"
            src={props.contactUsAccessibilityFormUrl}
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div id="contact-info">
          <Typography className={props.classes.description}>
            <Link href={`mailto:${t('accessibility-page.contact-info')}`}>
              {t('accessibility-page.contact-info')}
            </Link>
          </Typography>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: StateType): ContactUsProps => ({
  contactUsAccessibilityFormUrl: state.scigateway.contactUsAccessibilityFormUrl,
});
export const ContactUsWithStyles = withStyles(styles)(ContactUs);
export const ContactUsWithoutStyles = ContactUs;

export default connect(mapStateToProps)(ContactUsWithStyles);
