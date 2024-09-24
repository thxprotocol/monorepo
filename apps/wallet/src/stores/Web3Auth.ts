import { Wallet } from '@ethersproject/wallet';
import { tKey } from '@thxnetwork/wallet/utils/tkey';
import { defineStore } from 'pinia';
import { useAuthStore } from '.';
import { AUTH_URL, CLIENT_ID, VERIFIER_ID } from '../config/secrets';
import router from '../router';

export const useWeb3AuthStore = defineStore('web3auth', {
    state: () => ({
        wallet: null as null | Wallet,
        privateKey: '',
        oAuthShare: '',
        securityQuestion: '',
        isModalWalletRecoveryShown: false,
        isDeviceShareAvailable: null as null | boolean,
        isSecurityQuestionAvailable: null as null | boolean,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async getJWT() {
            const { jwt } = await this.request('/login/jwt', { method: 'POST' });
            return jwt;
        },
        async getPrivateKey() {
            // Get the oauth share (1/3)
            await this._triggerLogin();
            // Get the device share (2/3)
            await this._getDeviceShare();
            // Get the user controlled share (3/3)
            await this._getSecurityQuestion();

            // If no device share is available but there is a security question
            // show the recovery modal to recover the device share
            if (!this.isDeviceShareAvailable && this.isSecurityQuestionAvailable) {
                this.isModalWalletRecoveryShown = true;
                // Wait for the device share to become available
                await this._waitForWalletRecovery();
            }

            // If both the device and security question are available, reconstruct the key
            if (this.isDeviceShareAvailable && this.isSecurityQuestionAvailable) {
                await this._reconstructKey();
            }
        },
        async _triggerLogin() {
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
        _waitForWalletRecovery() {
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
            await router.push({ name: 'logout' });
        },
        async resetKey() {
            // WARNING Irreversible
            await tKey.storageLayer.setMetadata({
                privKey: this.oAuthShare as any,
                input: { message: 'KEY_NOT_FOUND' },
            });
        },
        async _reconstructKey() {
            const { requiredShares } = tKey.getKeyDetails();
            if (requiredShares <= 0) {
                const reconstructedKey = await tKey.reconstructKey();
                this.privateKey = `0x${reconstructedKey?.privKey.toString('hex').padStart(64, '0')}`;
                this.wallet = new Wallet(this.privateKey);
                console.debug('Successfully reconstructed private key.');
            }
        },
        async _getDeviceShare() {
            try {
                await tKey.modules.webStorage.inputShareFromWebStorage(); // 2/2 flow
                this.isDeviceShareAvailable = true;
                console.debug('Successfully asserted device share.');
            } catch (error: unknown) {
                this.isDeviceShareAvailable = false;
                console.log(error);
            }
        },
        async _getSecurityQuestion() {
            try {
                this.securityQuestion = await tKey.modules.securityQuestions.getSecurityQuestions();
                this.isSecurityQuestionAvailable = true;
                console.debug('Successfully got security question.');
            } catch (error) {
                this.isSecurityQuestionAvailable = false;
                console.log(error);
            }
        },
        async _createDeviceShare(question: string, answer: string) {
            try {
                await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(answer, question);
                await this._getSecurityQuestion();

                console.debug('Successfully generated new share with password.');
            } catch (error) {
                console.log(error);
            }
        },
        async updateDeviceShare(answer: string, question: string) {
            await tKey.modules.securityQuestions.changeSecurityQuestionAndAnswer(answer, question);
            await this._getSecurityQuestion();
            console.debug('Successfully changed new share with password.');
        },
        async recoverDeviceShare(value: string) {
            await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(value); // 2/2 flow
            await this._reconstructKey();

            const newShare = await tKey.generateNewShare();
            const shareStore = tKey.outputShareStore(newShare.newShareIndex);

            await tKey.modules.webStorage.storeDeviceShare(shareStore);
            await this._getDeviceShare();

            console.debug('Successfully logged you in with the recovery password.');
        },
    },
});
