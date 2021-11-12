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

/* Colours that may be used across light/dark modes e.g. the main app bar */
const STATIC_COLOURS = {
  darkBlue: '#003088',
  orange: '#FF6900',
};

/* Main colours used for dark/light modes respectively */
interface ThemeColours {
  primary: string;
  secondary: string;
  background: string;
  paper: string;
  blue: string;
  orange: string;
  red: string;
  grey: string;
}

const DARK_MODE_COLOURS: ThemeColours = {
  primary: '#003088',
  secondary: '#80ACFF',
  background: '#1B1B1B',
  paper: '#3A3A3A',
  blue: '#86B4FF',
  orange: '#C34F00',
  red: '#FF7F73',
  grey: '#A4A4A4',
};

//For experimenting
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DARK_MODE_COLOURS_HIGH_CONTRAST: ThemeColours = {
  primary: '#86B4FF',
  secondary: '#80ACFF',
  background: '#1B1B1B',
  paper: '#3A3A3A',
  blue: '#86B4FF',
  orange: '#C34F00',
  red: '#FF7F73',
  grey: '#A4A4A4',
};

const LIGHT_MODE_COLOURS: ThemeColours = {
  primary: '#003088',
  secondary: '#003088',
  background: '#FAFAFA',
  paper: '#FFF',
  blue: '#003088',
  orange: '#C34F00',
  red: '#AC1600',
  grey: '#727272',
};

export const buildTheme = (darkModePreference: boolean): Theme => {
  let options: UKRIThemeOptions;
  const colours = darkModePreference ? DARK_MODE_COLOURS : LIGHT_MODE_COLOURS;

  const overrides = {
    MuiLink: {
      root: {
        color: colours.blue,
      },
    },
    MuiTabs: {
      indicator: {
        color: STATIC_COLOURS.darkBlue,
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
        backgroundColor: STATIC_COLOURS.orange,
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
        backgroundColor: STATIC_COLOURS.darkBlue,
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
        color: colours.blue,
      },
      monthDisabled: {
        color: colours.grey,
      },
    },
  };

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
          default: colours.background,
          paper: colours.paper,
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
          orange: colours.orange,
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
      overrides: overrides,
    };
  } else {
    options = {
      palette: {
        // Light/dark mode
        type: 'light',
        primary: {
          main: colours.primary,
        },
        secondary: {
          main: colours.secondary,
        },
        background: {
          default: colours.background,
          paper: colours.paper,
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
          orange: colours.orange,
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
      overrides: overrides,
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
