import { QuestConditionInteraction, RewardConditionPlatform } from '../types/enums/rewards';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { AccountVariant } from '../types/enums/accountVariant';

const platformIconMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.YouTube]: 'fab fa-youtube',
    [RewardConditionPlatform.Twitter]: 'fab fa-twitter',
    [RewardConditionPlatform.Discord]: 'fab fa-discord',
};

const platformAccessKeyMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.YouTube]: 'youtubeManageAccess',
    [RewardConditionPlatform.Twitter]: 'twitterAccess',
    [RewardConditionPlatform.Discord]: 'discordAccess',
    [RewardConditionPlatform.Github]: 'githubAccess',
    [RewardConditionPlatform.Twitch]: 'twitchAccess',
};

const platformAccountVariantMap: any = {
    [RewardConditionPlatform.Twitter]: AccountVariant.SSOTwitter,
    [RewardConditionPlatform.Discord]: AccountVariant.SSODiscord,
    [RewardConditionPlatform.Github]: AccountVariant.SSOGithub,
    [RewardConditionPlatform.Twitch]: AccountVariant.SSOTwitch,
};

function getConnectionStatus(account: { [accessKey: string]: boolean }, platform: RewardConditionPlatform) {
    const accessKey: string = platformAccessKeyMap[platform];
    return account[accessKey];
}

function getInteractionComponent(interaction: QuestConditionInteraction) {
    switch (interaction) {
        case QuestConditionInteraction.YouTubeLike:
            return 'BaseBlockquoteVideo';
        case QuestConditionInteraction.YouTubeSubscribe:
            return 'BaseBlockquoteYoutubeChannelSubscription';
        case QuestConditionInteraction.TwitterLike:
        case QuestConditionInteraction.TwitterRetweet:
        case QuestConditionInteraction.TwitterLikeRetweet:
            return 'BaseBlockquoteTwitterTweet';
        case QuestConditionInteraction.TwitterFollow:
            return 'BaseBlockquoteTwitterUser';
        case QuestConditionInteraction.TwitterMessage:
            return 'BaseBlockquoteTwitterMessage';
        case QuestConditionInteraction.DiscordGuildJoined:
            return 'BaseBlockquoteDiscordServerJoin';
        case QuestConditionInteraction.DiscordMessage:
            return 'BaseBlockquoteDiscordMessage';
        default:
            return null;
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
        default:
            return null;
    }
}

export {
    getAccessTokenKindForPlatform,
    getConnectionStatus,
    getInteractionComponent,
    platformIconMap,
    platformAccessKeyMap,
    platformAccountVariantMap,
};
