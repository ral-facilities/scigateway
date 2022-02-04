import React from 'react';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { Box } from '@mui/material';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const innerRadius = 140;
const border = 8;
const spacing = 1;

interface PreloaderStateProps {
  loading: boolean;
}

interface PreloaderProps {
  fullScreen: boolean;
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
  return (
    <div>
      {props.loading ? (
        <Box
          sx={{
            zIndex: 1000,
            position: props.fullScreen ? 'fixed' : undefined,
            width: '100%',
            height: '100%',
            top: props.fullScreen ? 0 : undefined,
            left: props.fullScreen ? 0 : undefined,
            right: props.fullScreen ? 0 : undefined,
            bottom: props.fullScreen ? 0 : undefined,
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ boxSizing: 'border-box', padding: '10px 0' }}>
            <div
              style={{
                position: props.fullScreen ? 'relative' : undefined,
                display: 'block',
                margin: 'auto',
                width: innerRadius + colors.length * 2 * (border + spacing),
                height: innerRadius + colors.length * 2 * (border + spacing),
                animation: 'rotate 10s infinite linear',
              }}
            >
              <i style={spinnerStyle(0)} />
              <i style={spinnerStyle(1)} />
              <i style={spinnerStyle(2)} />
              <i style={spinnerStyle(3)} />
              <i style={spinnerStyle(4)} />
            </div>
          </div>
          <Box sx={{ color: 'text.primary' }}>Loading...</Box>
        </Box>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: StateType): PreloaderStateProps => ({
  loading: state.scigateway.siteLoading,
});

export default connect(mapStateToProps)(Preloader);
