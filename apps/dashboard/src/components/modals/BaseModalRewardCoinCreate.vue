<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <b-form-group label="Coin" :description="`Balance: ${balance}`">
            <BaseDropdownSelectERC20 @update="onUpdateERC20" :chainId="pool.chainId" :erc20="erc20" />
        </b-form-group>
        <b-form-group label="Coin Amount">
            <b-form-input v-model="amount" />
        </b-form-group>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC20s, TERC20BalanceState } from '@thxnetwork/dashboard/types/erc20';
import { RewardVariant } from '@thxnetwork/common/enums';
import BaseDropdownSelectERC20 from '../dropdowns/BaseDropdownSelectERC20.vue';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownSelectERC20,
    },
    computed: mapGetters({
        erc20List: 'erc20/all',
        erc20BalanceList: 'erc20/balances',
    }),
})
export default class ModalRewardCoinCreate extends Vue {
    isLoading = false;
    error = '';
    amount = '0';
    erc20Id = '';
    erc20List!: IERC20s;
    erc20BalanceList!: TERC20BalanceState;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardCoin;

    get erc20() {
        return this.erc20List[this.erc20Id];
    }

    get balance() {
        if (!this.erc20 || !this.erc20BalanceList[this.erc20.address]) return '';
        return this.erc20BalanceList[this.erc20.address][this.pool.safeAddress as string];
    }

    onShow() {
        this.erc20Id = this.reward ? this.reward.erc20Id : this.erc20Id;
        this.amount = this.reward ? this.reward.amount : this.amount;
    }

    onUpdateERC20(erc20: TERC20 | null) {
        this.erc20Id = erc20 ? erc20._id : '';

        if (this.erc20) {
            this.$store.dispatch('erc20/balanceOf', { tokenAddress: this.erc20.address, pool: this.pool });
        }
    }

    async onSubmit(payload: TBaseReward) {
        this.isLoading = true;

        try {
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.Coin,
                erc20Id: this.erc20Id,
                amount: this.amount,
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
