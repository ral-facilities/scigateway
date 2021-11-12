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

export const buildTheme = (darkModePreference: boolean): Theme => {
  let options: UKRIThemeOptions;
  if (darkModePreference) {
    options = {
      palette: {
        // Light/dark mode
        type: 'dark',
        primary: {
          main: '#003088',
        },
        secondary: {
          main: '#80ACFF',
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
          red: '#FF7F73',
          grey: '#A4A4A4',
          blue: '#86B4FF',
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
            color: '#86b4ff',
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
              color: '#FF7F73',
            },
            '&$focused': {
              color: '#86B4FF',
            },
          },
          asterisk: {
            '&$error': {
              color: '#FF7F73',
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
              borderBottomColor: '#FF7F73',
            },
            '&:after': {
              borderBottomColor: '#86b4ff',
            },
          },
        },
        MuiOutlinedInput: {
          root: {
            '&$error $notchedOutline': {
              borderColor: '#FF7F73',
            },
          },
        },
        MuiFormHelperText: {
          root: {
            '&$error': {
              color: '#FF7F73',
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
            color: 'A4A4A4',
          },
        },
        MuiPickersDay: {
          current: {
            color: '#86b4ff',
          },
          dayDisabled: {
            color: '#A4A4A4',
          },
        },
        MuiPickersYear: {
          root: {
            '&:active': {
              color: '#86b4ff',
            },
            '&:focus': {
              color: '#86b4ff',
            },
          },
          yearSelected: {
            color: '#86b4ff',
          },
          yearDisabled: {
            color: '#A4A4A4',
          },
        },
        MuiPickersMonth: {
          root: {
            '&:active': {
              color: '#86b4ff',
            },
            '&:focus': {
              color: '#86b4ff',
            },
          },
          monthSelected: {
            color: '#86b4ff',
          },
          monthDisabled: {
            color: '#A4A4A4',
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
          main: '#003088', // blue (deep palette)
        },
        secondary: {
          main: '#003088',
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
          red: '#AC1600',
          grey: '#727272',
          blue: '#003088',
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
              color: '#AC1600',
            },
          },
          asterisk: {
            '&$error': {
              color: '#AC1600',
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
              borderBottomColor: '#AC1600',
            },
          },
        },
        MuiOutlinedInput: {
          root: {
            '&$error $notchedOutline': {
              borderColor: '#AC1600',
            },
          },
        },
        MuiFormHelperText: {
          root: {
            '&$error': {
              color: '#AC1600',
            },
          },
        },
        MuiPickersCalendarHeader: {
          dayLabel: {
            color: '#727272',
          },
        },
        MuiPickersDay: {
          dayDisabled: {
            color: '#727272',
          },
        },
        MuiPickersYear: {
          yearDisabled: {
            color: '#727272',
          },
        },
        MuiPickersMonth: {
          monthDisabled: {
            color: '#727272',
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
