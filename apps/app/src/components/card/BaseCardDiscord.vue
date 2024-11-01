<template>
    <b-card
        class="rounded-0 target-body disc-black w-100"
        header-class="py-2 d-flex align-items-center "
        body-class="p-1"
    >
        <template #header>
            <i class="fab fa-discord text-opaque mt-1 me-3 discord-icon" />
            <div>
                <span>Got questions?</span>
                <div>
                    <strong class="me-1 discord-highlight-text">{{ presenceCount.toLocaleString() }}</strong>
                    <span class="text-opaque">Members</span>
                </div>
                <a
                    v-if="inviteURL"
                    target="_blank"
                    :href="inviteURL"
                    size="sm"
                    class="ms-auto ml-1"
                    style="color: #a9b8ff"
                >
                    Ask around!
                </a>
            </div>
        </template>

        <!--        <b-avatar-->
        <!--            v-for="member of membersTruncated"-->
        <!--            v-b-tooltip-->
        <!--            :title="member.username"-->
        <!--            variant="primary"-->
        <!--            class="m-1"-->
        <!--            :src="member.avatar_url"-->
        <!--            badge-->
        <!--            size="2rem"-->
        <!--            :badge-variant="member.isOnline ? 'success' : 'warning'"-->
        <!--        />-->
        <!--        <b-link :href="inviteURL">-->
        <!--            <b-avatar size="2rem" variant="primary" class="m-1">-->
        <!--                <i class="fas fa-ellipsis-h mt-1 text-opaque" />-->
        <!--            </b-avatar>-->
        <!--        </b-link>-->
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
        // const { data } = await axios('https://discord.com/api/guilds/836147176270856243/widget.json');
        // this.presenceCount = data.presence_count;
        // this.members = data.members;
        // this.inviteURL = data.instant_invite;
        const { data } = await axios('https://discord.com/api/guilds/997069800092225576/widget.json');
        // this.presenceCount = data.presence_count;
        const server_data = await axios(
            `https://discord.com/api/v9/invites/${
                data.instant_invite.split('/')[data.instant_invite.split('/').length - 1]
            }?with_counts=true&with_expiration=true`,
        );
        this.presenceCount = server_data.data.approximate_member_count;
        this.members = [];
        this.inviteURL = data.instant_invite;
        // this.inviteURL = 'https://www.santabrowser.com/faq';
    },
});
</script>
<style>
.disc-black {
    bottom: 0;
    width: 92%;
}
.truncate-text {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
}
.disc-black .card-body {
    display: none;
}

.truncate-text-ellipsis {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.disc-black .card-header {
    background-color: #000 !important;
    width: 100%;
    margin: 0;
    border-radius: 0.5rem !important;
}

.target-body {
    background-color: transparent !important;
}

.target-body .card-body {
    background-color: transparent !important;
}

.discord-icon {
    font-size: 1rem;
    color: #6c86ff;
}
.discord-highlight-text {
    background: linear-gradient(180deg, #d2cc52 0%, #ccc300 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0px 1px 16px rgba(234, 211, 12, 0.76);
}
</style>
