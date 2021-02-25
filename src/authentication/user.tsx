import { User } from '../state/state.types';

export default class UserInfo implements User {
  public username: string;
  public isAdmin: boolean;
  public avatarUrl: string;

  public constructor(username: string) {
    this.username = username;
    this.isAdmin = false;
    this.avatarUrl = '';
  }
}
