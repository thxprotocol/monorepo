<template>
    <div class="perks">
        <div class="py-2 text-center" v-if="accountStore.isAuthenticated">
            <div class="text-success h1 m-0">
                <strong>{{ accountStore.balance }}</strong>
            </div>
            <div class="text-white">points</div>
        </div>
        <component
            v-for="(perk, key) of perksStore.perks"
            :key="key"
            :is="reward.component"
            :reward="reward"
            class="mb-2"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';

export default defineComponent({
    name: 'Home',
    components: {},
    computed: {
        ...mapStores(usePerkStore),
        ...mapStores(useAccountStore),
    },
    data() {
        return {
            Brands,
            RewardVariant,
        };
    },
    created: function () {
        this.accountStore.init(this.$route.query).then(() => {
            this.accountStore.getBalance();
            this.perksStore.list();
        });
    },
});
</script>
