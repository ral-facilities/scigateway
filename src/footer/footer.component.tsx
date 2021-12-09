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
import classNames from 'classnames';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: '14px',
      paddingTop: '14px',
      width: '100%',
      fontSize: 14,
      height: '17px',
      fontWeight: 'bold',
      textAlign: 'left',
      textIndent: '24px',
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
    footerBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeIn,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    footerBarShift: {
      width: `calc(100% - ${(theme as UKRITheme).drawerWidth}px)`,
      marginLeft: (theme as UKRITheme).drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  });

interface FooterProps {
  res: AppStrings | undefined;
  drawerOpen: boolean;
}

export type CombinedFooterProps = FooterProps & WithStyles<typeof styles>;

const Footer = (props: CombinedFooterProps): React.ReactElement => {
  return (
    <div
      className={classNames(props.classes.footerBar, {
        [props.classes.footerBarShift]: props.drawerOpen,
      })}
    >
      <div
        className={props.classes.root}
        dangerouslySetInnerHTML={{
          __html: getString(props.res, 'html'),
        }}
      />
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
