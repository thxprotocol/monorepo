import { AccountVariant, AccessTokenKind, QuestSocialRequirement } from '../enums';

export const accountVariantProviderMap = {
    [AccountVariant.SSOGoogle]: AccessTokenKind.Google,
    [AccountVariant.SSODiscord]: AccessTokenKind.Discord,
    [AccountVariant.SSOTwitter]: AccessTokenKind.Twitter,
    [AccountVariant.SSOGithub]: AccessTokenKind.Github,
    [AccountVariant.SSOTwitch]: AccessTokenKind.Twitch,
};

export const providerAccountVariantMap = {
    [AccessTokenKind.Google]: AccountVariant.SSOGoogle,
    [AccessTokenKind.Discord]: AccountVariant.SSODiscord,
    [AccessTokenKind.Twitter]: AccountVariant.SSOTwitter,
    [AccessTokenKind.Github]: AccountVariant.SSOGithub,
    [AccessTokenKind.Twitch]: AccountVariant.SSOTwitch,
};

export const interactionComponentMap = {
    [QuestSocialRequirement.YouTubeSubscribe]: 'BaseDropdownYoutubeChannels',
    [QuestSocialRequirement.YouTubeLike]: 'BaseDropdownYoutubeVideo',
    [QuestSocialRequirement.TwitterRetweet]: 'BaseDropdownTwitterTweets',
    [QuestSocialRequirement.TwitterFollow]: 'BaseDropdownTwitterUsers',
    [QuestSocialRequirement.TwitterQuery]: 'BaseDropdownTwitterQuery',
    [QuestSocialRequirement.DiscordGuildJoined]: 'BaseDropdownDiscordGuilds',
    [QuestSocialRequirement.DiscordGuildRole]: 'BaseDropdownDiscordRoles',
    [QuestSocialRequirement.DiscordMessage]: 'BaseDropdownDiscordMessage',
    [QuestSocialRequirement.DiscordMessageReaction]: 'BaseDropdownDiscordMessageReaction',
};
