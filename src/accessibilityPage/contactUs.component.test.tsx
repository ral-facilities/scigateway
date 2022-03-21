import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import ContactUs from './contactUs.component';
import { StateType } from '../state/state.types';
import { authState, initialState } from '../state/reducers/scigateway.reducer';
import { createLocation } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

describe('Contact us component', () => {
  let state: StateType;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    state = {
      scigateway: { ...initialState, authorisation: { ...authState } },
      router: { location: createLocation('/') },
    };
  });

  const createShallowWrapper = (): ShallowWrapper => {
    return shallow(<ContactUs store={mockStore(state)} />);
  };

  it('renders iframe correctly if form url set', () => {
    state.scigateway.contactUsAccessibilityFormUrl = 'test-url';

    const wrapper = createShallowWrapper();

    expect(wrapper.find('#contact-us-form')).toBeTruthy();
  });

  it('renders mailto link correctly if form url not set', () => {
    state.scigateway.contactUsAccessibilityFormUrl = '';
    let wrapper = createShallowWrapper();
    expect(wrapper.find('#contact-info')).toBeTruthy();

    state.scigateway.contactUsAccessibilityFormUrl = undefined;
    wrapper = createShallowWrapper();
    expect(wrapper.find('#contact-info')).toBeTruthy();
  });
});
