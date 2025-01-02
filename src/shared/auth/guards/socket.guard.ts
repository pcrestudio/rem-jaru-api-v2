import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify, decode } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import jwkToPem from 'jwk-to-pem';

import { AuthService } from '../auth.service';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private azureAdService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake?.auth?.token;

    if (!token) {
      return false;
    }

    const unverifiedHeader = decode(token, { complete: true })?.header;
    if (!unverifiedHeader || !unverifiedHeader.kid) {
      console.error('Invalid token: No kid found in header');
      return false;
    }

    try {
      const jwk = await this.azureAdService.getAzureADPublicKeys(
        unverifiedHeader.kid,
      ); // Fetch the JWK using the 'kid'
      const pem = jwkToPem(jwk); // Convert JWK to PEM
      verify(token, pem, { algorithms: ['RS256'] }); // Use the PEM for verification
      return true; // Token is valid
    } catch (error) {
      console.error('Invalid token:', error);
      return false; // Token is invalid or some error occurred
    }
  }
}
