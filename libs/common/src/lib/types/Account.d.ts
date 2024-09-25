type TAccount = {
    _id: string;
    sub: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImg: string;
    plan: AccountPlanType;
    website: string;
    organisation: string;
    active: boolean;
    isEmailVerified: boolean;
    email: string;
    address: string;
    variant: AccountVariant;
    otpSecret: string;
    acceptTermsPrivacy: boolean;
    acceptUpdates: boolean;
    role: Role;
    goal: Goal[];
    tokens: TAccessToken[];
    identity: string;
    createdAt: Date;
    updatedAt: Date;
    providerUserId: string;
};

type TOAuthScope = OAuthGoogleScope | OAuthTwitterScope | OAuthDiscordScope | OAuthTwitchScope | OAuthGithubScope;

type TRequestOptions = {
    isAuthenticated?: boolean;
    body?: any;
    params?: any;
    headers?: any;
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
};
