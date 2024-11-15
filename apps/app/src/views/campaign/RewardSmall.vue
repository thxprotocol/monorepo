<template>
    <b-container class="h-100">
        <b-row class="h-100">
            <b-col lg="12" offset-lg="1" class="h-100">
                <div v-if="rewardStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>

                <b-row v-else style="display: flex; gap: 15px" class="h-100">
                    <b-col
                        v-if="(score === 0 || Number.isNaN(score)) && message !== CP_CAMPAIGN"
                        lg="4"
                        style="
                            background: linear-gradient(
                                93deg,
                                rgba(221, 174, 65, 0.8) 0%,
                                rgba(255, 195, 90, 0.8) 13.81%,
                                rgba(255, 205, 56, 0.8) 31.51%,
                                rgba(255, 216, 148, 0.8) 87.04%,
                                rgba(255, 215, 96, 0.8) 100.16%
                            );
                        "
                        class="santa-card"
                    >
                        <div
                            class="d-flex flex-column justify-content-between h-100"
                            style="padding: 20px 22px 15px 22px"
                        >
                            <h2 style="color: #2f2a1a">
                                Start completing
                                <strong style="font-weight: 700; font-size: 16px">SANTA QUESTS</strong> and you can buy
                                crypto and coupons using those santa coins!
                            </h2>
                            <button class="w-100 my-reward-btn" variant="primary">
                                Browse <strong>Quests</strong>
                            </button>
                        </div>
                    </b-col>
                    <b-col
                        v-if="(score === 0 || Number.isNaN(score)) && message === CP_CAMPAIGN"
                        lg="4"
                        class="quest-card"
                        style="
                            background: linear-gradient(
                                94deg,
                                rgba(222, 222, 222, 0.9) 0%,
                                rgba(192, 192, 192, 0.9) 13.29%,
                                rgba(191, 191, 191, 0.9) 30.34%,
                                rgba(247, 247, 247, 0.9) 100.4%
                            );
                            color: #000;
                        "
                    >
                        <div class="d-flex flex-column justify-content-between h-100" style="padding: 50px 22px 19px">
                            <h2>
                                Start purchasing using the offers available from our
                                <span style="font-size: 16px; text-transform: uppercase">cashback</span>
                                system and get rewarded!
                            </h2>
                            <button
                                class="w-100 my-reward-btn"
                                variant="primary"
                                style="
                                    background: linear-gradient(
                                        90deg,
                                        rgba(0, 0, 0, 0.6) 0%,
                                        rgba(33, 33, 33, 0.6) 100%
                                    );
                                "
                            >
                                Browse Quests
                            </button>
                        </div>
                    </b-col>
                    <b-col
                        v-if="(score === 0 || Number.isNaN(score)) && message === CP_CAMPAIGN"
                        lg="4"
                        class="quest-card"
                        style="
                            background: linear-gradient(
                                155deg,
                                rgba(0, 0, 0, 0.95) -2.13%,
                                rgba(29, 28, 28, 0.95) 75.49%,
                                rgba(25, 24, 24, 0.95) 136.58%
                            );
                        "
                    >
                        <div
                            class="d-flex flex-column justify-content-between h-100"
                            style="padding: 50px 22px 19px; font-style: italic"
                        >
                            <h2>
                                Start completing tasks on
                                <span style="font-size: 16px; text-transform: uppercase">SANTA PLAYWALL</span> and you
                                can buy crypto and coupons using those coins!
                            </h2>
                            <button
                                class="w-100 my-reward-btn"
                                variant="primary"
                                style="
                                    background: linear-gradient(
                                        135deg,
                                        rgba(255, 255, 255, 0.1) 0%,
                                        rgba(255, 255, 255, 0.1) 100%
                                    );
                                "
                            >
                                Browse Quests
                            </button>
                        </div>
                    </b-col>
                    <b-col
                        v-for="(reward, key) of rewardsList"
                        :key="key"
                        lg="4"
                        :style="{ width: '210px', padding: '0' }"
                    >
                        <component :is="componentMap[reward.variant]" :reward="reward" class="mb-2" />
                    </b-col>
                    <b-col
                        v-if="message === SANTA_CAMPAIGN"
                        lg="4"
                        style="
                            background: linear-gradient(
                                155deg,
                                #843636 -2.13%,
                                rgba(150, 39, 39, 0.56) 75.49%,
                                #000 136.58%
                            );
                            backdrop-filter: blur(4px);
                        "
                        class="santa-card"
                    >
                        <div
                            class="d-flex flex-column justify-content-between h-100"
                            style="padding: 20px 22px 15px 22px; font-style: italic"
                        >
                            <h2 style="color: #f5f5f5">
                                Set <strong style="font-weight: 700; font-size: 16px">SANTA</strong> default for a month
                                and earn more coins!
                            </h2>
                            <button class="w-100 my-reward-btn" variant="primary">
                                Set as <strong>Default</strong>
                            </button>
                        </div>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
import { RewardVariant } from '../../types/enums/rewards';
import BaseCardRewardCoin from '../../components/card/BaseCardRewardCoin.vue';
import BaseCardRewardNFT from '../../components/card/BaseCardRewardNFT.vue';
import BaseCardRewardCustom from '../../components/card/BaseCardRewardCustom.vue';
import BaseCardRewardCoupon from '../../components/card/BaseCardRewardCoupon.vue';
import BaseCardRewardDiscordRole from '../../components/card/BaseCardRewardDiscordRole.vue';
import { SANTA_CAMPAIGN, CP_CAMPAIGN } from '@thxnetwork/app/config/secrets';

const componentMap: { [variant: string]: string } = {
    [RewardVariant.Coin]: 'BaseCardRewardCoin',
    [RewardVariant.NFT]: 'BaseCardRewardNFT',
    [RewardVariant.Custom]: 'BaseCardRewardCustom',
    [RewardVariant.Coupon]: 'BaseCardRewardCoupon',
    [RewardVariant.DiscordRole]: 'BaseCardRewardDiscordRole',
};

export default defineComponent({
    name: 'RewardsSmall',
    components: {
        BaseCardRewardCoin,
        BaseCardRewardNFT,
        BaseCardRewardCustom,
        BaseCardRewardCoupon,
        BaseCardRewardDiscordRole,
    },
    variants: [],

    props: ['message', 'score'],
    data() {
        return {
            componentMap,
            rewardsList: [],
            SANTA_CAMPAIGN,
            CP_CAMPAIGN,
        };
    },
    computed: {
        ...mapStores(useRewardStore),
        // rewardsList() {
        //     return this.rewardStore.listReturn(this.message);
        // },
    },
    async mounted() {
        await this.getRewards(this.message);
    },
    methods: {
        async getRewards(poolId: string) {
            try {
                this.rewardsList = await this.rewardStore.listReturn(poolId);
            } catch (error) {
                console.error('rewards fetch error:', error);
            }
        },
    },
});
</script>
<style lang="scss">
.my-reward {
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.23);
    border-radius: 10px;
    margin: 0px 15px;
    h2 {
        font-size: 1rem;
        font-weight: 300;
        line-height: 25px;
    }
    font-size: 12px;
}

.santa-card {
    width: 210px;
    box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.23);
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    padding: 0;
    h2 {
        font-size: 14px;
        font-weight: 600;
        line-height: 26px;
    }
}

.my-reward-btn {
    height: 32px;
    color: #f8f8f8;
    font-size: 13px;
    font-weight: 400;
    line-height: 14px;
    border-radius: 15px;
    border: 1px solid rgba(78, 78, 78, 0.2);
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(33, 33, 33, 0.6) 100%);
    padding: 5px 0;
    transition: background 0.3s ease;
    z-index: 0;
}

.quest-card {
    padding: 0;
    width: 210px;
    height: 275px;
    border: 1px solid rgba(84, 84, 84, 0.97);
    border-radius: 5px;
    h2 {
        font-size: 14px;
        font-weight: 600;
        line-height: 26px;
    }
}
</style>
