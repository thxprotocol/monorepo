<template>
    <b-card no-body class="mb-2 x-lg-0 my-lg-3" :class="{ 'card-promoted': reward.isPromoted }">
        <header class="card-img" :style="{ backgroundImage: image && `url(${image})`, height: '200px' }">
            <b-badge
                v-if="reward.expiry && reward.expiry.date"
                v-b-tooltip.hover.left
                :title="format(new Date(reward.expiry.date), 'MMMM do yyyy hh:mm:ss')"
                variant="primary"
                class="badge-expiry p-1 bg-primary"
            >
                <i v-if="!reward.isExpired" class="fas fa-clock card-text"></i>
                <span :class="{ 'text-accent': !reward.isExpired, 'card-text': reward.isExpired }">{{
                    expiryDate
                }}</span>
            </b-badge>
            <b-img v-if="!image" class="card-img-logo" :src="accountStore.config.logoUrl" widht="auto" height="100" />
        </header>
        <b-card-body>
            <b-card-title class="d-flex">
                <i class="me-2" :class="iconMap[reward.variant]"></i>
                <slot name="title"></slot>
            </b-card-title>
            <b-card-text class="card-description" v-html="reward.description" />
            <div class="d-flex pb-3">
                <div v-if="reward.pointPrice" class="d-flex align-items-center">
                    <span class="card-text me-1"> Price: </span>
                    <b-badge variant="primary" class="ms-1 p-1 bg-primary">
                        <span class="text-accent">
                            {{ reward.pointPrice }}
                        </span>
                    </b-badge>
                </div>
                <div v-if="reward.progress && reward.progress.limit" class="d-flex align-items-center ms-auto">
                    <span class="card-text me-1"> Supply: </span>
                    <b-badge variant="primary" class="ms-1 p-1 px-2 bg-primary">
                        <span
                            :class="{
                                'text-danger': progressPercentage >= 0.9,
                                'text-warning': progressPercentage > 0.75 && progressPercentage < 0.9,
                                'text-accent': progressPercentage >= 0 && progressPercentage <= 0.75,
                            }"
                        >
                            {{ progressCount }}
                        </span>
                        <span class="card-text">/{{ reward.progress.limit }}</span>
                    </b-badge>
                </div>
            </div>
            <span id="disabled-wrapper" class="d-block" tabindex="0">
                <BaseButtonQuestLocked
                    v-if="reward.isLocked"
                    :id="`modalQuestLock${reward._id}`"
                    :locks="reward.locks"
                />
                <b-button
                    v-else
                    v-b-modal="`modalRewardPayment${reward._id}`"
                    variant="primary"
                    block
                    class="w-100"
                    :disabled="!reward.isStocked || reward.isExpired || reward.isLocked || reward.isDisabled"
                >
                    <template v-if="!reward.isStocked">Sold out</template>
                    <template v-else-if="reward.isExpired">Expired</template>
                    <template v-else-if="reward.isDisabled">Not available</template>
                    <template v-else>
                        <strong>{{
                            `${reward.pointPrice} point${reward.pointPrice && reward.pointPrice > 1 ? 's' : ''}`
                        }}</strong>
                    </template>
                </b-button>
            </span>
        </b-card-body>
    </b-card>
    <BaseModalRewardPayment :id="`modalRewardPayment${reward._id}`" :reward="reward" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format, formatDistance } from 'date-fns';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { RewardVariant } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseCardReward',
    props: {
        image: String,
        reward: {
            type: Object as PropType<TReward & { isExpired: boolean; isStocked: boolean }>,
            required: true,
        },
    },
    data() {
        return {
            format,
            iconMap: {
                [RewardVariant.Coin]: 'fas fa-coins',
                [RewardVariant.NFT]: 'fas fa-palette',
                [RewardVariant.Coupon]: 'fas fa-tags',
                [RewardVariant.Custom]: 'fas fa-gift',
                [RewardVariant.DiscordRole]: 'fab fa-discord',
                [RewardVariant.Galachain]: 'fas fa-box',
            } as { [variant: string]: string },
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        progressCount: function () {
            if (!this.reward.progress) return 0;
            return this.reward.progress.limit - this.reward.progress.count;
        },
        progressPercentage: function () {
            if (!this.reward.progress) return 100;
            return this.reward.progress.count / this.reward.progress.limit;
        },
        expiryDate: function () {
            return !this.reward.isExpired && this.reward.expiry
                ? formatDistance(new Date(this.reward.expiry.date), new Date(this.reward.expiry.now), {
                      addSuffix: false,
                  })
                : 'expired';
        },
    },
});
</script>
<style lang="scss">
.card-img-overlay {
    bottom: auto !important;
}
.card-img {
    width: 100%;
    background: radial-gradient(transparent, var(--bs-primary));
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .badge-expiry {
        position: absolute;
        top: 1rem;
        left: 1rem;
    }
}
.card-description {
    white-space: pre-line;
    display: block;
}
</style>
