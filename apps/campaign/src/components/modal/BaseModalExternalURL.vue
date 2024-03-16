<template>
    <b-modal
        ref="modal"
        v-model="isShown"
        class="modal-campaign-domain"
        centered
        hide-footer
        content-class="gradient-shadow-xl"
        @hidden="$emit('hidden')"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-external-link-alt me-2" /> You clicked a link!</h5>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <p>You will be redirected you to an external URL:</p>
        <blockquote class="mt-3">
            <code>{{ url }}</code>
        </blockquote>
        <b-button variant="primary" class="w-100" @click="onClickContinue">
            Continue
            <i class="fas fa-chevron-right ms-1" />
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalExternalURL',
    props: {
        url: String,
        show: Boolean,
    },
    data() {
        return { isShown: false };
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickContinue() {
            window.open(this.url, '_blank');
            this.$emit('hidden', false);
        },
    },
});
</script>
