<template>
    <b-card body-class="d-flex align-items-center" class="m-2">
        <div class="text-success fw-bold">{{ code }}</div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardShopifyDiscountCode',
    props: {
        code: {
            type: String,
            required: true,
        },
    },
});
</script>
