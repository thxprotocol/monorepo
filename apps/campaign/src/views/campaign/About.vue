<template>
    <b-container>
        <b-row>
            <b-col offset-xl="2" xl="8">
                <b-card class="mx-auto my-2" :img-src="accountStore.config.backgroundUrl" img-top>
                    <template #header>
                        <strong>{{ accountStore.config.title }}</strong>
                    </template>
                    <p style="white-space: pre-line" v-html="accountStore.config.description"></p>
                    <b-button
                        v-if="!isQuestCampaign && accountStore.isAuthenticated"
                        :to="`/c/${accountStore.config.slug}/wallets`"
                        variant="primary"
                        class="w-100"
                    >
                        Wallet
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button
                        v-if="!isQuestCampaign && !accountStore.isAuthenticated"
                        :to="`/c/${accountStore.config.slug}/signin`"
                        variant="primary"
                        class="w-100"
                    >
                        Sign in
                        <i class="fas fa-sign-in-alt ms-2" />
                    </b-button>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { defineComponent } from 'vue';
import { useQuestStore } from '../../stores/Quest';
import { useRewardStore } from '../../stores/Reward';

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
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        isQuestCampaign() {
            return this.questStore.quests.length || this.rewardStore.rewards.length;
        },
    },
});
</script>
