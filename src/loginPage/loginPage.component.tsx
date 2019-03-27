import React from 'react';
import TextField from '@material-ui/core/TextField';

const LoginPageComponent = (): React.ReactElement => (
  <div>
    <br />
    <div>
      <TextField label="Username:" defaultValue=" " />
    </div>
    <br />
    <div>
      <TextField label="Password" defaultValue="******" />
    </div>
  </div>
);

export default LoginPageComponent;
