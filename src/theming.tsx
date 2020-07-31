import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import React from 'react';
import { StateType } from './state/state.types';
import { connect, useSelector } from 'react-redux';

export interface UKRIThemeOptions extends ThemeOptions {
  ukri: {
    bright: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    text: {
      blue: string;
    };
  };
  drawerWidth: number;
}

export interface UKRITheme extends Theme {
  ukri: {
    bright: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
    text: {
      blue: string;
    };
  };
  drawerWidth: number;
}

export const buildTheme = (darkModePreference: boolean): Theme => {
  let options: UKRIThemeOptions;
  if (darkModePreference) {
    options = {
      palette: {
        // Light/dark mode
        type: 'dark',
        primary: {
          main: '#333333', // blue (deep palette)
        },
        secondary: {
          main: '#676767', // grey
        },
      },
      ukri: {
        bright: {
          orange: '#FF6900', // pure orange
          yellow: '#FBBB10', // yellow
          green: '#67C04D', // light green
          blue: '#1E5DF8', // blue
          purple: '#BE2BBB', // bright purple
          red: '#E94D36', // light red
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
        text: {
          blue: '#1E5DF8',
        },
      },
      drawerWidth: 300,
    };
  } else {
    options = {
      palette: {
        // Light/dark mode
        type: 'light',
        primary: {
          main: '#003088', // blue (deep palette)
        },
        secondary: {
          main: '#676767', // grey
        },
      },
      ukri: {
        bright: {
          orange: '#FF6900', // pure orange
          yellow: '#FBBB10', // yellow
          green: '#67C04D', // light green
          blue: '#1E5DF8', // blue
          purple: '#BE2BBB', // bright purple
          red: '#E94D36', // light red
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
        text: {
          blue: '#003088',
        },
      },
      drawerWidth: 300,
    };
  }

  return createMuiTheme(options);
};

function mapThemeProviderStateToProps(
  state: StateType
): { prefersDarkMode: boolean } {
  return {
    prefersDarkMode: state.scigateway.darkMode,
  };
}

const SciGatewayThemeProvider = (props: {
  children: React.ReactNode;
}): React.ReactElement<{
  children: React.ReactNode;
}> => {
  const darkModePreference: boolean = useSelector(
    (state: StateType) => state.scigateway.darkMode
  );
  return (
    <MuiThemeProvider theme={buildTheme(darkModePreference)}>
      {props.children}
    </MuiThemeProvider>
  );
};

export const ConnectedThemeProvider = connect(mapThemeProviderStateToProps)(
  SciGatewayThemeProvider
);
