import { RewardConditionInteraction, RewardConditionPlatform } from '../types/enums/rewards';
import { AccessTokenKind } from '../types/enums/accessTokenKind';

function getConnectionStatus(account: TAccount, platform: RewardConditionPlatform) {
    switch (platform) {
        case RewardConditionPlatform.YouTube:
            return account.youtubeManageAccess;
        case RewardConditionPlatform.Twitter:
            return account.twitterAccess;
        case RewardConditionPlatform.Discord:
            return account.discordAccess;
        case RewardConditionPlatform.Github:
            return account.githubAccess;
        case RewardConditionPlatform.Twitch:
            return account.twitchAccess;
        default:
            return true;
    }
}

function getInteractionComponent(interaction: RewardConditionInteraction) {
    switch (interaction) {
        case RewardConditionInteraction.YouTubeLike:
            return 'BaseBlockquoteVideo';
        case RewardConditionInteraction.YouTubeSubscribe:
            return 'BaseBlockquoteYoutubeChannelSubscription';
        case RewardConditionInteraction.TwitterLike:
        case RewardConditionInteraction.TwitterRetweet:
            return 'BaseBlockquoteTwitterTweet';
        case RewardConditionInteraction.TwitterFollow:
            return 'BaseBlockquoteTwitterUser';
        case RewardConditionInteraction.TwitterMessage:
            return 'BaseBlockquoteTwitterMessage';
        case RewardConditionInteraction.DiscordGuildJoined:
            return 'BaseBlockquoteDiscordServerJoin';
        case RewardConditionInteraction.DiscordInviteUsed:
            return 'BaseBlockquoteDiscordInviteUsed';
    }
}

function getAccessTokenKindForPlatform(platform: RewardConditionPlatform) {
    switch (platform) {
        case RewardConditionPlatform.YouTube: {
            return AccessTokenKind.YoutubeManage;
        }
        case RewardConditionPlatform.Twitter: {
            return AccessTokenKind.Twitter;
        }
        case RewardConditionPlatform.Discord: {
            return AccessTokenKind.Discord;
        }
    }
}

export { getAccessTokenKindForPlatform, getConnectionStatus, getInteractionComponent };
