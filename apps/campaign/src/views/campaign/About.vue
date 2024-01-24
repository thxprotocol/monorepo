<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col offset-xl="2" xl="8">
                <b-card class="mx-auto my-2">
                    <template #header>
                        <strong>{{ accountStore.config.title }}</strong>
                    </template>
                    <p style="white-space: pre-line" v-html="accountStore.config.description"></p>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'Identities',
    data() {
        return {
            uuid: '',
            error: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useWalletStore),
        isWaitingForWalletAddress() {
            const { wallet } = useWalletStore();
            return !wallet || !wallet.address;
        },
        isValidUUID() {
            if (!this.uuid) return null;
            try {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(this.uuid);
            } catch (error) {
                return null;
            }
        },
        isAlertDangerShown() {
            return !!this.error;
        },
    },
    mounted() {
        this.uuid = this.$route.params.uuid as string;
    },
    methods: {
        async onClickCollect() {
            this.isLoading = true;
            try {
                await this.accountStore.api.request.patch(`/v1/identity/${this.uuid}`);
                await this.questStore.list();
                this.$router.push(`/c/${this.accountStore.config.slug}/quests`);
            } catch (res) {
                this.error = (res as any).error.message || 'Something went wrong..';
            } finally {
                this.isLoading = false;
            }
        },
        async onClickSignin() {
            this.accountStore.signin();
        },
    },
});
</script>
