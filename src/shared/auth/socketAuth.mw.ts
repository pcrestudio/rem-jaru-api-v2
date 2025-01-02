import { Socket } from 'socket.io';
import jwkToPem from 'jwk-to-pem';
import { verify, decode } from 'jsonwebtoken';
import { AuthService } from './auth.service';

export const SocketAuthMiddleware =
  (azureAdService: AuthService) =>
  async (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: Token not found'));
    }

    const unverifiedHeader = decode(token, { complete: true })?.header;
    if (!unverifiedHeader || !unverifiedHeader.kid) {
      console.error('Invalid token: No kid found in header');
      return next(
        new Error('Authentication error: No kid found in token header'),
      );
    }

    try {
      const jwk = await azureAdService.getAzureADPublicKeys(
        unverifiedHeader.kid,
      ); // Fetch the JWK using the 'kid'
      const pem = jwkToPem(jwk); // Convert JWK to PEM
      const decodedToken = verify(token, pem, { algorithms: ['RS256'] }); // Use the PEM for verification

      // Attach user information to the socket instance for later use
      socket.data = {
        user: decodedToken,
        token: token,
      };
      next(); // Token is valid
    } catch (error) {
      //console.error('Authentication error:', error);
      next(new Error(`Authentication error: ${error.message}`));
    }
  };
