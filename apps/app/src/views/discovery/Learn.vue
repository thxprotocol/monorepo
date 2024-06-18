<template>
    <BaseCardHeader :img-src="imgTreasury">
        <template #primary>
            <h1 class="">Learn about <br /><strong>THX Network</strong></h1>
            <p class="lead">
                Get lottery tickets for NFT's at a discount and claim the Discord Role for your membership rank.
            </p>
            <b-button class="px-5" variant="success" href="https://docs.thx.network/faq/lottery" target="_blank">
                Learn more
                <i class="fas fa-chevron-right ms-2" />
            </b-button>
        </template>
        <template #secondary>
            <div class="d-flex align-items-center justify-content-end h-100 p-5 position-relative">
                <div class="w-100 p-5 rounded text-center" :style="{ background: 'rgba(0, 0, 0, 0.5)' }">
                    <strong class="text-success h1 fw-bold">
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
            <b-col md="8">
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
            <b-col md="4">
                <BaseCardReward v-for="reward of rewards" :image="reward.image" :reward="reward">
                    <template #title>
                        <div class="flex-grow-1">{{ reward.title }}</div>
                        <div class="text-accent fw-bold">
                            {{ reward.amount }} {{ reward.erc20 && reward.erc20.symbol }}
                        </div>
                    </template>
                </BaseCardReward>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { useQuestStore } from '@thxnetwork/app/stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { questComponentMap } from '../../utils/quests';
import imgTreasury from '../../assets/thx_header_learn.jpg';
import BaseCardQuestInvite from '../../components/card/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '../../components/card/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '../../components/card/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '../../components/card/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '../../components/card/BaseCardQuestWeb3.vue';
import BaseCardQuestGitcoin from '../../components/card/BaseCardQuestGitcoin.vue';
import BaseCardQuestWebhook from '../../components/card/BaseCardQuestWebhook.vue';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import { useRewardStore } from '@thxnetwork/app/stores/Reward';
import { CAMPAIGN_ID } from '@thxnetwork/app/config/secrets';

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
            campaignId: CAMPAIGN_ID,
        };
    },
    computed: {
        ...mapStores(useQuestStore, useRewardStore, useAccountStore, useAuthStore),
        participant() {
            return this.accountStore.participants.find((p) => p.poolId === this.campaignId);
        },
        quests() {
            return this.questStore.quests;
        },
        rewards() {
            const blacklist = ['66670a9f2a21f23e65dbc1b1'];
            return this.rewardStore.rewards.filter((r) => !blacklist.includes(r._id));
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler(isAuthenticated: boolean) {
                this.questStore.list(this.campaignId);
                this.rewardStore.list(this.campaignId);
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
