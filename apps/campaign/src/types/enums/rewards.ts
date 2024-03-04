export enum RewardSortVariant {
    Default = 0,
    Available = 1,
    Created = 2,
    Amount = 3,
}

export enum QuestVariant {
    Daily = 0,
    Invite = 1,
    Twitter = 2,
    Discord = 3,
    YouTube = 4,
    Custom = 5,
    Web3 = 6,
    Gitcoin = 7,
}

export enum RewardVariant {
    Coin = 0,
    NFT = 1,
    Custom = 2,
    Coupon = 3,
    DiscordRole = 4,
}

export enum RewardConditionPlatform {
    None = 0,
    YouTube = 1,
    Twitter = 2,
    Spotify = 3,
    Github = 4,
    Discord = 5,
    Twitch = 6,
    Shopify = 7,
}

export enum QuestSocialRequirement {
    None = -1,
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
    DiscordGuildJoined = 5,
    TwitterMessage = 6,
    TwitterLikeRetweet = 7,
    DiscordMessage = 8,
    DiscordMessageReaction = 9,
}
