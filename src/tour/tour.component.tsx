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
  helpSteps: Step[];
}

interface TourDispatchProps {
  dismissHelp: () => Action;
}

type CombinedTourProps = TourProps & TourDispatchProps & { theme: Theme };

const Tour = (props: CombinedTourProps): React.ReactElement => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = props.helpSteps;
  if (steps[0]) {
    steps[0] = { ...steps[0], disableBeacon: true };
  }

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
  helpSteps: state.daaas.helpSteps,
  showContactButton: state.daaas.features.showContactButton,
});

const mapDispatchToProps = (dispatch: Dispatch): TourDispatchProps => ({
  dismissHelp: () => dispatch(toggleHelp()),
});

export const TourWithStyles = withTheme()(Tour);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TourWithStyles);
