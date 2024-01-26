<template>
    <b-container v-if="questStore.quests.length" class="order-lg-1" :class="{ 'd-none d-lg-block': isRouteRanking }">
        <b-row>
            <b-col xl="10" offset-xl="1">
                <b-card
                    class="bg-splash mx-auto"
                    body-class="d-flex justify-content-center align-items-center"
                    :style="{
                        minHeight: `${height}px`,
                        backgroundImage:
                            accountStore.config.backgroundUrl && `url('${accountStore.config.backgroundUrl}')`,
                    }"
                >
                    <div
                        v-if="authStore.oAuthShare"
                        class="d-flex justify-content-center align-items-center p-3"
                        style="border-radius: 5px; background: rgba(0, 0, 0, 0.35)"
                    >
                        <b-avatar size="80" :src="accountStore.account?.profileImg" class="gradient-border-xl" />
                        <div class="px-3" style="min-width: 200px">
                            <h3 class="text-white mb-0">{{ accountStore.account?.username }}</h3>
                            <div class="text-white text-opaque mb-1">Rank: #{{ accountStore.account?.rank }}</div>
                            <b-progress
                                style="height: 13px"
                                :max="Number(accountStore.balance) + Number(questStore.availablePoints)"
                            >
                                <b-progress-bar
                                    variant="success"
                                    :value="Number(accountStore.balance)"
                                    :label="`${accountStore.balance}/${
                                        Number(accountStore.balance) + Number(questStore.availablePoints)
                                    }`"
                                />
                            </b-progress>
                        </div>
                    </div>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { decodeHTML } from '../../utils/decode-html';
import { mapStores } from 'pinia';
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    data() {
        return {
            decodeHTML,
            isModalPoolSubscriptionShown: false,
            isModalWalletAccessShown: false,
            isRefreshing: false,
            isIframe: window.self !== window.top,
            error: '',
            screenWidth: window.innerWidth,
        };
    },
    props: {
        height: Number,
    },
    computed: {
        ...mapStores(useAuthStore),
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        isRouteRanking() {
            return this.$route.name !== 'ranking';
        },
    },
});
</script>
