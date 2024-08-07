import { AccessTokenKind, OAuthScope } from '@thxnetwork/common/enums';
import { TokenDocument } from '../../models/Token';
import OAuthYouTubeService from '../OAuthYouTubeService';
import OAuthTwitterService from '../OAuthTwitterService';
import OAuthDiscordService from '../OAuthDiscordService';
import OAuthTwitchService from '../OAuthTwitchService';
import OAuthGithubService from '../OAuthGithubService';

export const serviceMap: { [variant: string]: IOAuthService } = {
    [AccessTokenKind.Google]: new OAuthYouTubeService(),
    [AccessTokenKind.Twitter]: new OAuthTwitterService(),
    [AccessTokenKind.Discord]: new OAuthDiscordService(),
    [AccessTokenKind.Twitch]: new OAuthTwitchService(),
    [AccessTokenKind.Github]: new OAuthGithubService(),
};

export interface IOAuthService {
    getLoginURL(options: { uid: string; scopes: OAuthScope[] }): string;
    requestToken(code: string): Promise<Partial<TokenDocument>>;
    refreshToken(token: TokenDocument): Promise<TokenDocument>;
    revokeToken(token: TAccessToken): Promise<void>;
}
