import { authState, initialState } from './reducers/scigateway.reducer';
import { AppStrings } from './scigateway.types';
import { ScigatewayState, StateType } from './state.types';
import { getAppStrings, getString } from './strings';

describe('strings', () => {
  describe('getString', () => {
    const res: AppStrings = {
      'expected-key': 'expectedValue',
      'other-key': 'unexpected Value',
    };

    it('returns key element from res object if exists', () => {
      expect(getString(res, 'expected-key')).toEqual(res['expected-key']);
    });

    it('returns key from res object if key does exist', () => {
      expect(getString(res, 'unexpected-key')).toEqual('unexpected-key');
    });

    it('returns key if res is undefined', () => {
      expect(getString(undefined, 'unexpected-key')).toEqual('unexpected-key');
    });
  });

  describe('getAppStrings', () => {
    const testRes: AppStrings = {
      'expected-key': 'expectedValue',
      'other-key': 'unexpected Value',
    };
    const otherSection: AppStrings = {
      unexpected: 'unexpected string',
    };

    const scigatewayState: ScigatewayState = {
      ...initialState,
      authorisation: { ...authState },
      res: {
        'section-name': { ...testRes },
        'unused-section': { ...otherSection },
      },
    };

    const state: StateType = {
      scigateway: { ...scigatewayState },
    };

    it('returns key element from state object if section exists', () => {
      expect(getAppStrings(state, 'section-name')).toEqual(testRes);
    });

    it('returns undefined if section name does not exist', () => {
      expect(getAppStrings(state, 'unexpected-key')).toBeUndefined();
    });

    it('returns undefined if res is undefined', () => {
      expect(
        getAppStrings(
          { ...state, scigateway: { ...state.scigateway, res: undefined } },
          'section-name'
        )
      ).toBeUndefined();
    });
  });
});
