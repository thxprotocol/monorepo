<template>
    <b-navbar class="navbar-top pt-3 px-lg-3 p-lg-0">
        <div style="width: 120px" class="d-lg-none">
            <b-button variant="link" @click="onClickClose"> <i class="fas fa-times"></i></b-button>
        </div>
        <b-link
            @click="onClickRefresh"
            class="pl-3 py-2 p-lg-0 m-lg-0 text-center text-decoration-none d-block d-lg-none"
            v-if="authStore.oAuthShare && questStore.quests.length"
        >
            <div class="text-accent h1 m-0 d-flex align-items-center">
                <strong>{{ accountStore.balance }}</strong>
                <span class="ms-2 text-white" style="font-size: 16px !important">
                    <b-spinner v-if="isRefreshing" small variant="white" />
                    <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
                </span>
            </div>
            <div class="points d-block d-lg-none">points</div>
        </b-link>
        <div v-else class="pl-3 py-2 text-center text-decoration-none d-lg-none">
            <b-img
                v-if="config"
                class="navbar-logo"
                :src="config.logoUrl"
                v-b-tooltip.hover.bottom="{ title: decodeHTML(config.title) }"
            />
        </div>
        <div style="width: 120px; text-align: right">
            <b-button v-if="authStore.oAuthShare && !questStore.quests.length" variant="link" @click="onClickRefresh">
                <b-spinner v-if="isRefreshing" small variant="white" />
                <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
            </b-button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="link">
                <b-spinner v-if="accountStore.isAuthenticated === false" small variant="white" />
                <template v-else>Sign in</template>
            </b-button>
            <template v-else>
                <b-dropdown variant="link" no-caret right>
                    <template #button-content>
                        <i class="fas fa-ellipsis-v"></i>
                    </template>
                    <b-dropdown-item-button size="sm" @click="onClickWallet" v-if="!questStore.quests.length">
                        <b-spinner v-if="!walletAddress" small />
                        <template v-else>{{ walletAddress }}</template>
                    </b-dropdown-item-button>
                    <b-dropdown-item-button
                        size="sm"
                        @click="$router.push(`/c/${config.slug}/w/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)"
                        v-if="questStore.quests.length"
                    >
                        Identities
                    </b-dropdown-item-button>
                    <b-dropdown-item-button @click="accountStore.isModalAccountShown = true">
                        <div class="d-flex align-items-center justify-content-between">Account</div>
                    </b-dropdown-item-button>
                    <b-dropdown-divider />
                    <b-dropdown-item-button size="sm" @click="onClickSignout">
                        <div class="d-flex align-items-center justify-content-between">
                            Sign out
                            <i class="fas fa-sign-out-alt ml-auto"></i>
                        </div>
                    </b-dropdown-item-button>
                </b-dropdown>
            </template>
        </div>
    </b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';
import { useWalletStore } from '../../stores/Wallet';
import { useRewardStore } from '../../stores/Reward';
import { decodeHTML } from '../../utils/decode-html';
import { AccountVariant } from '../../types/enums/accountVariant';
import { getIsMobile } from '../../utils/user-agent';

export default defineComponent({
    name: 'BaseNavbarSecondary',
    data(): any {
        return {
            AccountVariant,
            decodeHTML,
            error: '',
            isRefreshing: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        ...mapStores(useWalletStore),
        walletAddress() {
            const { wallet } = useWalletStore();
            if (!wallet || !wallet.address) return '';
            return `${wallet.address.substring(0, 6)}...${wallet.address.substring(
                wallet.address.length - 4,
                wallet.address.length,
            )}`;
        },
        config() {
            return this.accountStore.config;
        },
    },
    methods: {
        async onClickSignin() {
            this.accountStore.signin();
        },
        onClickSignout() {
            this.accountStore.signout();
        },
        onClickClose() {
            if (getIsMobile()) {
                window.open(this.accountStore.config.origin, '_self');
            } else {
                window.top?.postMessage({ message: 'thx.widget.toggle' }, this.accountStore.config.origin);
            }
        },
        onClickWallet() {
            this.$router.push(`/c/${this.accountStore.config.slug}/wallet`);
        },
        async onClickRefresh() {
            this.isRefreshing = true;
            await Promise.all([
                this.accountStore.getBalance(),
                this.questStore.list(),
                this.rewardStore.list(),
                this.walletStore.list(),
            ]);
            this.isRefreshing = false;
        },
    },
});
</script>
