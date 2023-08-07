import ThresholdKey from '@tkey/default';
import WebStorageModule from '@tkey/web-storage';
import SecurityQuestionsModule from '@tkey/security-questions';
import { AUTH_URL, VERIFIER_NETWORK } from '../config/secrets';

const WEB3AUTHCLIENTID = 'BJ6l3_kIQiy6YVL7zDlCcEAvGpGukwFgp-C_0WvNI_fAEeIaoVRLDrV5OjtbZr_zJxbyXFsXMT-yhQiUNYvZWpo';

const webStorageModule = new WebStorageModule();
const securityQuestionsModule = new SecurityQuestionsModule();
const customAuthArgs = {
    web3AuthClientId: WEB3AUTHCLIENTID,
    baseUrl: `${window.location.origin}`,
    redirectPathName: 'signin-silent.html',
    enableLogging: true,
    network: VERIFIER_NETWORK,
    redirectToOpener: true,
    metadataUrl: AUTH_URL + '/.well-known/openid-configuration',
    uxMode: 'redirect',
} as any;

const tKey: ThresholdKey & { serviceProvider?: any; modules?: { securityQuestions?: any; webStorage?: any } } =
    new ThresholdKey({
        modules: {
            webStorage: webStorageModule,
            securityQuestions: securityQuestionsModule,
        },
        customAuthArgs,
    });

export { tKey };
