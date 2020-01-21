import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

export interface UKRIThemeOptions extends ThemeOptions {
  ukri: {
    purple: string;
    blue: string;
    orange: string;
    green: string;
    grey: string;
  };
  drawerWidth: number;
}

export interface UKRITheme extends Theme {
  ukri: {
    purple: string;
    blue: string;
    orange: string;
    green: string;
    grey: string;
  };
  drawerWidth: number;
}

export const buildTheme = (): Theme => {
  const options: UKRIThemeOptions = {
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: {
        // main: '#1D4F91', // dark blue
        main: '#003088',
      },
      secondary: {
        // main: '#63666A', //grey
        main: '#676767',
      },
    },
    ukri: {
      // purple: '#8C4799',
      purple: '#BE2BBB',

      // blue: '#1D4F91',
      blue: '#2E2D62',

      // orange: '#C34613',
      orange: '#FF6900',

      // green: '#008275',
      green: '#67C04D',

      // grey: '#63666A',
      grey: '#6767676',
    },
    drawerWidth: 300,
  };

  return createMuiTheme(options);
};
