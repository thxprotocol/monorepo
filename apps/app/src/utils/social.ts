import { QuestSocialRequirement } from '../types/enums/rewards';
import { AccountVariant } from '../types/enums/accountVariant';

function getConnectedUser(account: TAccount, kind: AccessTokenKind, requiredScopes: TOAuthScope[] = []) {
    return account.tokens.find((a) => a.kind === kind && requiredScopes.every((scope) => a.scopes.includes(scope)));
}

export enum AccessTokenKind {
    Auth = 'authentication',
    Signup = 'signup',
    VerifyEmail = 'verify-email',
    Google = 'google',
    Twitter = 'twitter',
    Discord = 'discord',
    Twitch = 'twitch',
    Github = 'github',
}

const interactionLabelMap: { [i: number]: string } = {
    [QuestSocialRequirement.TwitterFollow]: 'Follow on 𝕏',
    [QuestSocialRequirement.TwitterRetweet]: 'Repost on 𝕏',
    [QuestSocialRequirement.TwitterQuery]: 'Post on 𝕏',
    [QuestSocialRequirement.YouTubeLike]: 'Watch & Like on YouTube',
    [QuestSocialRequirement.YouTubeSubscribe]: 'Subscribe on YouTube',
    [QuestSocialRequirement.DiscordGuildJoined]: 'Join Discord',
    [QuestSocialRequirement.DiscordMessage]: '',
};

const platformIconMap: { [kind: string]: string } = {
    [AccessTokenKind.Google]: 'fab fa-youtube',
    [AccessTokenKind.Twitter]: 'fab fa-twitter',
    [AccessTokenKind.Discord]: 'fab fa-discord',
};

const kindAccountVariantMap: { [kind: string]: number } = {
    [AccessTokenKind.Google]: AccountVariant.SSOGoogle,
    [AccessTokenKind.Twitter]: AccountVariant.SSOTwitter,
    [AccessTokenKind.Discord]: AccountVariant.SSODiscord,
    [AccessTokenKind.Github]: AccountVariant.SSOGithub,
    [AccessTokenKind.Twitch]: AccountVariant.SSOTwitch,
};

const interactionComponentMap: { [req: number]: string } = {
    [QuestSocialRequirement.YouTubeLike]: 'BaseBlockquoteVideo',
    [QuestSocialRequirement.YouTubeSubscribe]: 'BaseBlockquoteYoutubeChannelSubscription',
    [QuestSocialRequirement.TwitterRetweet]: 'BaseBlockquoteTwitterTweet',
    [QuestSocialRequirement.TwitterFollow]: 'BaseBlockquoteTwitterUser',
    [QuestSocialRequirement.TwitterQuery]: 'BaseBlockquoteTwitterQuery',
    [QuestSocialRequirement.DiscordGuildJoined]: 'BaseBlockquoteDiscordServerJoin',
    [QuestSocialRequirement.DiscordGuildRole]: 'BaseBlockquoteDiscordServerRole',
    [QuestSocialRequirement.DiscordMessage]: 'BaseBlockquoteDiscordMessage',
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
    GoogleYoutubeSubscribe: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email, OAuthGoogleScope.YoutubeReadOnly],
    GoogleYoutubeLike: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email, OAuthGoogleScope.YoutubeReadOnly],
    TwitterAuth: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateRepost: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateLike: [
        OAuthTwitterScope.OfflineAccess,
        OAuthTwitterScope.UsersRead,
        OAuthTwitterScope.TweetRead,
        OAuthTwitterScope.LikeRead,
    ],
    TwitterValidateFollow: [
        OAuthTwitterScope.OfflineAccess,
        OAuthTwitterScope.UsersRead,
        OAuthTwitterScope.TweetRead,
        OAuthTwitterScope.LikeRead,
        OAuthTwitterScope.FollowsWrite,
    ],
    DiscordAuth: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email],
    DiscordValidateGuild: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email, OAuthDiscordScope.Guilds],
    TwitchAuth: [OAuthTwitchScope.Email, OAuthTwitchScope.Follows, OAuthTwitchScope.Broadcast],
    GithubAuth: [OAuthGithubScope.PublicRepo],
};

const tokenInteractionMap: { [interaction: number]: { kind: AccessTokenKind; scopes: TOAuthScope[] } } = {
    [QuestSocialRequirement.YouTubeLike]: {
        kind: AccessTokenKind.Google,
        scopes: OAuthRequiredScopes.GoogleYoutubeLike,
    },
    [QuestSocialRequirement.YouTubeSubscribe]: {
        kind: AccessTokenKind.Google,
        scopes: OAuthRequiredScopes.GoogleYoutubeSubscribe,
    },
    [QuestSocialRequirement.TwitterRetweet]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateRepost,
    },
    [QuestSocialRequirement.TwitterFollow]: {
        kind: AccessTokenKind.Twitter,
        scopes: OAuthRequiredScopes.TwitterValidateFollow,
    },
    [QuestSocialRequirement.TwitterQuery]: { kind: AccessTokenKind.Twitter, scopes: OAuthRequiredScopes.TwitterAuth },
    [QuestSocialRequirement.DiscordGuildJoined]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordValidateGuild,
    },
    [QuestSocialRequirement.DiscordGuildRole]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordAuth,
    },
    [QuestSocialRequirement.DiscordMessage]: { kind: AccessTokenKind.Discord, scopes: OAuthRequiredScopes.DiscordAuth },
    [QuestSocialRequirement.DiscordMessageReaction]: {
        kind: AccessTokenKind.Discord,
        scopes: OAuthRequiredScopes.DiscordAuth,
    },
};

export {
    interactionLabelMap,
    getConnectedUser,
    interactionComponentMap,
    platformIconMap,
    kindAccountVariantMap,
    tokenInteractionMap,
};
