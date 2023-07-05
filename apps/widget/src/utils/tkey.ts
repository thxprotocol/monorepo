import ThresholdKey from '@tkey/default';
import WebStorageModule from '@tkey/web-storage';
import SecurityQuestionsModule from '@tkey/security-questions';
import { AUTH_URL } from '../config/secrets';

const WEB3AUTHCLIENTID = 'BJ6l3_kIQiy6YVL7zDlCcEAvGpGukwFgp-C_0WvNI_fAEeIaoVRLDrV5OjtbZr_zJxbyXFsXMT-yhQiUNYvZWpo';

const webStorageModule = new WebStorageModule();
const securityQuestionsModule = new SecurityQuestionsModule();
const customAuthArgs = {
    web3AuthClientId: WEB3AUTHCLIENTID,
    baseUrl: `${window.location.origin}`,
    enableLogging: true,
    network: 'sapphire_devnet',
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
    return (window.ethereum && isMobile) || isCypress ? 'redirect' : 'popup';
}

function getUser(storageKey: string) {
    return JSON.parse(localStorage.getItem(storageKey) as string);
}

export { tKey, getUxMode, getUser };
