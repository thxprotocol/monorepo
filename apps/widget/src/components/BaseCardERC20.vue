<template>
    <b-card body-class="d-flex" class="m-2">
        <div class="pe-3">
            <img height="25" :src="token.erc20.logoImgUrl" />
        </div>
        <div class="flex-grow-1">
            <strong>{{ token.erc20.name }}</strong>
        </div>
        <div class="text-success fw-bold">{{ token.walletBalance }} {{ token.erc20.symbol }}</div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

type TERC20Token = {
    name: string;
    symbol: string;
    balance: number;
    walletBalance: number;
    logoImg: string;
    erc20: TERC20;
};

export default defineComponent({
    name: 'BaseCardERC20',
    props: {
        token: {
            type: Object as PropType<TERC20Token>,
            required: true,
        },
    },
});
</script>
