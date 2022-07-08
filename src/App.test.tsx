import { mount } from 'enzyme';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import * as singleSpa from 'single-spa';
import App from './App';
import { flushPromises } from './setupTests';
import { loadAuthProvider } from './state/actions/scigateway.actions';

describe('App', () => {
  beforeEach(() => {
    singleSpa.start();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('loadMaintenanceState dispatched when maintenance changes', async () => {
    // this test only works with old jest fake timers
    // when they remove legacy timers refactor this test to use real timers
    jest.useFakeTimers('legacy');
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
