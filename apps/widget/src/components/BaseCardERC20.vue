<template>
    <b-card body-class="d-flex" class="m-2">
        <div class="pe-3">
            <img height="25" :src="erc20.logoImg" />
        </div>
        <div class="flex-grow-1">
            <strong>{{ erc20.name }}</strong>
        </div>
        <div class="text-success">{{ erc20.balance }} {{ erc20.symbol }}</div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface IERC20 {
    name: string;
    symbol: string;
    balance: number;
    logoImg: string;
}

export default defineComponent({
    name: 'BaseCardERC20',
    props: {
        erc20: {
            type: Object as PropType<IERC20>,
            required: true,
        },
    },
});
</script>
