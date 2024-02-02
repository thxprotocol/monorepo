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
    [RewardConditionPlatform.YouTube]: AccessTokenKind.YoutubeManage,
    [RewardConditionPlatform.Twitter]: AccessTokenKind.Twitter,
    [RewardConditionPlatform.Discord]: AccessTokenKind.Discord,
    [RewardConditionPlatform.Github]: AccessTokenKind.Github,
    [RewardConditionPlatform.Twitch]: AccessTokenKind.Twitch,
};

const platformAccountVariantMap: any = {
    [RewardConditionPlatform.Twitter]: AccountVariant.SSOTwitter,
    [RewardConditionPlatform.Discord]: AccountVariant.SSODiscord,
    [RewardConditionPlatform.Github]: AccountVariant.SSOGithub,
    [RewardConditionPlatform.Twitch]: AccountVariant.SSOTwitch,
};

function getConnectionStatus(account: TAccount, platform: RewardConditionPlatform) {
    return account.tokens.find((token) => token.kind === platformAccessKeyMap[platform]);
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

export {
    getConnectionStatus,
    getInteractionComponent,
    platformIconMap,
    platformAccessKeyMap,
    platformAccountVariantMap,
};
