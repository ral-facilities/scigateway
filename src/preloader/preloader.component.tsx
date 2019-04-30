import React from 'react';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';

const colors = ['#8C4799', '#1D4F91', '#C34613', '#008275', '#63666A'];
const inner = 140;
const border = 8;
const spacing = 1;

const style = {
  spinner: {
    position: 'relative' as 'relative',
    display: 'block',
    margin: 'auto',
    width: inner + colors.length * 2 * (border + spacing),
    height: inner + colors.length * 2 * (border + spacing),
    animation: 'rotate 10s infinite linear',
  },
  wrapper: {
    boxSizing: 'border-box' as 'border-box',
    padding: '10px 0',
  },
  container: {
    zIndex: 1000,
    position: 'fixed' as 'fixed',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,1)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

interface PreloaderProps {
  loading: boolean;
}

interface SpinnerStyle {
  [id: string]: string | number;
}
const spinnerStyle = (index: number): SpinnerStyle => {
  const size = inner + index * 2 * (border + spacing);

  return {
    position: 'absolute' as 'absolute',
    display: 'inline-block',
    top: '50%',
    left: '50%',
    border: `solid ${border}px transparent`,
    borderBottom: 'none',
    borderTopLeftRadius: inner + index * border,
    borderTopRightRadius: inner + index * border,
    borderColor: colors[index % colors.length],
    height: size / 2,
    width: size,
    marginTop: -size / 2,
    marginLeft: -size / 2,
    animationName: 'rotate',
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationTimingFunction: `cubic-bezier(.09, ${0.3 * index}, ${0.12 *
      index}, .03)`,
    //animation: 'rotate-loader 3s infinte cubic-bezier(0.09,0.6,0.8, 0.03)',
    transformOrigin: '50% 100% 0',
    boxSizing: 'border-box' as 'border-box',
  };
};

const Preloader = (props: PreloaderProps): React.ReactElement => (
  <div>
    {props.loading ? (
      <div style={style.container}>
        <div style={style.wrapper}>
          <div style={style.spinner}>
            <i style={spinnerStyle(0)} />
            <i style={spinnerStyle(1)} />
            <i style={spinnerStyle(2)} />
            <i style={spinnerStyle(3)} />
            <i style={spinnerStyle(4)} />
          </div>
        </div>
        <div>Loading...</div>
      </div>
    ) : null}
  </div>
);

const mapStateToProps = (state: StateType): PreloaderProps => ({
  loading:
    state.daaas.siteLoading && state.router.location.pathname !== '/login',
});

export default connect(mapStateToProps)(Preloader);
