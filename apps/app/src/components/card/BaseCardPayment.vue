<template>
    <b-card header-class="d-flex align-items-center p-2" no-body class="mx-2">
        <template #header>
            <div class="d-flex justify-content-between w-100 align-items-center" @click.stop="isVisible = !isVisible">
                <div
                    v-b-tooltip
                    :title="RewardVariant[rewardVariant]"
                    style="height: 30px; width: 30px"
                    class="d-flex align-items-center justify-content-center rounded position-relative me-3"
                >
                    <b-img v-if="icon" :src="icon" width="40" height="40" class="rounded" />
                    <i
                        class=""
                        style="right: 0; bottom: 0"
                        :class="(icon ? 'small position-absolute ' : 'text-opaque ') + iconMap[rewardVariant]"
                    />
                </div>
                <div class="d-flex flex-grow-1 justify-content-between pe-3">
                    <slot name="header" />
                </div>
                <b-dropdown variant="link" size="sm" no-caret end>
                    <template #button-content>
                        <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                    </template>
                    <slot name="dropdown-items"></slot>
                    <b-dropdown-divider />
                    <b-dropdown-text v-if="createdAt" class="text-end small text-opaque">
                        {{ format(new Date(createdAt), 'MMMM do hh:mm') }}
                    </b-dropdown-text>
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
