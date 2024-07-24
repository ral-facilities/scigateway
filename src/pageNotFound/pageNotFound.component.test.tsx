import React from 'react';
import PageNotFoundComponent from './pageNotFound.component';
import { thunk } from 'redux-thunk';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createMemoryHistory, History } from 'history';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/state.types';
import { Provider } from 'react-redux';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { buildTheme } from '../theming';
import { Router } from 'react-router';
import { render, screen } from '@testing-library/react';

describe('Page Not found component', () => {
  let state: StateType;
  let history: History;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return (
      <Provider store={configureStore([thunk])(state)}>
        <Router history={history}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </StyledEngineProvider>
        </Router>
      </Provider>
    );
  }

  beforeEach(() => {
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
    };

    history = createMemoryHistory();
  });

  const theme = buildTheme(false);

  it('renders pageNotFound page correctly', () => {
    const { asFragment } = render(<PageNotFoundComponent />, {
      wrapper: Wrapper,
    });

    expect(asFragment()).toMatchSnapshot();
    expect(screen.getByRole('link', { name: 'homepage' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(
      screen.getByRole('link', { name: 'contact support' })
    ).toHaveAttribute('href', '/footer.links.contact');
  });
});
