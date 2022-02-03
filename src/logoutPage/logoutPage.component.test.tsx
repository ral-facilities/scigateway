import React from 'react';
import LogoutPage, {
  UnconnectedLogoutPage,
  CombinedLogoutPageProps,
} from './logoutPage.component';
import { StateType } from '../state/state.types';
import configureStore from 'redux-mock-store';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { Provider } from 'react-redux';
import { push } from 'connected-react-router';
import thunk from 'redux-thunk';
import TestAuthProvider from '../authentication/testAuthProvider';
import { buildTheme } from '../theming';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { createLocation } from 'history';
import { mount, shallow } from 'enzyme';

describe('logout page component', () => {
  let props: CombinedLogoutPageProps;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };

    state.scigateway.authorisation.provider = new TestAuthProvider(
      'test-token'
    );
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
    };
    const wrapper = shallow(<UnconnectedLogoutPage {...props} />);
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
    };

    const wrapper = shallow(<UnconnectedLogoutPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('signs out if sign out clicked', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LogoutPage />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );

    wrapper
      .find('[data-test-id="logout-page-button"]')
      .last()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(2);
    expect(testStore.getActions()[0]).toEqual({ type: 'scigateway:signout' });
    expect(testStore.getActions()[1]).toEqual(push('/'));
  });
});
