<template>
    <BaseCardHeader :img-src="imgTreasury">
        <template #primary>
            <h1 class="">Learn about <br /><strong>THX Network</strong></h1>
            <p class="lead">
                Get lottery tickets for NFT's at a discount and claim the Discord Role for your membership rank.
            </p>
        </template>
        <template #secondary>
            <div class="d-flex align-items-center justify-content-center h-100 p-5 position-relative">
                <div class="p-5 rounded text-center" :style="{ background: 'rgba(0, 0, 0, 0.5)' }">
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
        <b-tabs justified pills class="mt-3">
            <b-tab title-link-class="py-3" active>
                <template #title>
                    <span class="h5 my-3">
                        <i class="fas fa-tasks text-opaque mb-1" style="font-size: 1.5rem" /><br />
                        Onboarding Quests
                    </span>
                </template>
                <b-row>
                    <b-col md="8" offset-md="2">
                        <div
                            v-for="(quest, index) of questStore.quests"
                            class="d-flex align-items-start quest-wrapper py-5"
                        >
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
            </b-tab>
            <b-tab title-link-class="py-3">
                <template #title>
                    <!-- <sup class="rounded bg-danger p-1 px-2 small ms-2">{{ rewardStore.rewards.length }}</sup> -->
                    <span class="h5 my-3">
                        <i class="fas fa-gift text-opaque mb-1" style="font-size: 1.5rem" /><br />
                        Lottery Rewards
                    </span>
                </template>
                <b-container>
                    <b-row>
                        <b-col v-for="reward of rewards" md="4">
                            <BaseCardReward :reward="reward" />
                        </b-col>
                    </b-row>
                </b-container>
            </b-tab>
        </b-tabs>
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
            campaignId: '6650460c800266db72f63c57' || '663259683f597135e0007c60',
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
            const blacklist = [''];
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
