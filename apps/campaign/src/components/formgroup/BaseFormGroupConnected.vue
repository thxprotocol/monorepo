<template>
    <b-form-group label="Connected" description="Connections used for signing in can not be disconnected!">
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
                        variant="link"
                        class="text-danger text-decoration-none"
                        size="sm"
                        v-if="isConnected"
                    >
                        Disconnect
                    </BButton>
                    <BButton @click="onClickConnect(platform)" variant="primary" size="sm" v-else> Connect </BButton>
                </template>
            </div>
            <hr class="my-1" />
        </template>
    </b-form-group>
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
    name: 'BaseFormGroupUsername',
    data() {
        return {
            error: '',
            isShown: false,
            isAlertShown: true,
            platformIconMap,
            RewardConditionPlatform,
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
        isErrorShown() {
            return !!this.error.length;
        },
    },
    props: {
        username: String,
    },
    mounted() {
        this.updateConnectionStatus();
    },
    methods: {
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
