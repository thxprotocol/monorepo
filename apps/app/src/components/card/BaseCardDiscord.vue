<template>
    <b-card class="rounded-0" header-class="p-2 ps-3 d-flex align-items-center " body-class="p-1">
        <template #header>
            <i class="fab fa-discord text-opaque mt-1 me-3" style="font-size: 1.3rem" />
            <div>
                <span>Got questions?</span>
                <div>
                    <strong class="me-1 text-accent">{{ presenceCount }}</strong>
                    <span class="text-opaque">Members Online</span>
                </div>
            </div>
            <b-button v-if="inviteURL" target="_blank" :href="inviteURL" size="sm" class="ms-auto" variant="success">
                Ask around!
            </b-button>
        </template>

        <b-avatar
            v-for="member of membersTruncated"
            v-b-tooltip
            :title="member.username"
            variant="primary"
            class="m-2"
            :src="member.avatar_url"
            badge
            size="1.6rem"
            :badge-variant="member.isOnline ? 'success' : 'warning'"
        />
        <b-link :href="inviteURL">
            <b-avatar size="2rem" variant="primary" class="m-1">
                <i class="fas fa-ellipsis-h mt-1 text-opaque" />
            </b-avatar>
        </b-link>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import axios from 'axios';

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default defineComponent({
    name: 'BaseCardDiscord',
    data() {
        return {
            inviteURL: '',
            presenceCount: 0,
            members: [] as { status: string; username: string; avatar_url: string }[],
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        membersTruncated() {
            return shuffleArray(this.members)
                .slice(0, 17)
                .map((member) => ({
                    ...member,
                    isOnline: member.status !== 'idle',
                }));
        },
    },
    async mounted() {
        const { data } = await axios('https://discord.com/api/guilds/836147176270856243/widget.json');
        this.presenceCount = data.presence_count;
        this.members = data.members;
        this.inviteURL = data.instant_invite;
    },
});
</script>
<style>
.truncate-text {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
}

.truncate-text-ellipsis {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
