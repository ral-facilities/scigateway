import React from 'react';
import LogoutPage, {
  LogoutPageComponent,
  CombinedLogoutPageProps,
} from './logoutPage.component';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import thunk from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createLocation } from 'history';

describe('logout page component', () => {
  let shallow;
  let mount;
  let props: CombinedLogoutPageProps;
  let mockStore;
  let state: StateType;

  const dummyClasses = {
    root: 'root-1',
    paper: 'paper-class',
    avatar: 'avatar-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };

    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
  });

  afterEach(() => {
    mount.cleanUp();
  });

  const theme = buildTheme(false);

  it('renders the logout page correctly with default avatar ', () => {
    props = {
      user: {
        username: 'simple/root',
        isAdmin: false,
        avatarUrl: '',
      },
      res: undefined,
      classes: dummyClasses,
    };
    const wrapper = shallow(<LogoutPageComponent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the logout page correctly with avatar using avatarurl) ', () => {
    props = {
      user: {
        username: 'simple/root',
        isAdmin: false,
        avatarUrl: 'test_url',
      },
      res: undefined,
      classes: dummyClasses,
    };

    const wrapper = shallow(<LogoutPageComponent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('signs out if sign out clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MuiThemeProvider theme={theme}>
          <LogoutPage />
        </MuiThemeProvider>
      </Provider>
    );

    wrapper
      .find('[data-testid="logout-page-button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
