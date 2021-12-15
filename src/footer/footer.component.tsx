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
    },
    leftText: {
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: 14,
      textIndent: '24px',
      display: 'inline-block',
    },
    rightText: {
      textAlign: 'right',
      fontSize: 14,
      right: 0,
      paddingRight: 24,
      marginLeft: 'auto',
    },
    bold: {
      fontWeight: 'bold',
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
      <div
        className={props.classes.leftText}
        dangerouslySetInnerHTML={{
          __html: getString(props.res, 'html'),
        }}
      />
      <div className={props.classes.rightText}>
        <Trans i18nKey="footer.website-development-provider">
          Built by the{' '}
          <a
            className={props.classes.bold}
            href="https://www.scd.stfc.ac.uk/Pages/Software-Engineering-Group.aspx"
          >
            Data and Software Engineering Group
          </a>
        </Trans>
      </div>
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
