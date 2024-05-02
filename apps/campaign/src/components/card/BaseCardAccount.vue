<template>
    <b-card class="bg-splash" style="border-radius: 0">
        <div
            class="d-flex justify-content-start align-items-center p-3 cursor-pointer"
            style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.35); width: 100%"
        >
            <template v-if="accountStore.account">
                <b-link
                    class="rounded-circle position-relative gradient-border-xl"
                    @click="accountStore.isModalAccountShown = true"
                >
                    <b-avatar size="50" :src="accountStore.account.profileImg" variant="dark" />
                    <b-button
                        variant="light"
                        size="sm"
                        class="d-flex align-items-center justify-content-center position-absolute rounded-circle"
                        style="width: 19px; height: 19px; top: 35px; right: -5px"
                    >
                        <i class="fas fa-pencil text-primary" style="font-size: 0.6rem" />
                    </b-button>
                </b-link>
                <div class="ps-3 flex-grow-1" style="min-width: 200px">
                    <h3 class="text-white mb-0">
                        {{ accountStore.account.username }}
                    </h3>
                    <div class="d-flex align-items-center justify-content-between">
                        <BaseDropdownWallets />
                    </div>
                </div>
            </template>
            <b-spinner v-else small class="text-opaque" />
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useVeStore } from '../../stores/VE';
import { useLiquidityStore } from '../../stores/Liquidity';
import { toFiatPrice } from '../../utils/price';

export default defineComponent({
    name: 'BaseCardAccount',
    data() {
        return { toFiatPrice };
    },
    computed: {
        ...mapStores(useAccountStore, useVeStore, useLiquidityStore),
    },
});
</script>
<style>
.text-hover-underline:hover {
    text-decoration: underline;
}
</style>
