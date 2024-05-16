<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">
                Onboarding <br />
                Quest &amp; Rewards
            </h1>
            <p class="lead">
                Get lottery tickets for NFT's at a discount and claim the Discord Role for your membership rank.
            </p>
            <b-button variant="success" href="https://app.thx.network/c/thx-app/rewards" target="_blank">
                Onboarding Rewards
            </b-button>
        </template>
        <template #secondary>
            <div
                :style="{
                    backgroundImage: `url(${imgTreasury})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                }"
                class="d-flex align-items-center justify-content-center h-100 rounded p-5"
            >
                <div class="p-5 rounded text-center" :style="{ background: 'rgba(0, 0, 0, 0.75)' }">
                    <strong class="text-success h1">
                        {{ participant ? participant.balance : 0 }}
                    </strong>
                    <br />
                    points
                </div>
            </div>
        </template>
    </BaseCardHeader>
    <b-container>
        <b-row>
            <b-col lg="8" offset-lg="2">
                <div v-for="(quest, index) of questStore.quests" class="d-flex align-items-start quest-wrapper py-5">
                    <div
                        style="width: 50px; height: 50px; font-size: 1.5rem"
                        class="rounded-pill bg-primary mx-3 d-flex align-items-center justify-content-center"
                        variant="primary"
                    >
                        <span class="text-opaque">{{ index + 1 }}</span>
                    </div>
                    <component :is="questComponentMap[quest.variant]" :quest="quest" />
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { useQuestStore } from '@thxnetwork/campaign/stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { questComponentMap } from '../../utils/quests';
import imgTreasury from '../../assets/thx_token_subscribe.webp';
import BaseCardQuestInvite from '../../components/card/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '../../components/card/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '../../components/card/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '../../components/card/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '../../components/card/BaseCardQuestWeb3.vue';
import BaseCardQuestGitcoin from '../../components/card/BaseCardQuestGitcoin.vue';
import BaseCardQuestWebhook from '../../components/card/BaseCardQuestWebhook.vue';
import { useAccountStore } from '@thxnetwork/campaign/stores/Account';
import { useAuthStore } from '@thxnetwork/campaign/stores/Auth';

export default defineComponent({
    name: 'Learn',
    components: {
        BaseCardQuestInvite,
        BaseCardQuestSocial,
        BaseCardQuestCustom,
        BaseCardQuestDaily,
        BaseCardQuestWeb3,
        BaseCardQuestGitcoin,
        BaseCardQuestWebhook,
    },
    data() {
        return {
            imgTreasury,
            questComponentMap,
            isAlertShown: true,
            campaignId: '663259683f597135e0007c60',
        };
    },
    computed: {
        ...mapStores(useQuestStore, useAccountStore, useAuthStore),
        participant() {
            return this.accountStore.participants.find((p) => p.poolId === this.campaignId);
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler(isAuthenticated: boolean) {
                this.questStore.list(this.campaignId);
                if (!isAuthenticated) return;
                this.accountStore.getParticipants(this.campaignId);
            },
            immediate: true,
        },
    },
});
</script>
<style lang="scss">
.quest-wrapper {
    position: relative;

    &:before {
        content: '';
        background: var(--thx-linear-gradient-line);
        width: 5px;
        height: 100%;
        z-index: -1;
        display: block;
        position: absolute;
        left: 35px;
        top: 0;
    }
}
</style>
