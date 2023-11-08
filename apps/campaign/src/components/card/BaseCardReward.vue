<template>
    <b-card
        body-class="d-flex align-items-start justify-content-start"
        footer-class="py-3"
        :no-body="!expiry.date && !image"
        :img-src="image"
        :overlay="!!image"
        class="mb-2 x-lg-0 my-lg-3"
        :class="{ 'card-promoted': isPromoted }"
    >
        <b-badge
            v-if="expiry && expiry.date"
            v-b-tooltip.hover.left
            :title="format(expiry.date, 'MMMM do yyyy hh:mm:ss')"
            variant="primary"
            class="p-1 bg-primary"
        >
            <i v-if="!isExpired" class="fas fa-clock card-text"></i>
            <span :class="{ 'text-accent': !isExpired, 'card-text': isExpired }">{{ expiryDate }}</span>
        </b-badge>
        <template #footer>
            <b-card-title class="d-flex">
                <slot name="title"></slot>
            </b-card-title>
            <b-card-text> {{ description }} </b-card-text>
            <div class="d-flex pb-3">
                <div class="d-flex align-items-center">
                    <span class="card-text me-1"> Price: </span>
                    <b-badge variant="primary" class="ms-1 p-1 bg-primary">
                        <span class="text-accent">
                            <template v-if="price && price > 0"> {{ price }} {{ priceCurrency }} </template>
                            <template v-else> {{ pointPrice }}</template>
                        </span>
                    </b-badge>
                </div>
                <div class="d-flex align-items-center ms-auto" v-if="progress && progress.limit">
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
                        <span class="card-text">/{{ progress.limit }}</span>
                    </b-badge>
                </div>
            </div>
            <span id="disabled-wrapper" class="d-block" tabindex="0">
                <b-button
                    variant="primary"
                    block
                    class="w-100"
                    :disabled="isSoldOut || isExpired || isLocked || isDisabled"
                    @click="$emit('submit')"
                >
                    <template v-if="isSoldOut">Sold out</template>
                    <template v-else-if="isDisabled">Not available</template>
                    <template v-else-if="isExpired">Expired</template>
                    <template v-else-if="price && price > 0">
                        <strong>{{ price }} {{ priceCurrency }}</strong>
                        <small v-if="pointPrice">
                            / {{ `${pointPrice} point${pointPrice && pointPrice > 1 ? 's' : ''}` }}
                        </small>
                    </template>
                    <template v-else-if="isLocked"> <i class="fas fa-lock me-1"></i> Locked </template>
                    <template v-else>
                        <strong>{{ `${pointPrice} point${pointPrice && pointPrice > 1 ? 's' : ''}` }}</strong>
                    </template>
                </b-button>
            </span>
            <div class="text-center" v-if="isLocked">
                <b-link
                    target="_blank"
                    :href="`https://polygonscan.com/token/${tokenGatingContractAddress}`"
                    v-b-tooltip.top
                    :title="`Contract: ${tokenGatingContractAddress}`"
                    class="text-white text-opaque"
                >
                    This perk is exclusive to token holders
                </b-link>
            </div>
        </template>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format, formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardRewardCustom',
    data() {
        return { format, id: 'modalERC721PerkPayment', error: '', isModalShown: false, isSubmitting: false };
    },
    props: {
        image: String,
        isDisabled: Boolean,
        isPromoted: Boolean,
        title: String,
        description: String,
        price: Number,
        priceCurrency: String,
        pointPrice: Number,
        isLocked: Boolean,
        tokenGatingContractAddress: String,
        progress: {
            required: true,
            type: Object as PropType<{ count: number; limit: number }>,
        },
        expiry: {
            required: true,
            type: Object as PropType<{ date: number; now: number }>,
        },
    },
    computed: {
        progressCount: function () {
            if (!this.progress) return 0;
            return this.progress.limit - this.progress.count;
        },
        progressPercentage: function () {
            if (!this.progress) return 100;
            return this.progress.count / this.progress.limit;
        },
        isSoldOut: function () {
            return this.progress.limit > 0 ? this.progress.count >= this.progress.limit : false;
        },
        isExpired: function () {
            return this.expiry.date ? this.expiry.now - this.expiry.date > 0 : false;
        },
        expiryDate: function () {
            return !this.isExpired && this.expiry
                ? formatDistance(new Date(this.expiry.date), new Date(this.expiry.now), {
                      addSuffix: false,
                  })
                : 'expired';
        },
    },
});
</script>
