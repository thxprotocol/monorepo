<template>
  <div class="wallet">
    <component
      v-for="(erc20, key) of rewardsStore.erc20s"
      :key="key"
      :is="'BaseCardERC20'"
      :erc20="erc20"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseCardERC20 from '../components/BaseCardERC20.vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../stores/Reward';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';

export default defineComponent({
  name: 'Wallet',
  components: {
    BaseCardERC20,
  },
  computed: {
    ...mapStores(useRewardStore),
  },
  data() {
    return {
      Brands,
      RewardVariant,
    };
  },
});
</script>
