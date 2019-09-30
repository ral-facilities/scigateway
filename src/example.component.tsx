import React from 'react';
import { connect } from 'react-redux';
import { ScigatewayNotification, StateType } from './state/state.types';

interface ExampleComponentProps {
  notifications: ScigatewayNotification[];
}

const ExampleComponent = (props: ExampleComponentProps): React.ReactElement => (
  <div>{props.notifications}</div>
);

const mapStateToProps = (state: StateType): ExampleComponentProps => {
  return {
    notifications: state.scigateway.notifications,
  };
};

export default connect(mapStateToProps)(ExampleComponent);
