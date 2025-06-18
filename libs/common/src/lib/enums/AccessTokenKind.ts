export enum AccessTokenKind {
    Auth = 'authentication',
    Signup = 'signup',
    VerifyEmail = 'verify-email',
    Google = 'google',
    Twitter = 'twitter',
    Discord = 'discord',
    Twitch = 'twitch',
    Github = 'github',
    Telegram = 'telegram',
}

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
    FollowsRead = 'follows.read',
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

export enum OAuthTelegramScope {
    Bot = 'bot',
}

// Different scope requirements should always be elevating based on the invasiveness of the required scope
// This allows for better privacy by design
export const OAuthRequiredScopes = {
    GoogleAuth: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email],
    GoogleYoutubeSubscribe: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email, OAuthGoogleScope.YoutubeReadOnly],
    GoogleYoutubeLike: [OAuthGoogleScope.OpenID, OAuthGoogleScope.Email, OAuthGoogleScope.YoutubeReadOnly],
    TwitterAuth: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateUser: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateReply: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateRepost: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateMessage: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    TwitterValidateFollow: [
        OAuthTwitterScope.OfflineAccess,
        OAuthTwitterScope.UsersRead,
        OAuthTwitterScope.TweetRead,
        OAuthTwitterScope.LikeRead,
        OAuthTwitterScope.FollowsWrite,
        OAuthTwitterScope.FollowsRead,
    ],
    TwitterAutoQuest: [OAuthTwitterScope.OfflineAccess, OAuthTwitterScope.UsersRead, OAuthTwitterScope.TweetRead],
    DiscordAuth: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email],
    DiscordValidateGuild: [OAuthDiscordScope.Identify, OAuthDiscordScope.Email, OAuthDiscordScope.Guilds],
    TwitchAuth: [OAuthTwitchScope.Email, OAuthTwitchScope.Follows, OAuthTwitchScope.Broadcast],
    GithubAuth: [OAuthGithubScope.PublicRepo],
    TelegramAuth: [OAuthTelegramScope.Bot],
};

export type OAuthScope =
    | OAuthGoogleScope
    | OAuthTwitterScope
    | OAuthDiscordScope
    | OAuthTwitchScope
    | OAuthGithubScope
    | OAuthTelegramScope;
