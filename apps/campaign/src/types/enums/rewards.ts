export enum RewardSortVariant {
    Default = 0,
    Available = 1,
    Created = 2,
    Amount = 3,
}

export enum RewardVariant {
    Daily = 0,
    Referral = 1,
    Conditional = 2,
    Milestone = 3,
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

export enum RewardConditionInteraction {
    None = -1,
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
    DiscordGuildJoined = 5,
    ShopifyOrderAmount = 6,
    ShopifyTotalSpent = 7,
    ShopifyNewsletterSubscription = 8,
    DiscordInviteUsed = 9,
}