import { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';
export { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';

export const accountVariantProviderKindMap: { [variant: number]: string } = {
    [AccountVariant.SSOGoogle]: 'google',
    [AccountVariant.SSOTwitter]: 'twitter',
    [AccountVariant.SSODiscord]: 'discord',
    [AccountVariant.SSOGithub]: 'github',
    [AccountVariant.SSOTwitch]: 'twitch',
};

export enum OAuthGoogleScope {
    OpenID = 'openid',
    Email = 'https://www.googleapis.com/auth/userinfo.email',
    YoutubeReadOnly = 'https://www.googleapis.com/auth/youtube.readonly',
}

export enum OAuthTwitterScope {
    OfflineAccess = 'offline.access',
    UsersRead = 'users.read',
    TweetRead = 'tweet.read',
    FollowsWrite = 'follows.write',
    LikeRead = 'like.read',
}

export enum OAuthDiscordScope {
    Identify = 'identify',
    Email = 'email',
    Guilds = 'guilds',
}

export enum OAuthTwitchScope {
    Email = 'user:read:email',
    Follows = 'user:read:follows',
    Broadcast = 'user:read:broadcast',
}

export enum OAuthGithubScope {
    PublicRepo = 'public_repo',
}

export const OAuthRequiredScopes = {
    GoogleAuth: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email],
    TwitterAuth: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    DiscordAuth: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email],
    TwitchAuth: [OAuthTwitchScope.Email, OAuthTwitchScope.Follows, OAuthTwitchScope.Broadcast],
    GithubAuth: [OAuthGithubScope.PublicRepo],
};

export const OAuthScopes: { [provider: string]: string[] } = {
    [AccessTokenKind.Google]: OAuthRequiredScopes.GoogleAuth,
    [AccessTokenKind.Discord]: OAuthRequiredScopes.DiscordAuth,
    [AccessTokenKind.Twitter]: OAuthRequiredScopes.TwitterAuth,
    [AccessTokenKind.Github]: OAuthRequiredScopes.GithubAuth,
    [AccessTokenKind.Twitch]: OAuthRequiredScopes.TwitchAuth,
};

export const contractNetworks = {
    // Hardhat
    '31337': {
        // Safe
        simulateTxAccessorAddress: '0x278Ff6d33826D906070eE938CDc9788003749e93',
        safeProxyFactoryAddress: '0xEAB9a65eB0F098f822033192802B53EE159De5F0',
        fallbackHandlerAddress: '0x055cBfeD6df4AFE2452b18fd3D2592D1795592b4',
        createCallAddress: '0xb63564A81D5d4004F4f22E9aB074cE25540B0C26',
        multiSendAddress: '0x50aF0922d65D04D87d810048Dc640E2474eBfbd9',
        multiSendCallOnlyAddress: '0x15FC0878406CcF4d2963235A5B1EF68C67F17Ee5',
        signMessageLibAddress: '0xa4E84979c95cD4f12C53E73d63E0A8634A1f44Ae',
        safeMasterCopyAddress: '0xd916a690676e925Ac9Faf2d01869c13Fd9757ef2',
    },
    // Linea
    '59144': {
        // Safe
        simulateTxAccessorAddress: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
        safeProxyFactoryAddress: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        fallbackHandlerAddress: '0x1AC114C2099aFAf5261731655Dc6c306bFcd4Dbd',
        createCallAddress: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',
        multiSendAddress: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
        multiSendCallOnlyAddress: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
        signMessageLibAddress: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
        safeMasterCopyAddress: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    },
    // Polygon
    '137': {
        simulateTxAccessorAddress: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
        safeProxyFactoryAddress: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
        fallbackHandlerAddress: '0x1AC114C2099aFAf5261731655Dc6c306bFcd4Dbd',
        createCallAddress: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',
        multiSendAddress: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
        multiSendCallOnlyAddress: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
        signMessageLibAddress: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
        safeMasterCopyAddress: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    },
} as unknown as { [chainId: string]: any } as any;
