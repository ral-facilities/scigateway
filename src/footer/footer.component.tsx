import React from 'react';
import Typography from '@material-ui/core/Typography';
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
      width: '100%',
      height: '60px',
      textAlign: 'center',
      backgroundColor: theme.palette.background.default,
    },
  });

interface FooterProps {
  res: AppStrings | undefined;
}

export type CombinedFooterProps = FooterProps & WithStyles<typeof styles>;

const Footer = (props: CombinedFooterProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography
        variant="body1"
        dangerouslySetInnerHTML={{
          __html: getString(props.res, 'html'),
        }}
      />
    </div>
  );
};

const mapStateToProps = (state: StateType): FooterProps => ({
  res: getAppStrings(state, 'footer'),
});

export const FooterWithoutStyles = Footer;
export const FooterWithStyles = withStyles(styles)(Footer);

export default connect(mapStateToProps)(FooterWithStyles);
