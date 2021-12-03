import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import React from 'react';
import { StateType } from './state/state.types';
import { connect, useSelector } from 'react-redux';

/* UKRI colours */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UKRI_COLOURS = {
  blue: '#2E2D62',
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
};

/* Colours that may be used across light/dark modes e.g. the main app bar */
const STATIC_COLOURS = {
  darkBlue: '#003088',
  orange: '#C34F00',
};

/* Main colours used for dark/light modes respectively */
interface ThemeColours {
  /* Primary/secondary colours used for MUI */
  primary: string;
  secondary: string;

  /* Secondary text colour */
  textSecondary: string;

  /* Background colours for the page and papers */
  background: string;
  paper: string;

  /* Standard colours used in plugins (change to lighter/darker shades
    between light and dark modes) - these are meant to give good contrast
    for text on the chosen paper background colour */
  blue: string;
  orange: string;
  red: string;
  grey: string;

  /* Lighter colours */
  lightBlue: string; //Used for lighter coloured buttons
  lightOrange: string; //Used for notifcation icon

  /* Darker colours */
  darkGreen: string; //Used for cookie consent message
  darkOrange: string; //Used for help tour

  /* Contrast colours that need to change significantly between dark
     and light modes */
  contrastGrey: string; //Used for chip colours in cards and filters

  /* Informational/Warning colours */
  information: string; //Used in open data label
  warning: string; //Used for selection alert banner

  /* Colours for <a> style links */
  link: {
    default: string;
    visited: string;
    active: string;
  };
}

const DARK_MODE_COLOURS: ThemeColours = {
  primary: UKRI_COLOURS.deep.blue,
  secondary: '#80ACFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  background: '#1B1B1B',
  paper: '#3A3A3A',
  blue: '#86B4FF',
  orange: '#F26300',
  red: '#FF7F73',
  grey: '#A4A4A4',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FF6900',
  darkGreen: '#3E863E',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#595959',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#86B4FF',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
};

const DARK_MODE_HIGH_CONTRAST_COLOURS: ThemeColours = {
  primary: '#86B4FF',
  secondary: '#80ACFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  background: '#000000',
  paper: '#1A1A1A',
  blue: '#B4CCFA',
  orange: '#FFC14D',
  red: '#FFA198',
  grey: '#A4A4A4',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FFC14D',
  darkGreen: '#3E863E',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#3A3A3A',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFC14D',
  link: {
    default: '#B4CCFA',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
};

const LIGHT_MODE_COLOURS: ThemeColours = {
  primary: UKRI_COLOURS.deep.blue,
  secondary: UKRI_COLOURS.deep.blue,
  textSecondary: 'rgba(0, 0, 0, 0.54)',
  background: '#FAFAFA',
  paper: '#FFF',
  blue: UKRI_COLOURS.deep.blue,
  orange: '#C34F00',
  red: '#AC1600',
  grey: '#727272',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FF6900',
  darkGreen: '#3E863E',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#E0E0E0',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#1E5DF8',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
};

const LIGHT_MODE_HIGH_CONTRAST_COLOURS: ThemeColours = {
  primary: UKRI_COLOURS.deep.blue,
  secondary: UKRI_COLOURS.deep.blue,
  textSecondary: '#000000',
  background: '#FAFAFA',
  paper: '#FFF',
  blue: '#002466',
  orange: '#C34F00',
  red: '#801100',
  grey: '#727272',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FF6900',
  darkGreen: '#3E863E',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#E0E0E0',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#052d94',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
};
export interface UKRIThemeOptions extends ThemeOptions {
  drawerWidth: number;
  colours: ThemeColours;
}

export interface UKRITheme extends Theme {
  drawerWidth: number;
  colours: ThemeColours;
}

export const buildTheme = (
  darkModePreference: boolean,
  highContrastModePreference?: boolean
): Theme => {
  const colours = darkModePreference
    ? highContrastModePreference
      ? DARK_MODE_HIGH_CONTRAST_COLOURS
      : DARK_MODE_COLOURS
    : highContrastModePreference
    ? LIGHT_MODE_HIGH_CONTRAST_COLOURS
    : LIGHT_MODE_COLOURS;

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
        color: 'white',
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
      //Override opacity of placeholder text
      input: {
        '&::placeholder': {
          colour: colours.textSecondary,
          opacity:
            !darkModePreference && highContrastModePreference ? 1.0 : 0.7,
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
    MuiChip: {
      root: {
        backgroundColor: colours.contrastGrey,
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: colours.primary,
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
  const options: UKRIThemeOptions = {
    palette: {
      // Light/dark mode
      type: darkModePreference ? 'dark' : 'light',
      primary: {
        main: colours.primary,
      },
      secondary: {
        main: colours.secondary,
      },
      text: {
        secondary: colours.textSecondary,
      },
      background: {
        default: colours.background,
        paper: colours.paper,
      },
    },
    drawerWidth: 300,
    overrides: overrides,
    colours: colours,
  };

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
  const highContrastModePreference: boolean = useSelector(
    (state: StateType) => state.scigateway.highContrastMode
  );
  return (
    <MuiThemeProvider
      theme={buildTheme(darkModePreference, highContrastModePreference)}
    >
      {props.children}
    </MuiThemeProvider>
  );
};

export const ConnectedThemeProvider = connect(mapThemeProviderStateToProps)(
  SciGatewayThemeProvider
);
