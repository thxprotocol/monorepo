<template>
    <b-card :header-class="`d-flex align-items-center p-2 ${headerClass}`" no-body class="mx-2">
        <template #header>
            <div class="d-flex justify-content-between w-100 align-items-center" @click.stop="isVisible = !isVisible">
                <div
                    style="height: 30px; width: 30px"
                    class="d-flex align-items-center justify-content-center rounded position-relative me-3"
                >
                    <b-img v-if="icon" :src="icon" width="30" height="30" class="rounded" />
                    <div v-else>
                        <i class="text-opaque" :class="iconMap[rewardVariant]" />
                    </div>
                </div>
                <div class="d-flex flex-grow-1 justify-content-between pe-3">
                    <slot name="header" />
                </div>
                <b-dropdown variant="link" size="sm" no-caret end header-class="d-flex">
                    <template #button-content>
                        <i class="fas fa-ellipsis-v ml-0 text-muted"></i>
                    </template>
                    <b-dropdown-header v-if="createdAt">
                        <div class="text-opaque">
                            {{ format(new Date(createdAt), 'MMM do hh:mm') }}
                        </div>
                        <i class="text-opaque" :class="`ms-auto ${iconMap[rewardVariant]}`" />
                    </b-dropdown-header>
                    <b-dropdown-divider />
                    <slot name="dropdown-items"></slot>
                </b-dropdown>
            </div>
        </template>
        <b-collapse v-model="isVisible">
            <slot />
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { format } from 'date-fns';
import { RewardVariant } from '@thxnetwork/common/enums';
import { iconMap } from './BaseCardReward.vue';

export default defineComponent({
    name: 'BaseCardPayment',
    props: {
        icon: String,
        headerClass: String,
        rewardVariant: { type: Number, required: true },
        createdAt: Date,
    },
    data() {
        return {
            isVisible: false,
            format,
            RewardVariant,
            iconMap,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
    },
});
</script>

<style>
.dropdown-header {
    display: flex !important;
    font-size: 0.8rem !important;
    opacity: 0.75 !important;
    color: var(--bs-dropdown-header-color) !important;
}
</style>
