<template>
    <blockquote>
        Minimal order amount of {{ reward.contentMetadata.amount }} times with email:
        <strong>{{ accountStore.account ? accountStore.account.email : 'Sign in first!' }}</strong>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link :href="reward.content" target="_blank" class="text-muted ms-auto">
                Increase order amount
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';

export default defineComponent({
    name: 'BaseBlockquoteVideo',
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    computed: {
        ...mapStores(useAccountStore),
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
