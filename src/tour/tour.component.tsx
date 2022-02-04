import React, { useCallback } from 'react';
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  ACTIONS,
  EVENTS,
} from 'react-joyride';
import { lighten, useTheme } from '@mui/material/styles';
import { UKRITheme } from '../theming';
import { StateType } from '../state/state.types';
import { connect } from 'react-redux';
import { toggleHelp, toggleDrawer } from '../state/actions/scigateway.actions';
import { Dispatch, Action } from 'redux';

interface TourProps {
  showHelp: boolean;
  helpSteps: Step[];
  drawerOpen: boolean;
  loggedIn: boolean;
}

interface TourDispatchProps {
  dismissHelp: () => Action;
  toggleDrawer: () => Action;
}

export type CombinedTourProps = TourProps & TourDispatchProps;

const Tour = (props: CombinedTourProps): React.ReactElement => {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = React.useState(0);
  const { helpSteps, loggedIn, showHelp } = props;

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps, indexMenuOpen: number, waitTime: number): void => {
      const { status, action, index, type } = data;
      const { toggleDrawer, drawerOpen, dismissHelp } = props;

      if (
        action === ACTIONS.START &&
        type === EVENTS.STEP_BEFORE &&
        drawerOpen
      ) {
        toggleDrawer();
        setStepIndex(0);
      } else if (
        index === indexMenuOpen - 1 &&
        action === ACTIONS.NEXT &&
        type === EVENTS.STEP_AFTER &&
        !drawerOpen
      ) {
        toggleDrawer();
        setTimeout(() => {
          setStepIndex(index + 1);
        }, waitTime);
      } else if (
        index === indexMenuOpen &&
        action === ACTIONS.PREV &&
        type === EVENTS.STEP_AFTER &&
        drawerOpen
      ) {
        toggleDrawer();
        setTimeout(() => {
          setStepIndex(index - 1);
        }, waitTime);
      } else if (
        status === STATUS.FINISHED ||
        (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE)
      ) {
        setStepIndex(0);
        dismissHelp();
      } else if (
        type === EVENTS.STEP_AFTER ||
        type === EVENTS.TARGET_NOT_FOUND
      ) {
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      }
    },
    [props]
  );

  const steps = helpSteps
    .map((step) => ({ ...step, disableBeacon: true }))
    .filter(
      (step) => !step.target.toString().includes('plugin-link') || loggedIn
    )
    .filter(
      (step) =>
        !step.target.toString().startsWith('.tour-') ||
        document.getElementsByClassName(step.target.toString().substr(1)).length
    );

  const indexPluginLinks = steps.findIndex((step) =>
    step.target.toString().includes('plugin-link')
  );

  return (
    <Joyride
      steps={steps}
      stepIndex={stepIndex}
      run={showHelp}
      continuous={true}
      callback={(data: CallBackProps) =>
        handleJoyrideCallback(
          data,
          indexPluginLinks,
          theme.transitions.duration.enteringScreen + 200
        )
      }
      styles={{
        buttonBack: {
          color:
            //For WCAG 2.1 contrast, need dark mode colour be slighly lighter as
            //same colour breaks contrast for next button
            theme.palette.mode === 'dark'
              ? lighten((theme as UKRITheme).colours.orange, 0.15)
              : (theme as UKRITheme).colours.orange,
        },
        options: {
          primaryColor: (theme as UKRITheme).colours.darkOrange,
          backgroundColor: theme.palette.background.default,
          arrowColor: theme.palette.background.default,
          textColor: theme.palette.text.primary,
          zIndex: 1500,
        },
      }}
    />
  );
};

const mapStateToProps = (state: StateType): TourProps => ({
  showHelp: state.scigateway.showHelp,
  helpSteps: state.scigateway.helpSteps,
  drawerOpen: state.scigateway.drawerOpen,
  loggedIn: state.scigateway.authorisation.provider.isLoggedIn(),
});

const mapDispatchToProps = (dispatch: Dispatch): TourDispatchProps => ({
  dismissHelp: () => dispatch(toggleHelp()),
  toggleDrawer: () => dispatch(toggleDrawer()),
});

export const UnconnectedTour = Tour;

export default connect(mapStateToProps, mapDispatchToProps)(Tour);
