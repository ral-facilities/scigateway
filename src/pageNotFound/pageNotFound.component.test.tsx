import React from 'react';
import PageNotFoundWithStyles, {
  PageNotFoundComponent,
  PageNotFoundProps,
} from './pageNotFound.component';
import { createMount, createShallow } from '@mui/material/test-utils';
import thunk from 'redux-thunk';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createMemoryHistory, History } from 'history';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import { buildTheme } from '../theming';
import { Router } from 'react-router';

describe('Page Not found component', () => {
  let shallow;
  let props: PageNotFoundProps;
  let mockStore;
  let state: StateType;
  let mount;
  let history: History;

  const dummyClasses = {
    titleContainer: 'titleContainer-class',
    bugIcon: 'paper-class',
    codeText: 'bugIcon-class',
    container: 'container-class',
    bold: 'bold-class',
    message: 'message-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };

    history = createMemoryHistory();

    props = { classes: dummyClasses };
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme(false);

  it('renders pageNotFound page correctly', () => {
    const wrapper = shallow(<PageNotFoundComponent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should have the correct path for the links on the PageNotFound page', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <Router history={history}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <PageNotFoundWithStyles />
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
    ).toEqual('/contact');
  });
});
