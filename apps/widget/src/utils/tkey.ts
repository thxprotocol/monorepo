import ThresholdKey from '@tkey/default';
import WebStorageModule from '@tkey/web-storage';
import SecurityQuestionsModule from '@tkey/security-questions';
import { API_URL, AUTH_URL, CLIENT_ID, VERIFIER_ID, VERIFIER_NETWORK } from '../config/secrets';
import { randHex } from './rand-hex';

const WEB3AUTHCLIENTID = 'BJ6l3_kIQiy6YVL7zDlCcEAvGpGukwFgp-C_0WvNI_fAEeIaoVRLDrV5OjtbZr_zJxbyXFsXMT-yhQiUNYvZWpo';

const webStorageModule = new WebStorageModule();
const securityQuestionsModule = new SecurityQuestionsModule();
const customAuthArgs = {
    web3AuthClientId: WEB3AUTHCLIENTID,
    baseUrl: `${window.location.origin}`,
    enableLogging: true,
    network: VERIFIER_NETWORK,
    redirectToOpener: true,
    metadataUrl: AUTH_URL + '/.well-known/openid-configuration',
    uxMode: getUxMode(),
} as any;

const tKey: ThresholdKey & { serviceProvider?: any; modules?: { securityQuestions?: any; webStorage?: any } } =
    new ThresholdKey({
        modules: {
            webStorage: webStorageModule,
            securityQuestions: securityQuestionsModule,
        },
        customAuthArgs,
    });

function getUxMode() {
    const isMobile = window.matchMedia('(pointer:coarse)').matches;
    const isCypress = (window as any).Cypress;
    return isMobile || isCypress ? 'redirect' : 'popup';
}

function getUser(storageKey: string) {
    return JSON.parse(localStorage.getItem(storageKey) as string);
}

async function getRequestConfig(extraQueryParams: { [key: string]: string }) {
    const sessionId = randHex(32);
    const uxMode = getUxMode();
    return {
        verifier: VERIFIER_ID,
        typeOfLogin: 'jwt',
        clientId: CLIENT_ID,
        enableLogging: true,
        customState: {
            id: sessionId,
            uxMode,
        },
        jwtParams: {
            code_challenge_method: 'S256',
            domain: AUTH_URL,
            resource: API_URL,
            response_type: 'code',
            response_mode: 'query',
            prompt: 'consent', // Should be an empty string to avoid default 'login' prompt
            grant_type: 'authorization_code',
            scope: 'openid offline_access account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read',
            user_info_route: 'me',
            ...extraQueryParams,
        },
    };
}

export { tKey, getUxMode, getUser, getRequestConfig };
