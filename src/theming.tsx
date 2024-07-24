import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  Theme,
} from '@mui/material/styles';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import React from 'react';
import { StateType } from './state/state.types';
import { connect, useSelector } from 'react-redux';
import { checkboxClasses } from '@mui/material/Checkbox';
import {
  formHelperTextClasses,
  formLabelClasses,
  inputClasses,
  outlinedInputClasses,
  tabClasses,
} from '@mui/material';

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
  /* The type of mode this is */
  type: 'default' | 'contrast';

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
  contrastGrey: string; //Used on homepage

  /* Informational/Warning colours */
  information: string; //Used in open data label
  warning: string; //Used for selection alert banner

  /* Colours for <a> style links */
  link: {
    default: string;
    visited: string;
    active: string;
  };

  footerLink: {
    default: string;
    active: string;
  };

  chip: string; //Used for chip colours in cards and filters

  /* Colours used on the homepage */
  homePage: {
    heading: string;
    blueDescription: string;
    blueButton: string;
  };

  /* Colour for Tabs in search */
  tabsGrey: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    colours: ThemeColours;
    drawerWidth: string;
    footerPaddingTop: string;
    footerPaddingBottom: string;
    footerHeight: string;
    mainAppBarHeight: string;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    colours: ThemeColours;
    drawerWidth: string;
    footerPaddingTop: string;
    footerPaddingBottom: string;
    footerHeight: string;
    mainAppBarHeight: string;
  }
}

const DARK_MODE_COLOURS: ThemeColours = {
  type: 'default',
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
  darkGreen: '#3A7F3A',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#E6E6E6',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#86B4FF',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
  footerLink: {
    default: '#FFFFFF',
    active: '#E58885',
  },
  chip: '#595959',
  homePage: {
    heading: '#FFFFFF',
    blueDescription: '#FFFFFF',
    blueButton: UKRI_COLOURS.bright.blue,
  },
  tabsGrey: '#3A3A3A',
};

const DARK_MODE_HIGH_CONTRAST_COLOURS: ThemeColours = {
  type: 'contrast',
  primary: '#86B4FF',
  secondary: '#80ACFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  background: '#000000',
  paper: '#1A1A1A',
  blue: '#B4CCFA',
  orange: '#FFC14D',
  red: '#FFA198',
  grey: '#A4A4A4',
  lightBlue: UKRI_COLOURS.deep.blue,
  lightOrange: '#FFC14D',
  darkGreen: '#3A7F3A',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#FFFFFF',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFC14D',
  link: {
    default: '#B4CCFA',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
  footerLink: {
    default: '#000000',
    active: '#851D0F',
  },
  chip: '#3A3A3A',
  homePage: {
    heading: '#FFFFFF',
    blueDescription: '#FFFFFF',
    blueButton: UKRI_COLOURS.bright.blue,
  },
  tabsGrey: '#1A1A1A',
};

const LIGHT_MODE_COLOURS: ThemeColours = {
  type: 'default',
  primary: UKRI_COLOURS.deep.blue,
  secondary: UKRI_COLOURS.deep.blue,
  textSecondary: 'rgba(0, 0, 0, 0.54)',
  background: '#FAFAFA',
  paper: '#FFFFFF',
  blue: UKRI_COLOURS.deep.blue,
  orange: '#C34F00',
  red: '#AC1600',
  grey: '#727272',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FF6900',
  darkGreen: '#3A7F3A',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#717171',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#1E5DF8',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
  footerLink: {
    default: '#FFFFFF',
    active: '#E58885',
  },
  chip: '#E0E0E0',
  homePage: {
    heading: '#333333',
    blueDescription: '#FFFFFF',
    blueButton: UKRI_COLOURS.bright.blue,
  },
  tabsGrey: '#EEEEEE',
};

const LIGHT_MODE_HIGH_CONTRAST_COLOURS: ThemeColours = {
  type: 'contrast',
  primary: UKRI_COLOURS.deep.blue,
  secondary: UKRI_COLOURS.deep.blue,
  textSecondary: '#000000',
  background: '#FAFAFA',
  paper: '#FFFFFF',
  blue: '#002466',
  orange: '#C34F00',
  red: '#801100',
  grey: '#727272',
  lightBlue: UKRI_COLOURS.bright.blue,
  lightOrange: '#FF6900',
  darkGreen: '#3A7F3A',
  darkOrange: STATIC_COLOURS.orange,
  contrastGrey: '#000000',
  information: UKRI_COLOURS.deep.blue,
  warning: '#FFA500',
  link: {
    default: '#052d94',
    visited: '#BE2BBB',
    active: '#E94D36',
  },
  footerLink: {
    default: '#FFFFFF',
    active: '#E58885',
  },
  chip: '#E0E0E0',
  homePage: {
    heading: '#000000',
    blueDescription: '#FFFFFF',
    blueButton: UKRI_COLOURS.bright.blue,
  },
  tabsGrey: '#EEEEEE',
};

export const buildTheme = (
  darkModePreference: boolean,
  highContrastModePreference?: boolean,
  primaryColour?: string
): Theme => {
  const colours = darkModePreference
    ? highContrastModePreference
      ? DARK_MODE_HIGH_CONTRAST_COLOURS
      : DARK_MODE_COLOURS
    : highContrastModePreference
      ? LIGHT_MODE_HIGH_CONTRAST_COLOURS
      : LIGHT_MODE_COLOURS;

  if (primaryColour && !(darkModePreference && highContrastModePreference)) {
    colours.primary = primaryColour;
  }

  const componentOverrides = {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'unset' } },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover' as 'always' | 'none' | 'hover' | undefined,
      },
      styleOverrides: {
        root: {
          color: colours.blue,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          color: STATIC_COLOURS.darkBlue,
          textDecoration: 'underline',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        textColorSecondary: {
          [`&.${tabClasses.selected}`]: {
            color: darkModePreference ? '#FFFFFF' : colours.blue,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        colorPrimary: {
          [`&.${checkboxClasses.checked}`]: {
            color: colours.blue,
          },
          [`&.${checkboxClasses.indeterminate}`]: {
            color: colours.grey,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          [`&.${formLabelClasses.error}`]: {
            color: colours.red,
          },
          [`&.${formLabelClasses.focused}`]: {
            color: colours.blue,
          },
        },
        asterisk: {
          [`&.${formLabelClasses.error}`]: {
            color: colours.red,
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: STATIC_COLOURS.orange,
          color: 'white',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        underline: {
          [`&.${inputClasses.error}`]: {
            borderBottomColor: colours.red,
          },
          [`&.${inputClasses.error}:after`]: {
            borderBottomColor: colours.blue,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          [`&.${outlinedInputClasses.error} .${outlinedInputClasses.notchedOutline}`]:
            {
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
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          [`&.${formHelperTextClasses.error}`]: {
            color: colours.red,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: colours.chip,
        },
      },
    },
    MuiPickersToolbar: {
      styleOverrides: {
        toolbar: {
          backgroundColor: colours.primary,
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        dayLabel: {
          color: colours.grey,
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        current: {
          color: colours.blue,
        },
        dayDisabled: {
          color: colours.grey,
        },
      },
    },
    MuiPickersYear: {
      styleOverrides: {
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
    },
    MuiPickersMonth: {
      styleOverrides: {
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
    },
  };

  return createTheme({
    palette: {
      // Light/dark mode
      mode: darkModePreference ? 'dark' : 'light',
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
    typography: {
      button: {
        textTransform: 'none',
      },
    },
    components: componentOverrides,
    colours: colours,
    drawerWidth: '220px',
    footerPaddingTop: '8px',
    footerPaddingBottom: '8px',
    footerHeight: '20px',
    mainAppBarHeight: '64px',
  });
};

function mapThemeProviderStateToProps(state: StateType): {
  prefersDarkMode: boolean;
} {
  return {
    prefersDarkMode: state.scigateway.darkMode,
  };
}

const SciGatewayThemeProvider = (props: {
  children: React.ReactNode;
}): React.ReactElement<{
  children: React.ReactNode;
}> => {
  const darkModePreference = useSelector(
    (state: StateType) => state.scigateway.darkMode
  );
  const highContrastModePreference = useSelector(
    (state: StateType) => state.scigateway.highContrastMode
  );
  const primaryColour = useSelector(
    (state: StateType) => state.scigateway.primaryColour
  );
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider
        theme={buildTheme(
          darkModePreference,
          highContrastModePreference,
          primaryColour
        )}
      >
        {props.children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export const ConnectedThemeProvider = connect(mapThemeProviderStateToProps)(
  SciGatewayThemeProvider
);
