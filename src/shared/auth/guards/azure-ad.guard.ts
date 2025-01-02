import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AzureAdAuthGuard extends AuthGuard('azure-ad') {}
//export class AzureAdAuthGuard extends AuthGuard('oauth-bearer') {
//   constructor() {
//     super();
//   }
// }
