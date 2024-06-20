import Axios from 'axios';
import JWTAuthProvider from './jwtAuthProvider';
import { ScheduledMaintenanceState } from '../state/scigateway.types';
import { MaintenanceState } from '../state/scigateway.types';

export default class ldapJWTAuthProvider extends JWTAuthProvider {
  public fetchScheduledMaintenanceState(): Promise<ScheduledMaintenanceState> {
    return Axios.get(`${this.authUrl}/scheduled_maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }

  public fetchMaintenanceState(): Promise<MaintenanceState> {
    return Axios.get(`${this.authUrl}/maintenance`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        this.handleAuthError(err);
      });
  }
}
