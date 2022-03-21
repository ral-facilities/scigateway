import React from 'react';
import { StateType } from '../state/state.types';
import Typography from '@mui/material/Typography';
import { Link, styled } from '@mui/material';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

const RootDiv = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  '& a': {
    '&:link': {
      color: theme.colours.link.default,
    },
    '&:visited': {
      color: theme.colours.link.visited,
    },
    '&:active': {
      color: theme.colours.link.active,
    },
  },
}));

const DescriptionTypography = styled(Typography)<{
  component?: React.ElementType;
}>(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

export interface ContactUsProps {
  contactUsAccessibilityFormUrl: string | undefined;
}

const ContactUs = (props: ContactUsProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <RootDiv id="contact-us">
      {/* If we have a contact us form link defined in the settings, display the form */}
      {props.contactUsAccessibilityFormUrl &&
      props.contactUsAccessibilityFormUrl !== '' ? (
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
          {/* Otherwise, we have no contact us form to link to. Display an email
          address for the user to email support themselves */}
          <DescriptionTypography>
            <Link href={`mailto:${t('accessibility-page.contact-info')}`}>
              {t('accessibility-page.contact-info')}
            </Link>
          </DescriptionTypography>
        </div>
      )}
    </RootDiv>
  );
};

const mapStateToProps = (state: StateType): ContactUsProps => ({
  contactUsAccessibilityFormUrl: state.scigateway.contactUsAccessibilityFormUrl,
});

export const UnconnectedContactUs = ContactUs;

export default connect(mapStateToProps)(ContactUs);
