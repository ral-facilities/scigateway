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
    contrast: {
      orange: string;
      red: string;
      grey: string;
      blue: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
  };
  drawerWidth: number;
  link: {
    default: string;
    visited: string;
    active: string;
  };
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
    contrast: {
      orange: string;
      red: string;
      grey: string;
      blue: string;
    };
    deep: {
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      red: string;
    };
  };
  drawerWidth: number;
  link: {
    default: string;
    visited: string;
    active: string;
  };
}

interface ThemeColours {
  primary: string;
  secondary: string;
  blue: string;
  red: string;
  grey: string;
}

const DARK_MODE_COLOURS: ThemeColours = {
  primary: '#003088',
  secondary: '#80ACFF',
  blue: '#86B4FF',
  red: '#FF7F73',
  grey: '#A4A4A4',
};

const LIGHT_MODE_COLOURS: ThemeColours = {
  primary: '#003088',
  secondary: '#003088',
  blue: '#003088',
  red: '#AC1600',
  grey: '#727272',
};

export const buildTheme = (darkModePreference: boolean): Theme => {
  let options: UKRIThemeOptions;
  const colours = darkModePreference ? DARK_MODE_COLOURS : LIGHT_MODE_COLOURS;
  if (darkModePreference) {
    options = {
      palette: {
        // Light/dark mode
        type: 'dark',
        primary: {
          main: colours.primary,
        },
        secondary: {
          main: colours.secondary,
        },
        background: {
          default: '#1B1B1B',
          paper: '#3A3A3A',
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
        contrast: {
          orange: '#C34F00',
          red: colours.red,
          grey: colours.grey,
          blue: colours.blue,
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
      },
      drawerWidth: 300,
      link: {
        default: '#257fff',
        visited: '#BE2BBB',
        active: '#E94D36',
      },
      overrides: {
        MuiLink: {
          root: {
            color: colours.blue,
          },
        },
        MuiTabs: {
          indicator: {
            color: '#80ACFF',
            textDecoration: 'underline',
          },
        },
        MuiFormLabel: {
          root: {
            '&$error': {
              color: colours.red,
            },
            '&$focused': {
              color: colours.blue,
            },
          },
          asterisk: {
            '&$error': {
              color: colours.red,
            },
          },
        },
        MuiBadge: {
          colorPrimary: {
            backgroundColor: '#FF6900',
          },
        },
        MuiInput: {
          underline: {
            '&$error:after': {
              borderBottomColor: colours.red,
            },
            '&:after': {
              borderBottomColor: colours.blue,
            },
          },
        },
        MuiOutlinedInput: {
          root: {
            '&$error $notchedOutline': {
              borderColor: colours.red,
            },
          },
        },
        MuiFormHelperText: {
          root: {
            '&$error': {
              color: colours.red,
            },
          },
        },
        MuiPickersToolbar: {
          toolbar: {
            backgroundColor: '#003088',
          },
        },
        MuiPickersCalendarHeader: {
          dayLabel: {
            color: colours.grey,
          },
        },
        MuiPickersDay: {
          current: {
            color: colours.blue,
          },
          dayDisabled: {
            color: colours.grey,
          },
        },
        MuiPickersYear: {
          root: {
            '&:active': {
              color: colours.blue,
            },
            '&:focus': {
              color: colours.blue,
            },
          },
          yearSelected: {
            color: colours.blue,
          },
          yearDisabled: {
            color: colours.grey,
          },
        },
        MuiPickersMonth: {
          root: {
            '&:active': {
              color: colours.blue,
            },
            '&:focus': {
              color: colours.blue,
            },
          },
          monthSelected: {
            color: '#86B4FF',
          },
          monthDisabled: {
            color: colours.grey,
          },
        },
      },
    };
  } else {
    options = {
      palette: {
        // Light/dark mode
        type: 'light',
        primary: {
          main: colours.primary, // blue (deep palette)
        },
        secondary: {
          main: colours.secondary,
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
        contrast: {
          orange: '#C34F00',
          red: colours.red,
          grey: colours.grey,
          blue: colours.blue,
        },
        deep: {
          orange: '#C13D33', // pure orange
          yellow: '#F08900', // vivid yellow
          green: '#3E863E', // green
          blue: '#003088', // blue
          purple: '#8A1A9B', // bright purple
          red: '#A91B2E', // red
        },
      },
      drawerWidth: 300,
      link: {
        default: '#1E5DF8',
        visited: '#BE2BBB',
        active: '#E94D36',
      },
      overrides: {
        MuiFormLabel: {
          root: {
            '&$error': {
              color: colours.red,
            },
          },
          asterisk: {
            '&$error': {
              color: colours.red,
            },
          },
        },
        MuiBadge: {
          colorPrimary: {
            backgroundColor: '#FF6900',
          },
        },
        MuiPickersToolbar: {
          toolbar: {
            backgroundColor: '#003088',
          },
        },
        MuiInput: {
          underline: {
            '&$error:after': {
              borderBottomColor: colours.red,
            },
          },
        },
        MuiOutlinedInput: {
          root: {
            '&$error $notchedOutline': {
              borderColor: colours.red,
            },
          },
        },
        MuiFormHelperText: {
          root: {
            '&$error': {
              color: colours.red,
            },
          },
        },
        MuiPickersCalendarHeader: {
          dayLabel: {
            color: colours.grey,
          },
        },
        MuiPickersDay: {
          dayDisabled: {
            color: colours.grey,
          },
        },
        MuiPickersYear: {
          yearDisabled: {
            color: colours.grey,
          },
        },
        MuiPickersMonth: {
          monthDisabled: {
            color: colours.grey,
          },
        },
      },
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
