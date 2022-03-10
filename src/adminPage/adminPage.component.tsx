import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
  Paper,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { adminRoutes, PluginConfig } from '../state/scigateway.types';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Link } from 'react-router-dom';
import { ReactElement } from 'react';
import { Route, Switch, useLocation } from 'react-router';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import {
  getPluginRoutes,
  PluginPlaceHolder,
} from '../routing/routing.component';
import MaintenancePage from './maintenancePage.component';
import { useTranslation } from 'react-i18next';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
    },
    titleText: {
      color: theme.palette.secondary.main,
      fontWeight: 'bold',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      [theme.breakpoints.up(800 + theme.spacing(8))]: {
        width: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    form: {
      flexDirection: 'column',
    },
    textArea: {
      backgroundColor: 'inherit',
      color: theme.palette.text.primary,
      font: 'inherit',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: '40%',
      maxWidth: '100%',
    },
  });

export interface AdminPageProps {
  plugins: PluginConfig[];
  adminPageDefaultTab?: 'maintenance' | 'download';
}

export type CombinedAdminPageProps = AdminPageProps & WithStyles<typeof styles>;

export const AdminPage = (props: CombinedAdminPageProps): ReactElement => {
  const pluginRoutes = getPluginRoutes(props.plugins, true);

  const [tabValue, setTabValue] = React.useState<'maintenance' | 'download'>(
    props.adminPageDefaultTab ?? 'maintenance'
  );

  const location = useLocation();

  React.useEffect(() => {
    // Allows direct access to the download page when maintenance page is default
    if (
      location.pathname === adminRoutes['download'] &&
      tabValue !== 'download'
    ) {
      setTabValue('download');
    }
    // Allows direct access to the maintenance page when download page is default
    else if (
      location.pathname === adminRoutes['maintenance'] &&
      tabValue !== 'maintenance'
    ) {
      setTabValue('maintenance');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const [t] = useTranslation();

  return (
    <Paper id="admin-page" className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {t('admin.title')}
      </Typography>
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => {
          setTabValue(newValue);
        }}
        textColor="secondary"
      >
        <Tab
          id="maintenance-tab"
          aria-controls="maintenance-panel"
          label="Maintenance"
          value="maintenance"
          component={Link}
          to={adminRoutes.maintenance}
          className={props.classes.tab}
        />
        <Tab
          id="download-tab"
          label="Admin Download"
          value="download"
          aria-controls="download-panel"
          component={Link}
          to={adminRoutes.download}
          className={props.classes.tab}
        />
      </Tabs>
      <Switch>
        <Route exact path={adminRoutes.maintenance}>
          <div
            id="maintenance-panel"
            aria-labelledby="maintenance-tab"
            role="tabpanel"
            hidden={tabValue !== 'maintenance'}
          >
            <MaintenancePage />
          </div>
        </Route>

        {Object.entries(pluginRoutes).map(([key, value]) => {
          return (
            <Route exact key={key} path={value}>
              <div
                id="download-panel"
                aria-labelledby="download-tab"
                role="tabpanel"
                hidden={tabValue !== 'download'}
              >
                <PluginPlaceHolder id={key} />
              </div>
            </Route>
          );
        })}
        <Route component={PageNotFound} />
      </Switch>
    </Paper>
  );
};

const mapStateToProps = (state: StateType): AdminPageProps => ({
  plugins: state.scigateway.plugins,
  adminPageDefaultTab: state.scigateway.adminPageDefaultTab,
});

export const AdminPageWithStyles = withStyles(styles)(AdminPage);

export default connect(mapStateToProps)(AdminPageWithStyles);
