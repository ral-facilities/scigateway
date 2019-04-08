import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';

export interface UKRIThemeOptions extends ThemeOptions {
  ukri: {
    purple: string;
    blue: string;
    orange: string;
    green: string;
    grey: string;
  };
}

export interface UKRITheme extends Theme {
  ukri: {
    purple: string;
    blue: string;
    orange: string;
    green: string;
    grey: string;
  };
}

export const buildTheme = (): Theme => {
  const options: UKRIThemeOptions = {
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: {
        main: '#1D4F91', // dark blue
      },
      secondary: {
        main: '#63666A', //grey
      },
    },
    ukri: {
      purple: '#8C4799',
      blue: '#1D4F91',
      orange: '#C34613',
      green: '#008275',
      grey: '#63666A',
    },
  };

  return createMuiTheme(options);
};
