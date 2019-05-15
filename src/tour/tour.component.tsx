import React, { useState } from 'react';
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  ACTIONS,
  EVENTS,
} from 'react-joyride';
import { Theme, withTheme } from '@material-ui/core/styles';
import { UKRITheme } from '../theming';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { toggleHelp } from '../state/actions/daaas.actions';
import { Dispatch, Action } from 'redux';
import { getAppStrings, getString } from '../state/strings';
import { AppStrings } from '../state/daaas.types';

const handleJoyrideCallback = (
  data: CallBackProps,
  dismissHelp: () => Action,
  setStepIndex: React.Dispatch<React.SetStateAction<number>>
): void => {
  const { status, action, index, type } = data;
  if (
    status === STATUS.FINISHED ||
    (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE)
  ) {
    setStepIndex(0);
    dismissHelp();
  } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
    setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
  }
};

interface TourProps {
  showHelp: boolean;
  showContactButton: boolean;
  res: AppStrings | undefined;
}

interface TourDispatchProps {
  dismissHelp: () => Action;
}

type CombinedTourProps = TourProps & TourDispatchProps & { theme: Theme };

const Tour = (props: CombinedTourProps): React.ReactElement => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps: Step[] = [
    {
      target: '.tour-title',
      disableBeacon: true,
      content: getString(props.res, 'title'),
    },
    {
      target: '.tour-user-profile',
      content: getString(props.res, 'user-profile'),
    },
    {
      target: '.tour-notifications',
      content: getString(props.res, 'notifications'),
    },
    {
      target: '.tour-nav-menu',
      content: getString(props.res, 'nav-menu'),
    },
    ...(props.showContactButton
      ? [
          {
            target: '.tour-contact',
            content: getString(props.res, 'contact'),
          },
        ]
      : []),
  ];
  return (
    <Joyride
      steps={steps}
      stepIndex={stepIndex}
      run={props.showHelp}
      continuous={true}
      callback={(data: CallBackProps) =>
        handleJoyrideCallback(data, props.dismissHelp, setStepIndex)
      }
      styles={{
        options: {
          primaryColor: (props.theme as UKRITheme).ukri.orange,
        },
      }}
    />
  );
};

const mapStateToProps = (state: StateType): TourProps => ({
  showHelp: state.daaas.showHelp,
  showContactButton: state.daaas.features.showContactButton,
  res: getAppStrings(state, 'tour'),
});

const mapDispatchToProps = (dispatch: Dispatch): TourDispatchProps => ({
  dismissHelp: () => dispatch(toggleHelp()),
});

export const TourWithStyles = withTheme()(Tour);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TourWithStyles);
