import JWTAuthProvider from './jwtAuthProvider';
import parseJwt from './parseJwt';

export default class OGJWTAuthProvider extends JWTAuthProvider {
  public isAdmin(): boolean {
    if (!this.token) return false;
    const tokenString = parseJwt(this.token);
    const tokenObject = JSON.parse(tokenString);
    if (
      !tokenObject.authorised_routes ||
      tokenObject.authorised_routes.length === 0
    )
      return false;
    // TODO change '/users POST' to '/users GET' once that route is created
    return tokenObject.authorised_routes.includes('/users POST');
  }
}
