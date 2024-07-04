<template>
    <BaseCardPayment
        :reward-variant="RewardVariant.DiscordRole"
        :icon="token.guild && token.guild.icon"
        :created-at="token.createdAt"
    >
        <template #header>
            <strong
                v-if="token.role"
                :style="{
                    color: `${token.role.color} !important`,
                }"
            >
                {{ token.role.name }}
            </strong>
            <div v-else>
                <span class="text-opaque me-2">Role no longer available</span>
                <i
                    v-b-tooltip
                    class="fas fa-info-circle text-opaque"
                    title="THX Bot is no longerin this server or the role has been removed."
                />
            </div>
        </template>
        <template #dropdown-items>
            <b-dropdown-item
                v-if="token.discordServerURL"
                target="_blank"
                :href="token.discordServerURL"
                link-class="d-flex justify-content-between align-items-center"
            >
                Server URL
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
        </template>
    </BaseCardPayment>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { format } from 'date-fns';
import { RewardVariant } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseCardCouponCode',
    props: {
        token: {
            type: Object as PropType<TRewardDiscordRolePayment>,
            required: true,
        },
    },
    data() {
        return {
            format,
            isVisible: false,
            isModalURLShown: false,
            RewardVariant,
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
