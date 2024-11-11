import { Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { PluginConfig } from '../state/scigateway.types';
import { StateType } from '../state/state.types';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import {
  getAdminRoutes,
  PluginPlaceHolder,
} from '../routing/routing.component';
import MaintenancePage from './maintenancePage.component';

export interface AdminPageProps {
  plugins: PluginConfig[];
  adminPageDefaultTab?: string;
}

export const getAdminPluginRoutes = (props: {
  plugins: PluginConfig[];
}): Record<string, Record<string, string>> => {
  const { plugins } = props;
  const pluginRoutes: Record<string, Record<string, string>> = {};

  plugins.forEach((p) => {
    const basePluginLink = p.link.split('?')[0];

    if (p.admin) {
      // Extract `plugin` and `tabName` values from the link
      const tabName = basePluginLink.split('/')[2]; // Ignore `/admin` part, get the tabName as the third part

      // Initialize nested structure for each plugin and tabName
      if (!pluginRoutes[p.plugin]) {
        pluginRoutes[p.plugin] = {};
      }

      // Only store the first route (or the most relevant one)
      if (!pluginRoutes[p.plugin][tabName]) {
        pluginRoutes[p.plugin][tabName] = basePluginLink;
      }
    }
  });

  return pluginRoutes;
};

const AdminPage = (props: AdminPageProps): ReactElement => {
  const pluginRoutes = getAdminPluginRoutes({ plugins: props.plugins });
  const adminRoutes = getAdminRoutes({ plugins: props.plugins });

  const location = useLocation();
  const [tabValue, setTabValue] = React.useState<string>(
    (Object.keys(adminRoutes) as (keyof typeof adminRoutes)[]).find((key) =>
      location.pathname.startsWith(adminRoutes[key])
    ) ??
      (props.adminPageDefaultTab &&
      adminRoutes.hasOwnProperty(props.adminPageDefaultTab)
        ? props.adminPageDefaultTab
        : 'maintenance')
  );

  const [t] = useTranslation();

  return (
    <Paper
      sx={{
        padding: 2,
        flexGrow: 1,
        backgroundColor: 'background.default',
      }}
    >
      <Typography
        variant="h3"
        sx={{ color: 'secondary.main', fontWeight: 'bold' }}
      >
        {t('admin.title')}
      </Typography>
      <Tabs
        textColor="secondary"
        indicatorColor="secondary"
        value={tabValue}
        onChange={(event, newValue) => {
          setTabValue(newValue);
        }}
      >
        {Object.entries(adminRoutes).map(([key, value]) => {
          const pluginDetails = props.plugins.find(
            (plugin) => plugin.link === value
          );

          return (
            <Tab
              key={key}
              id={`${key}-tab`}
              label={
                pluginDetails?.displayName ||
                `${key.charAt(0).toUpperCase() + key.slice(1)}`
              }
              value={key}
              aria-controls={`${key}-panel`}
              component={Link}
              to={value}
            />
          );
        })}
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

        {Object.entries(pluginRoutes).map(([pluginName, tabRoutes]) =>
          Object.entries(tabRoutes).map(([tabName, route]) => (
            <Route key={`${pluginName}-${tabName}}`} path={route}>
              <div
                id={`${tabName}-panel`}
                aria-labelledby={`${tabName}-tab`}
                role="tabpanel"
                hidden={tabValue !== tabName}
              >
                <PluginPlaceHolder id={pluginName} />
              </div>
            </Route>
          ))
        )}

        <Route component={PageNotFound} />
      </Switch>
    </Paper>
  );
};

const mapStateToProps = (state: StateType): AdminPageProps => ({
  plugins: state.scigateway.plugins,
  adminPageDefaultTab: state.scigateway.adminPageDefaultTab,
});

export const UnconnectedAdminPage = AdminPage;

export default connect(mapStateToProps)(AdminPage);
