<template>
    <b-card no-body class="mb-2 x-lg-0 my-lg-3" :class="{ 'card-promoted': reward.isPromoted }">
        <header v-if="image" class="card-img" :style="{ backgroundImage: image && `url(${image})`, height: '240px' }">
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
        <b-card-body class="pb-0">
            <b-card-title class="d-flex align-items-center">
                <i class="me-2 text-opaque small" :class="iconMap[reward.variant]" />
                <slot name="title" />
            </b-card-title>
            <b-card-text class="card-description" v-html="reward.description" />
            <div class="d-flex">
                <div v-if="reward.pointPrice" class="d-flex align-items-center me-auto pb-3">
                    <span class="card-text me-1"> Price: </span>
                    <b-badge variant="primary" class="ms-1 p-1 bg-primary">
                        <span class="text-accent">
                            {{ reward.pointPrice }}
                        </span>
                    </b-badge>
                </div>
                <div v-if="reward.limitSupplyProgress.max" class="d-flex align-items-center pb-3">
                    <span class="card-text me-1"> Supply: </span>
                    <b-badge variant="primary" class="ms-1 p-1 px-2 bg-primary">
                        <span :class="limitSupplyVariant">
                            {{ reward.limitSupplyProgress.max - reward.limitSupplyProgress.count }}
                        </span>
                        <span class="card-text">/{{ reward.limitSupplyProgress.max }}</span>
                    </b-badge>
                </div>
            </div>
            <b-button
                v-if="!accountStore.isAuthenticated"
                class="w-100"
                variant="primary"
                @click="authStore.isModalLoginShown = !authStore.isModalLoginShown"
            >
                <template v-if="reward.pointPrice">
                    Pay <strong>{{ reward.pointPrice }} points</strong>
                </template>
                <strong v-else> Free! </strong>
            </b-button>
            <span v-else id="disabled-wrapper" class="d-block" tabindex="0">
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
                    class="w-100 position-relative mb-0"
                    :disabled="isDisabled"
                >
                    {{ btnLabel }}
                    <b-progress
                        v-if="reward.limitProgress.max"
                        v-b-tooltip.bottom
                        :variant="limitVariant"
                        :title="`You can purchase this reward ${reward.limitProgress.max} times.`"
                        :value="reward.limitProgress.count"
                        :max="reward.limitProgress.max"
                        style="height: 6px"
                    />
                </b-button>
            </span>
            <div class="d-flex align-items-center justify-content-between pb-2 mt-2" style="opacity: 0.5">
                <div class="d-flex align-items-center text-opaque small">
                    <span v-if="reward.author" class="text-white me-1"> {{ reward.author.username }} &CenterDot; </span>
                    <span v-if="reward.createdAt">{{ format(new Date(reward.createdAt), 'MMMM do') }} </span>
                </div>
                <div v-if="reward.paymentCount" class="d-flex align-items-center text-opaque small">
                    <i class="fas fa-users me-1" />
                    {{ reward.paymentCount }}
                </div>
            </div>
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
import { useAuthStore } from '@thxnetwork/app/stores/Auth';

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
        ...mapStores(useAccountStore, useAuthStore),
        limitSupplyVariant() {
            if (this.limitSupplyPerct >= 0.9) return 'text-danger';
            if (this.limitSupplyPerct > 0.75 && this.limitSupplyPerct < 0.9) return 'text-warning';
            if (this.limitSupplyPerct >= 0 && this.limitSupplyPerct <= 0.75) return 'text-success';
        },
        limitVariant() {
            if (this.limitPerct >= 0.75) return 'danger';
            if (this.limitPerct > 0.5 && this.limitPerct < 0.75) return 'warning';
            if (this.limitPerct >= 0 && this.limitPerct <= 0.5) return 'success';
        },
        btnLabel() {
            if (this.reward.isLimitSupplyReached) {
                return 'Sold out';
            } else if (this.reward.isLimitReached) {
                return 'Limit reached';
            } else if (this.reward.isExpired) {
                return 'Expired';
            } else if (this.reward.isDisabled) {
                return 'Not available';
            } else if (this.reward.pointPrice) {
                return `${this.reward.pointPrice} point${
                    this.reward.pointPrice && this.reward.pointPrice > 1 ? 's' : ''
                }`;
            } else {
                return 'Free!';
            }
        },
        isDisabled() {
            return !this.reward.isAvailable;
        },
        limitSupplyPerct: function () {
            if (!this.reward.limitSupplyProgress.max) return 1;
            return this.reward.limitSupplyProgress.count / this.reward.limitSupplyProgress.max;
        },
        limitPerct: function () {
            if (!this.reward.limitProgress.max) return 1;
            return this.reward.limitProgress.count / this.reward.limitProgress.max;
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
    border-top-left-radius: var(--bs-border-radius) !important;
    border-top-right-radius: var(--bs-border-radius) !important;

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
.btn {
    position: relative;

    .progress {
        bottom: 0;
        border-radius: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.25);
    }
}
</style>
