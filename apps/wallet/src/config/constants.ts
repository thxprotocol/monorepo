import { AccountVariant, AccessTokenKind } from '@thxnetwork/common/enums';
export { AccountVariant, AccessTokenKind } from '@thxnetwork/common/enums';

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
