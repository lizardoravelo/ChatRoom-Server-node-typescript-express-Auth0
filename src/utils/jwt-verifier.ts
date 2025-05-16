import jwt, { JwtPayload, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import config from '@config/constants';

const issuer = `https://${config.auth.domain}/`; // ✅ trailing slash required
const jwksUri = `${issuer}.well-known/jwks.json`;

const client = jwksRsa({
  jwksUri,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('Missing "kid" in token header'), undefined);
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, undefined);

    const signingKey = key?.getPublicKey();
    if (!signingKey) {
      return callback(new Error('Signing key not found'), undefined);
    }

    callback(null, signingKey);
  });
}

export const verifyJwtToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: config.auth.audience,
        issuer,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          console.error('❌ JWT verification error:', err);
          return reject(err instanceof Error ? err : new Error(String(err)));
        }

        if (!decoded) {
          return reject(new Error('Token verification failed'));
        }

        resolve(decoded as JwtPayload);
      },
    );
  });
};
