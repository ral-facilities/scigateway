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

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: '5px',
      width: '100%',
      fontSize: 14,
      textAlign: 'center',
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
  });

interface FooterProps {
  res: AppStrings | undefined;
}

export type CombinedFooterProps = FooterProps & WithStyles<typeof styles>;

const Footer = (props: CombinedFooterProps): React.ReactElement => {
  return (
    <div
      className={props.classes.root}
      dangerouslySetInnerHTML={{
        __html: getString(props.res, 'html'),
      }}
    />
  );
};

const mapStateToProps = (state: StateType): FooterProps => ({
  res: getAppStrings(state, 'footer'),
});

export const FooterWithoutStyles = Footer;
export const FooterWithStyles = withStyles(styles)(Footer);

export default connect(mapStateToProps)(FooterWithStyles);
