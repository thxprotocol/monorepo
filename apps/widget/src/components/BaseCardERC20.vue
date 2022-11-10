<template>
  <b-card bg-variant="light" body-class="d-flex" class="m-2">
    <div>
      <img class="img-brand" :src="erc20.logoImg" />
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

<style scoped lang="scss">
.img-brand {
  width: 25px;
  height: 25px;
  display: block;
  margin-right: 0.5rem;
}
</style>
