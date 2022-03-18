import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  AccessibiiltyPageWithStyles,
  CombinedAccessibiiltyPageProps,
} from './accessibilityPage.component';
import { MuiThemeProvider } from '@material-ui/core';
import { buildTheme } from '../theming';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import { Provider } from 'react-redux';

const dummyClasses = {
  root: 'root-class',
  container: 'container-class',
  titleText: 'titleText-class',
  description: 'description-class',
};

describe('Accessibility page component', () => {
  let mount;
  let mockStore;
  let props: CombinedAccessibiiltyPageProps;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();
    mockStore = configureStore([thunk]);
    props = {
      classes: dummyClasses,
    };

    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  const theme = buildTheme(false);

  it('should render correctly and display contact us component', () => {
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <AccessibiiltyPageWithStyles {...props} />
        </MuiThemeProvider>
      </Provider>
    );

    expect(wrapper.find('#accessibility-page')).toBeTruthy();
    expect(wrapper.find('#contact-us')).toBeTruthy();
  });
});
