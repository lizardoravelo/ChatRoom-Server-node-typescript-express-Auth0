export interface Auth0User {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
}
