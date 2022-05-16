import React from 'react';
import PageNotFoundComponent from './pageNotFound.component';
import thunk from 'redux-thunk';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createMemoryHistory, History } from 'history';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import { buildTheme } from '../theming';
import { Router } from 'react-router';
import { mount, shallow } from 'enzyme';

describe('Page Not found component', () => {
  let mockStore;
  let state: StateType;
  let history: History;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };

    history = createMemoryHistory();
  });

  const theme = buildTheme(false);

  it('renders pageNotFound page correctly', () => {
    const wrapper = shallow(<PageNotFoundComponent />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should have the correct path for the links on the PageNotFound page', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <Router history={history}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <PageNotFoundComponent />
            </ThemeProvider>
          </StyledEngineProvider>
        </Router>
      </Provider>
    );

    expect(
      wrapper
        .find('[data-test-id="page-not-found-homepage-link"]')
        .first()
        .prop('to')
    ).toEqual('/');

    expect(
      wrapper
        .find('[data-test-id="page-not-found-contact-support-link"]')
        .first()
        .prop('to')
    ).toEqual('footer.links.contact');
  });
});
