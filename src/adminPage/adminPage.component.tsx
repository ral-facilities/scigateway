import React, { ReactElement } from 'react';
import Typography from '@mui/material/Typography';
import { Paper } from '@mui/material';
import { connect } from 'react-redux';
import { StateType } from '../state/state.types';
import { adminRoutes, PluginConfig } from '../state/scigateway.types';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import PageNotFound from '../pageNotFound/pageNotFound.component';
import {
  getPluginRoutes,
  PluginPlaceHolder,
} from '../routing/routing.component';
import MaintenancePage from './maintenancePage.component';
import { useTranslation } from 'react-i18next';

export interface AdminPageProps {
  plugins: PluginConfig[];
  adminPageDefaultTab?: 'maintenance' | 'download';
}

const AdminPage = (props: AdminPageProps): ReactElement => {
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
        <Tab
          id="maintenance-tab"
          aria-controls="maintenance-panel"
          label="Maintenance"
          value="maintenance"
          component={Link}
          to={adminRoutes.maintenance}
        />
        <Tab
          id="download-tab"
          label="Admin Download"
          value="download"
          aria-controls="download-panel"
          component={Link}
          to={adminRoutes.download}
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

export const UnconnectedAdminPage = AdminPage;

export default connect(mapStateToProps)(AdminPage);
