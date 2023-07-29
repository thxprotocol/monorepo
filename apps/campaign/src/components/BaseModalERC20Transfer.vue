<template>
    <b-modal :id="id" v-model="isShown" @hidden="$emit('hidden')" no-close-on-backdrop centered no-close-on-esc>
        <template #header>
            <h5 class="modal-title"><i class="fas fa-exchange-alt me-2"></i> Transfer {{ token.erc20.symbol }}</h5>
            <b-link class="btn-close" @click="isShown = false"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert variant="success" show class="py-1 px-2" v-if="!isVariantMetamask">
                <i class="fas fa-gift me-1"></i>
                We cover your transaction fees!
            </b-alert>
            <b-alert variant="warning" show class="py-1 px-2" v-else>
                <i class="fas fa-exclamation-circle me-1"></i>
                Please use Metamask to transfer this token.
            </b-alert>
            <b-alert v-if="error" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>

            <b-form-group label="Amount" :state="isAmountValid">
                <b-input-group>
                    <b-form-input v-model="amount" type="number" :state="isAmountValid" />
                    <b-input-group-append>
                        <b-button
                            style="border-radius: 0px 5px 5px 0px"
                            @click="amount = token.walletBalance"
                            variant="primary"
                        >
                            Max
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form-group>
            <b-form-group label="Receiver" :state="isReceiverValid">
                <b-form-input v-model="receiver" :state="isReceiverValid" placeholder="0x0" />
            </b-form-group>
        </template>
        <template #footer>
            <b-button variant="primary" class="w-100 rounded-pill" :disabled="isSubmitDisabled" @click="onClickSubmit">
                Transfer
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { isAddress, toWei } from 'web3-utils';
import { AccountVariant } from '../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalERC20Transfer',
    data() {
        return { isShown: false, amount: 0, receiver: '' };
    },
    computed: {
        isAmountValid: function () {
            return !this.amount
                ? undefined
                : Number(this.amount) > 0 && Number(this.amount) <= this.token.walletBalance;
        },
        isSubmitDisabled: function () {
            return this.isLoading || !this.isReceiverValid || !this.isAmountValid || this.isVariantMetamask;
        },
        isReceiverValid: function () {
            return this.receiver ? isAddress(this.receiver) : undefined;
        },
        isVariantMetamask: function () {
            const { account } = useAccountStore();
            return account?.variant === AccountVariant.Metamask;
        },
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
        token: {
            type: Object as PropType<TERC20Token>,
            required: true,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickSubmit() {
            const { getConfig, poolId } = useAccountStore();
            const { chainId } = getConfig(poolId);
            const config: TERC20TransferConfig = {
                erc20Id: this.token.erc20._id,
                to: this.receiver,
                amount: toWei(String(this.amount), 'ether'),
                chainId,
            };
            this.$emit('submit', config);
        },
    },
});
</script>
