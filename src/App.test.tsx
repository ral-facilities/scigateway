import { createMount } from '@material-ui/core/test-utils';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import App from './App';
import { flushPromises } from './setupTests';
import { loadAuthProvider } from './state/actions/scigateway.actions';

describe('App', () => {
  let mount;

  beforeEach(() => {
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('loadMaintenanceState dispatched when maintenance changes', async () => {
    jest.useFakeTimers();
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: true,
          message: '',
        },
      })
    );

    const wrapper = mount(<App />);
    const realStore = wrapper.find(Provider).prop('store');
    // Set provider to icat as that supports maintenance states
    realStore.dispatch(
      loadAuthProvider('icat.user/pass', 'http://localhost:8000')
    );
    expect(realStore.getState().scigateway.maintenance).toEqual({
      show: false,
      message: '',
    });

    jest.runOnlyPendingTimers();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(realStore.getState().scigateway.maintenance).toEqual({
      show: true,
      message: '',
    });

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          show: true,
          message: 'test message',
        },
      })
    );

    jest.runOnlyPendingTimers();
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(realStore.getState().scigateway.maintenance).toEqual({
      show: true,
      message: 'test message',
    });
  });
});
