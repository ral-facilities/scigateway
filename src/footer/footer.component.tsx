import React from 'react';
import { styled } from '@mui/material/styles';
import { getAppStrings } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings, scigatewayRoutes } from '../state/scigateway.types';
import { Trans, useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

const RootDiv = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  paddingBottom: theme.footerPaddingBottom,
  paddingTop: theme.footerPaddingTop,
  width: '100%',
  height: theme.footerHeight,
  display: 'flex',
  color: theme.colours.footerLink.default,
  backgroundColor: theme.palette.primary.main,
  '& a': {
    '&:link': {
      color: theme.colours.footerLink.default,
    },
    '&:visited': {
      color: theme.colours.footerLink.default,
    },
    '&:active': {
      color: theme.colours.footerLink.active,
    },
  },
}));

const StyledLink = styled(Link)<{ component?: React.ElementType; to?: string }>(
  {
    fontWeight: 'bold',
  }
);

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
          <StyledLink
            component={RouterLink}
            to={scigatewayRoutes.accessibility}
            underline="hover"
          >
            Accessibilty statement
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
          fontSize: '14px',
          right: 0,
          paddingRight: '16px',
          marginLeft: 'auto',
        }}
      >
        <Trans i18nKey="footer.website-development-provider">
          Built by the{' '}
          <Link
            //className={props.classes.bold}
            href="https://www.scd.stfc.ac.uk/Pages/home.aspx"
          >
            Scientific Computing
          </Link>
          <Link
            //className={props.classes.bold}
            href="https://www.scd.stfc.ac.uk/Pages/Software-Engineering-Group.aspx"
            underline="hover"
          >
            Data and Software Engineering Group
          </Link>
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
