<template>
    <b-modal
        v-model="isShown"
        class="modal-campaign-domain"
        @hidden="$emit('hidden')"
        centered
        hide-footer
        ref="modal"
        content-class="gradient-shadow-xl"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-external-link-alt me-2"></i> You clicked a link!</h5>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <p>
            You will be redirected you to an external URL: <br />
            <blockquote class="mt-3"><code>{{ url }}</code></blockquote>
        </p>
        <b-button @click="onClickContinue" variant="primary" class="w-100">
            Continue
            <i class="fas fa-chevron-right ms-1" />
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalExternalURL',
    data() {
        return { isShown: false };
    },
    props: {
        url: String,
        show: Boolean,
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
