import React from 'react';
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { AppStrings } from '../state/scigateway.types';
import { UKRITheme } from '../theming';
import { Box } from '@material-ui/core';
import { Trans } from 'react-i18next';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: (theme as UKRITheme).footerPaddingBottom,
      paddingTop: (theme as UKRITheme).footerPaddingTop,
      width: '100%',
      height: (theme as UKRITheme).footerHeight,
      color: (theme as UKRITheme).colours.footerLink.default,
      backgroundColor: theme.palette.primary.main,
    },
    leftText: {
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: 14,
      textIndent: '24px',
      display: 'inline-block',
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
    },
    rightText: {
      textAlign: 'right',
      display: 'inline-block',
      fontSize: 14,
      paddingRight: 24,
    },
  });

interface FooterProps {
  res: AppStrings | undefined;
  drawerOpen: boolean;
}

export type CombinedFooterProps = FooterProps & WithStyles<typeof styles>;

const Footer = (props: CombinedFooterProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        width="100%"
        boxSizing="border-box"
      >
        <div
          className={props.classes.leftText}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'html'),
          }}
        />
        <Box marginLeft="auto">
          <div className={props.classes.rightText}>
            <Trans i18nKey="footer.website-development-provider">
              Built by the <strong>Data and Software Engineering Group</strong>
            </Trans>
          </div>
        </Box>
      </Box>
    </div>
  );
};

const mapStateToProps = (state: StateType): FooterProps => ({
  res: getAppStrings(state, 'footer'),
  drawerOpen: state.scigateway.drawerOpen,
});

export const FooterWithoutStyles = Footer;
export const FooterWithStyles = withStyles(styles)(Footer);

export default connect(mapStateToProps)(FooterWithStyles);
