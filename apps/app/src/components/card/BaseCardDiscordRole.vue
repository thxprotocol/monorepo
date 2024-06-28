<template>
    <b-card body-class="d-flex align-items-center py-2">
        <div v-if="token.guild" v-b-tooltip class="pe-3" :title="token.guild.name">
            <b-img v-if="token.guild.icon" :src="token.guild.icon" height="30" class="rounded" />
            <i v-else class="fab fa-discord text-primary"></i>
        </div>
        <div class="flex-grow-1">
            <b-badge
                v-if="token.role"
                class="p-2"
                :style="{
                    color: 'white !important',
                    backgroundColor: `${token.role.color} !important`,
                }"
            >
                {{ token.role.name }}
            </b-badge>
            <b-badge v-else variant="dark" class="p-2">
                Role not found
                <i
                    v-b-tooltip
                    class="fas fa-info-circle"
                    title="THX Bot is no longerin this server or the role has been removed."
                />
            </b-badge>
        </div>
        <b-dropdown variant="link" size="sm" no-caret end>
            <template #button-content>
                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
            </template>
            <b-dropdown-item
                v-if="token.discordServerURL"
                target="_blank"
                :href="token.discordServerURL"
                link-class="d-flex justify-content-between align-items-center"
            >
                Server URL
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-text class="text-end small text-opaque">
                {{ format(new Date(token.createdAt), 'MMMM do hh:mm') }}
            </b-dropdown-text>
        </b-dropdown>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { format } from 'date-fns';

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
