import React from 'react';
import { styled } from '@mui/material/styles';
import { getAppStrings } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';
import { UKRITheme } from '../theming';
import { Trans, useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';

const RootDiv = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  paddingBottom: (theme as UKRITheme).footerPaddingBottom,
  paddingTop: (theme as UKRITheme).footerPaddingTop,
  width: '100%',
  height: (theme as UKRITheme).footerHeight,
  display: 'flex',
  color: (theme as UKRITheme).colours.footerLink.default,
  backgroundColor: theme.palette.primary.main,
  '& a': {
    '&:link': {
      color: (theme as UKRITheme).colours.footerLink.default,
    },
    '&:visited': {
      color: (theme as UKRITheme).colours.footerLink.default,
    },
    '&:active': {
      color: (theme as UKRITheme).colours.footerLink.active,
    },
  },
}));

const StyledLink = styled(Link)({
  fontWeight: 'bold',
});

export interface FooterProps {
  res: AppStrings | undefined;
  drawerOpen: boolean;
}

const Footer = (props: FooterProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <RootDiv>
      <div
        style={{
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: 14,
          textIndent: '16px',
          display: 'inline-block',
        }}
      >
        <Trans i18nKey="footer.links.text">
          <StyledLink href={t('footer.links.facility')} underline="hover">
            Facility Home
          </StyledLink>
          {' | '}
          <StyledLink
            href={t('footer.links.privacy-statement')}
            underline="hover"
          >
            Privacy statement
          </StyledLink>
          {' | '}
          <StyledLink href={t('footer.links.data-policy')} underline="hover">
            Data policy
          </StyledLink>
          {' | '}
          <StyledLink href={t('footer.links.contact')} underline="hover">
            Contact
          </StyledLink>
        </Trans>
      </div>
      <div
        style={{
          textAlign: 'right',
          fontSize: 14,
          right: 0,
          paddingRight: '16px',
          marginLeft: 'auto',
        }}
      >
        <Trans i18nKey="footer.website-development-provider">
          Built by the{' '}
          <StyledLink
            href="https://www.scd.stfc.ac.uk/Pages/Software-Engineering-Group.aspx"
            underline="hover"
          >
            Data and Software Engineering Group
          </StyledLink>
        </Trans>
      </div>
    </RootDiv>
  );
};

const mapStateToProps = (state: StateType): FooterProps => ({
  res: getAppStrings(state, 'footer'),
  drawerOpen: state.scigateway.drawerOpen,
});

export const UnconnectedFooter = Footer;

export default connect(mapStateToProps)(Footer);
