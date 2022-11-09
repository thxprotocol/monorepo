import { defineStore } from 'pinia';
import { THXClient } from '@thxnetwork/sdk';

export const clientStore = defineStore('user', {
  state: () => {
    return {
      client: new THXClient({
        clientId: process.env['VUE_APP_CLIENT_ID'] as string,
        clientSecret: process.env['VUE_APP_CLIENT_SECRET'] as string,
        grantType: 'authorization_code',
        redirectUrl: 'http://192.168.1.3:8080/signin-oidc',
        scopes: 'openid account:read erc20:read erc721:read',
      }),
    };
  },
});
