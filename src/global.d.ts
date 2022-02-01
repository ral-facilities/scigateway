import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';

declare module 'single-spa';

/* The below provides the ability to override styles for MuiPickersDay */
type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};
declare module '@mui/material/styles/overrides' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}
}
