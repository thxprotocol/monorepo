<template>
    <b-card body-class="d-flex align-items-center py-2">
        <div class="pe-3">
            <i class="fab fa-discord text-primary"></i>
        </div>
        <div class="flex-grow-1">
            <strong
                :style="{
                    color: `${token.role.color}`,
                }"
            >
                {{ token.role.name }}
            </strong>
        </div>
        <!-- <b-dropdown variant="link" size="sm" no-caret end>
            <template #button-content>
                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
            </template>
            <b-dropdown-item
                target="_blank"
                :href="token.discordServerURL"
                link-class="d-flex justify-content-between align-items-center"
            >
                Server Link
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
        </b-dropdown> -->
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import BaseModalExternalURL from '../../components/modal/BaseModalExternalURL.vue';

export default defineComponent({
    name: 'BaseCardCouponCode',
    components: {
        BaseModalExternalURL,
    },
    props: {
        token: {
            type: Object as PropType<TRewardDiscordRolePayment>,
            required: true,
        },
    },
    data() {
        return {
            isVisible: false,
            isModalURLShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        isURL() {
            try {
                new URL(this.token.code);
                return true;
            } catch (error) {
                return false;
            }
        },
        code() {
            if (this.isVisible) return this.token.code;
            return this.token.code
                .split('')
                .map(() => '•')
                .join('');
        },
    },
});
</script>
<style>
.truncate-text {
    display: inline-block;
    width: 175px;
    white-space: nowrap;
    overflow: hidden;
}

.truncate-text-ellipsis {
    display: inline-block;
    width: 175px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
