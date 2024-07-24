import { defineStore } from 'pinia';
import { CLIENT_ID, AUTH_URL, VERIFIER_ID } from '../config/secrets';
import { tKey } from '../utils/tkey';
import { useAccountStore } from './Account';
import { Wallet } from '@ethersproject/wallet';
import { track } from '@thxnetwork/common/mixpanel';

export const useAuthStore = defineStore('auth', {
    state: (): TAuthState => ({
        wallet: null,
        privateKey: '',
        oAuthShare: '',
        securityQuestion: '',
        isModalLoginShown: false,
        isModalWalletRecoveryShown: false,
        isDeviceShareAvailable: null,
        isSecurityQuestionAvailable: null,
    }),
    actions: {
        async getJWT() {
            const { api } = useAccountStore();
            const { jwt } = await api.request.post('/v1/login/jwt');
            return jwt;
        },
        async triggerLogin() {
            const jwt = await this.getJWT();
            const requestConfig = {
                verifier: VERIFIER_ID,
                clientId: CLIENT_ID,
                typeOfLogin: 'jwt',
                enableLogging: false,
                hash: `#state=state&access_token=${jwt}&id_token=${jwt}`,
                queryParameters: new URLSearchParams({ code: '', iss: AUTH_URL, state: 'state' } as any).toString(),
                jwtParams: {
                    domain: AUTH_URL,
                    accessToken: jwt,
                    idToken: jwt,
                    user_info_route: 'me',
                },
            };

            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            // Trigger login with access and id token hash
            const loginResponse = await tKey.serviceProvider.triggerLogin(requestConfig);
            this.oAuthShare = loginResponse.oAuthKeyData.privKey;

            await tKey.initialize();
        },
        async getPrivateKey() {
            // If the token is more than 60s old, we need to refresh
            // as web3auth will not accept it for deriving key shares
            if (this.user && 60 * 60 * 24 - this.user.expires_in > 60) {
                await this.triggerLogin();
            }

            // Get the oauth share (1/3)
            await this.triggerLogin();
            // Get the device share (2/3)
            await this.getDeviceShare();
            // Get the user controlled share (3/3)
            await this.getSecurityQuestion();

            // If no device share is available but there is a security question
            // show the recovery modal to recover the device share
            if (!this.isDeviceShareAvailable && this.isSecurityQuestionAvailable) {
                this.isModalWalletRecoveryShown = true;
                // Wait for the device share to become available
                await this.waitForWalletRecovery();
            }

            // If both the device and security question are available, reconstruct the key
            if (this.isDeviceShareAvailable && this.isSecurityQuestionAvailable) {
                await this.reconstructKey();
            }
        },
        waitForWalletRecovery() {
            return new Promise((resolve: any) => {
                const interval = setInterval(() => {
                    if (this.isDeviceShareAvailable) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 500);
            });
        },
        async sign(message: string) {
            if (!this.wallet) return;
            return await this.wallet.signMessage(message);
        },
        async reset() {
            await this.resetKey();
            await useAccountStore().signout();
        },
        async resetKey() {
            // WARNING Irreversible
            await tKey.storageLayer.setMetadata({
                privKey: this.oAuthShare as any,
                input: { message: 'KEY_NOT_FOUND' },
            });
        },
        async reconstructKey() {
            const { requiredShares } = tKey.getKeyDetails();
            if (requiredShares <= 0) {
                const reconstructedKey = await tKey.reconstructKey();
                this.privateKey = `0x${reconstructedKey?.privKey.toString('hex').padStart(64, '0')}`;
                this.wallet = new Wallet(this.privateKey);
                console.debug('Successfully reconstructed private key.');
            }
        },
        async getDeviceShare() {
            try {
                await tKey.modules.webStorage.inputShareFromWebStorage(); // 2/2 flow
                this.isDeviceShareAvailable = true;
                console.debug('Successfully asserted device share.');
            } catch (error: unknown) {
                this.isDeviceShareAvailable = false;
                console.log(error);
            }
        },
        async getSecurityQuestion() {
            try {
                this.securityQuestion = await tKey.modules.securityQuestions.getSecurityQuestions();
                this.isSecurityQuestionAvailable = true;
                console.debug('Successfully got security question.');
            } catch (error) {
                this.isSecurityQuestionAvailable = false;
                console.log(error);
            }
        },
        async createDeviceShare(question: string, answer: string) {
            const { account, poolId } = useAccountStore();

            try {
                await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(answer, question);
                await this.getSecurityQuestion();

                console.debug('Successfully generated new share with password.');

                track('UserCreates', [
                    account?.sub || '',
                    `security question`,
                    { poolId, address: this.wallet.address, hasPrivateKey: !!this.privateKey },
                ]);
            } catch (error) {
                track('UserCreates', [
                    account?.sub || '',
                    `security question error`,
                    {
                        poolId,
                        address: this.wallet.address,
                        hasPrivateKey: !!this.privateKey,
                        error: (error as Error).toString(),
                    },
                ]);
                console.log(error);
            }
        },
        async updateDeviceShare(answer: string, question: string) {
            await tKey.modules.securityQuestions.changeSecurityQuestionAndAnswer(answer, question);
            await this.getSecurityQuestion();
            console.debug('Successfully changed new share with password.');
        },
        async recoverDeviceShare(value: string) {
            await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(value); // 2/2 flow
            await this.reconstructKey();

            const newShare = await tKey.generateNewShare();
            const shareStore = tKey.outputShareStore(newShare.newShareIndex);

            await tKey.modules.webStorage.storeDeviceShare(shareStore);
            await this.getDeviceShare();

            console.debug('Successfully logged you in with the recovery password.');
        },
    },
});
