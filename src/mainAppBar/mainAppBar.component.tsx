import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules,
} from '@material-ui/core/styles';

interface MainAppBarProps {
  classes: Record<string, string>;
}

interface MenuButtonProps {
  buttonText: string;
  buttonClassName: string;
}

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      width: '100%',
    },
    grow: {
      flexGrow: 1,
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
      marginRight: 20,
    },
    button: {
      margin: theme.spacing.unit,
      color: theme.palette.primary.contrastText,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
      color: theme.palette.primary.contrastText,
    },
  });

const MenuButton = (props: MenuButtonProps): React.ReactElement => (
  <Button className={props.buttonClassName}>
    <Typography color="inherit" noWrap style={{ marginTop: 3 }}>
      {props.buttonText}
    </Typography>
  </Button>
);

const MainAppBar = (props: MainAppBarProps): React.ReactElement => (
  <div className={props.classes.root}>
    <AppBar position="static">
      <Toolbar>
        <IconButton className={props.classes.menuButton} color="inherit">
          <MenuIcon />
        </IconButton>
        <Typography
          className={props.classes.title}
          variant="h6"
          color="inherit"
          noWrap
        >
          Data Analysis as a Service
        </Typography>
        <MenuButton
          buttonText="Contact"
          buttonClassName={props.classes.button}
        />
        <div className={props.classes.grow} />
        <IconButton className={props.classes.button}>
          <HelpIcon />
        </IconButton>
        <IconButton className={props.classes.button}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  </div>
);

export default withStyles(styles)(MainAppBar);
