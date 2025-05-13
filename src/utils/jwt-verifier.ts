import jwt, { JwtPayload, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import config from '@config/constants';

const client = jwksRsa({
  jwksUri: `${config.auth.domain}.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid!, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export const verifyJwtToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: config.auth.audience,
        issuer: config.auth.domain,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err || !decoded) {
          return reject(err || new Error('Token verification failed'));
        }
        resolve(decoded as JwtPayload);
      },
    );
  });
};
