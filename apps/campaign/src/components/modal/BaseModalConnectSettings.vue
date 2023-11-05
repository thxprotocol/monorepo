<template>
    <b-modal
        :size="(size as any)"
        v-model="accountStore.isModalConnectSettingsShown"
        @show="onShow"
        @hidden="accountStore.isModalConnectSettingsShown = false"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-user me-2"></i> Profile</h5>
            <b-link class="btn-close" @click="accountStore.isModalConnectSettingsShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-form>
            <b-tabs justified content-class="mt-3">
                <b-tab title="Personal" active>
                    <BaseFormGroupUsername :username="username" />
                </b-tab>
                <b-tab title="Connected">
                    <b-alert v-model="isAlertShown" variant="warning" show class="py-1 px-2">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Sign in connections can not be disconnected!
                    </b-alert>
                    <b-alert v-model="isErrorShown" show variant="danger" class="p-2">{{ error }}</b-alert>
                    <template v-for="{ platform, color, isConnected, isSubmitting, isDisabled } of platforms">
                        <div class="px-3 py-2 d-flex align-items-center">
                            <strong class="me-auto">
                                <i :class="platformIconMap[platform]" class="me-2" :style="{ color: color }"></i>
                                {{ RewardConditionPlatform[platform] }}
                            </strong>
                            <b-spinner v-if="isSubmitting" small />
                            <template v-else>
                                <BButton
                                    :disabled="isDisabled"
                                    @click="onClickDisconnect(platform)"
                                    variant="primary"
                                    class="text-danger"
                                    size="sm"
                                    v-if="isConnected"
                                >
                                    Disconnect
                                </BButton>
                                <BButton @click="onClickConnect(platform)" variant="primary" size="sm" v-else>
                                    Connect
                                </BButton>
                            </template>
                        </div>
                        <hr class="my-1" />
                    </template>
                    <p class="small text-opaque mt-2">
                        <strong>Connected accounts</strong> are used to verify if your social account has completed
                        social quests.
                    </p>
                </b-tab>
            </b-tabs>
        </b-form>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="accountStore.isModalConnectSettingsShown = false">
                Close
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import {
    getConnectionStatus,
    platformAccessKeyMap,
    platformAccountVariantMap,
    platformIconMap,
} from '../../utils/social';
import { RewardConditionPlatform } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseModalConnectSettings',
    data() {
        return {
            error: '',
            errorUsername: '',
            isShown: false,
            debounce: 0,
            isLoadingUsername: false,
            isAlertShown: true,
            platformIconMap,
            RewardConditionPlatform,
            username: '',
            platforms: {
                [RewardConditionPlatform.YouTube]: {
                    platform: RewardConditionPlatform.YouTube,
                    color: '#FF0000',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
                [RewardConditionPlatform.Twitter]: {
                    platform: RewardConditionPlatform.Twitter,
                    color: '#1DA1F2',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
                [RewardConditionPlatform.Discord]: {
                    platform: RewardConditionPlatform.Discord,
                    color: '#7289DA',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
            } as any,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        platforms() {
            return {};
        },
        isErrorShown() {
            return !!this.error;
        },
    },
    props: {
        size: {
            type: String,
            required: true,
            default: 'sm',
        },
    },
    methods: {
        async onShow() {
            await this.accountStore.getAccount();
            const { username } = this.accountStore.account as TAccount;
            this.username = username || '';
            this.updateConnectionStatus();
        },
        async onClickConnect(platform: RewardConditionPlatform) {
            this.error = '';
            this.platforms[platform].isSubmitting = true;

            try {
                this.accountStore.connect(platform);
                await this.accountStore.waitForConnectionStatus(platform);
            } catch (error) {
                this.error = 'Could not connect platform.';
                console.error(error);
            } finally {
                this.updateConnectionStatus();
            }
        },
        async onClickDisconnect(platform: RewardConditionPlatform) {
            this.platforms[platform].isSubmitting = true;
            try {
                const accessKey: string = platformAccessKeyMap[platform];
                await this.accountStore.api.account.patch({ [accessKey]: false });
                await this.accountStore.getAccount();
            } catch (error) {
                this.error = 'Could not disconnect platform.';
                console.error(error);
            } finally {
                this.updateConnectionStatus();
            }
        },
        getPlatformConnectionDisabledStatus(account: TAccount, platform: RewardConditionPlatform) {
            return account.variant === platformAccountVariantMap[platform];
        },
        async updateConnectionStatus() {
            if (!this.accountStore.account) return;
            for (const platform in this.platforms) {
                const platformKey = platform as unknown as RewardConditionPlatform;
                this.platforms[platform].isDisabled = this.getPlatformConnectionDisabledStatus(
                    this.accountStore.account,
                    platformKey,
                );
                this.platforms[platform].isConnected = getConnectionStatus(
                    this.accountStore.account as any,
                    platformKey,
                );
                this.platforms[platform].isSubmitting = false;
            }
        },
    },
});
</script>
