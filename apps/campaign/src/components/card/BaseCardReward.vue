<template>
    <b-card no-body class="mb-2 x-lg-0 my-lg-3" :class="{ 'card-promoted': reward.isPromoted }">
        <header class="card-img" :style="{ backgroundImage: image && `url(${image})`, height: '200px' }">
            <b-badge
                v-if="reward.expiry && reward.expiry.date"
                v-b-tooltip.hover.left
                :title="format(reward.expiry.date, 'MMMM do yyyy hh:mm:ss')"
                variant="primary"
                class="badge-expiry p-1 bg-primary"
            >
                <i v-if="!isExpired" class="fas fa-clock card-text"></i>
                <span :class="{ 'text-accent': !isExpired, 'card-text': isExpired }">{{ expiryDate }}</span>
            </b-badge>
            <b-img class="card-img-logo" v-if="!image" :src="accountStore.config.logoUrl" widht="auto" height="100" />
        </header>
        <b-card-body>
            <b-card-title class="d-flex">
                <slot name="title"></slot>
            </b-card-title>
            <b-card-text class="card-description" v-html="reward.description" />
            <div class="d-flex pb-3">
                <div class="d-flex align-items-center">
                    <span class="card-text me-1"> Price: </span>
                    <b-badge variant="primary" class="ms-1 p-1 bg-primary">
                        <span class="text-accent">
                            {{ reward.pointPrice }}
                        </span>
                    </b-badge>
                </div>
                <div class="d-flex align-items-center ms-auto" v-if="reward.progress && reward.progress.limit">
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
                <b-button
                    variant="primary"
                    block
                    class="w-100"
                    :disabled="isSoldOut || isExpired || reward.isLocked || reward.isDisabled"
                    @click="$emit('submit')"
                >
                    <template v-if="isSoldOut">Sold out</template>
                    <template v-else-if="reward.isDisabled">Not available</template>
                    <template v-else-if="isExpired">Expired</template>
                    <template v-else-if="reward.isLocked"> <i class="fas fa-lock me-1"></i> Locked </template>
                    <template v-else>
                        <strong>{{
                            `${reward.pointPrice} point${reward.pointPrice && reward.pointPrice > 1 ? 's' : ''}`
                        }}</strong>
                    </template>
                </b-button>
            </span>
        </b-card-body>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format, formatDistance } from 'date-fns';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';

export default defineComponent({
    name: 'BaseCardRewardCustom',
    data() {
        return { format, id: 'modalERC721PerkPayment', error: '', isModalShown: false, isSubmitting: false };
    },
    props: {
        image: String,
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
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
        isSoldOut: function () {
            return this.reward.progress.limit > 0 ? this.reward.progress.count >= this.reward.progress.limit : false;
        },
        isExpired: function () {
            return this.reward.expiry.date ? this.reward.expiry.now - this.reward.expiry.date > 0 : false;
        },
        expiryDate: function () {
            return !this.isExpired && this.reward.expiry
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
