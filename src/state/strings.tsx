import { AppStrings } from './daaas.types';
import { StateType } from './state.types';

export function getAppStrings(
  state: StateType,
  section: string
): AppStrings | undefined {
  return state.daaas.res ? state.daaas.res[section] : undefined;
}

export const getString = (res: AppStrings | undefined, key: string): string =>
  (res && res[key]) || key;
