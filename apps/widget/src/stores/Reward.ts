import { defineStore } from 'pinia';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';

// const thx = new THXClient({
//   clientId: process.env['VUE_APP_CLIENT_ID'] as string,
//   clientSecret: process.env['VUE_APP_CLIENT_SECRET'] as string,
//   redirectUrl: AUTH_URL + '/signin-oidc',
//   scopes: 'openid account:read erc20:read erc721:read',
// });

export const useRewardStore = defineStore('rewards', {
  state: () => {
    return {
      erc20s: [
        {
          balance: 500,
          symbol: 'TRY',
          name: 'TryHards',
          logoImg: `https://avatars.dicebear.com/api/identicon/tryhards.svg`,
        },
        {
          balance: 1500,
          symbol: 'THX',
          name: 'THX Network',
          logoImg: `https://avatars.dicebear.com/api/identicon/thxnetwork.svg`,
        },
      ],
      rewards: [
        {
          amount: 50,
          title: 'Refer a friend',
          description:
            'Help us onboard more users to our great game and get rewarded for it with ICE and our forever gratitude.',
          variant: RewardVariant.Referral,
          claimed: false,
          brand: Brands.None,
        },
        {
          amount: 500,
          title: 'Follow us on Twitter',
          description:
            'Verify your follow by connecting your Twitter account before submitting your claim.',
          variant: RewardVariant.ERC20,
          claimed: false,
          brand: Brands.None,
        },
        {
          amount: 50,
          title: 'Like this video on Youtube',
          description:
            'Verify your follow by connecting your Twitter account before submitting your claim.',
          variant: RewardVariant.ERC721,
          claimed: true,
          brand: Brands.Google,
        },
      ],
    };
  },
});
