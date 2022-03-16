import React from 'react';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

const useStyles = makeStyles<Theme, PreloaderCombinedProps>((theme: Theme) =>
  createStyles({
    spinner: {
      position: (props) => (props.fullScreen ? 'relative' : undefined),
      display: 'block',
      margin: 'auto',
      width: innerRadius + colors.length * 2 * (border + spacing),
      height: innerRadius + colors.length * 2 * (border + spacing),
      animation: 'rotate 10s infinite linear',
    },
    wrapper: {
      boxSizing: 'border-box',
      padding: '10px 0',
    },
    container: {
      zIndex: 1000,
      position: (props) => (props.fullScreen ? 'fixed' : undefined),
      width: '100%',
      height: '100%',
      top: (props) => (props.fullScreen ? 0 : undefined),
      left: (props) => (props.fullScreen ? 0 : undefined),
      right: (props) => (props.fullScreen ? 0 : undefined),
      bottom: (props) => (props.fullScreen ? 0 : undefined),
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.palette.text.primary,
    },
  })
);

interface PreloaderStateProps {
  loading: boolean;
}

interface PreloaderProps {
  fullScreen: boolean;
  id?: string;
}

type PreloaderCombinedProps = PreloaderStateProps & PreloaderProps;

interface SpinnerStyle {
  [id: string]: string | number;
}
const spinnerStyle = (index: number): SpinnerStyle => {
  const size = innerRadius + index * 2 * (border + spacing);

  return {
    position: 'absolute',
    display: 'inline-block',
    top: '50%',
    left: '50%',
    border: `solid ${border}px transparent`,
    borderBottom: 'none',
    borderTopLeftRadius: innerRadius + index * border,
    borderTopRightRadius: innerRadius + index * border,
    borderColor: colors[index % colors.length],
    height: size / 2,
    width: size,
    marginTop: -size / 2,
    marginLeft: -size / 2,
    animationName: 'rotate',
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationTimingFunction: `cubic-bezier(.09, ${0.3 * index}, ${
      0.12 * index
    }, .03)`,
    transformOrigin: '50% 100% 0',
    boxSizing: 'border-box',
  };
};

export const Preloader = (
  props: PreloaderCombinedProps
): React.ReactElement => {
  const classes = useStyles(props);
  return (
    <div id={props.id}>
      {props.loading ? (
        <div className={classes.container}>
          <div className={classes.wrapper}>
            <div className={classes.spinner}>
              <i style={spinnerStyle(0)} />
              <i style={spinnerStyle(1)} />
              <i style={spinnerStyle(2)} />
              <i style={spinnerStyle(3)} />
              <i style={spinnerStyle(4)} />
            </div>
          </div>
          <div className={classes.text}>Loading...</div>
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: StateType): PreloaderStateProps => ({
  loading: state.scigateway.siteLoading,
});

export default connect(mapStateToProps)(Preloader);
