<template>
    <b-card
        class="m-2"
        body-class="d-flex align-items-start justify-content-start"
        footer-class="py-3"
        :no-body="!expiry && !image"
        :img-src="image"
        :overlay="!!image"
        :class="{ 'card-promoted': isPromoted }"
    >
        <b-badge
            v-if="expiry && expiry.date"
            v-b-tooltip.hover.left
            :title="format(expiry.date, 'MMMM do yyyy hh:mm:ss')"
            variant="primary"
            class="p-1"
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
                    <b-badge variant="primary" class="ms-1 p-1 text-start">
                        <span class="text-accent">
                            <template v-if="price && price > 0"> {{ price }} {{ priceCurrency }} </template>
                            <template v-else> {{ pointPrice }}</template>
                        </span>
                    </b-badge>
                </div>
                <div class="d-flex align-items-center ms-auto" v-if="progress && progress.limit">
                    <span class="card-text me-1"> Supply: </span>
                    <b-badge variant="primary" class="ms-1 p-1 px-2">
                        <span
                            :class="{
                                'text-danger': progressPercentage >= 0.9,
                                'text-warning': progressPercentage > 0.75 && progressPercentage < 0.9,
                                'text-accent': progressPercentage >= 0 && progressPercentage <= 0.75,
                            }"
                        >
                            {{ progress.limit - progress.count }}
                        </span>
                        <span class="card-text">/{{ progress.limit }}</span>
                    </b-badge>
                </div>
            </div>

            <b-button variant="primary" block class="w-100" @click="$emit('submit')">
                <template v-if="price && price > 0">
                    <strong>{{ price }} {{ priceCurrency }}</strong>
                    <small> / {{ pointPrice }} points</small>
                </template>
                <template v-else>
                    <strong>{{ pointPrice }} points</strong>
                </template>
            </b-button>
        </template>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format, formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardPerk',
    components: {},
    data() {
        return { format, id: 'modalERC721PerkPayment', error: '', isModalShown: false, isSubmitting: false };
    },
    props: {
        image: String,
        isPromoted: Boolean,
        title: String,
        description: String,
        price: Number,
        priceCurrency: String,
        pointPrice: Number,
        progress: {
            type: Object as PropType<{ count: number; limit: number }>,
        },
        expiry: {
            type: Object as PropType<{ date: number; now: number }>,
        },
    },
    computed: {
        progressPercentage: function () {
            if (!this.progress) return 100;
            return this.progress.count / this.progress.limit;
        },
        isExpired: function () {
            return this.expiry && this.expiry.now - this.expiry.date > 0;
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
