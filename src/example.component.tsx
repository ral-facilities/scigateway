import React from 'react';
import { connect } from 'react-redux';
import { StateType } from './state/state.types';

interface ExampleComponentProps {
  notifications: string[];
}

const ExampleComponent = (props: ExampleComponentProps): React.ReactElement => (
  <div>{props.notifications}</div>
);

const mapStateToProps = (state: StateType): ExampleComponentProps => {
  return {
    notifications: state.daaas.notifications,
  };
};

export default connect(mapStateToProps)(ExampleComponent);
