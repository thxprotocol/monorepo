<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">Protocol Governance</h1>
            <p class="lead mb-4">Vote on proposals that determine the future of the protocol.</p>
            <b-button
                href="https://snapshot.org/#/thxprotocol.eth/proposal/0x5e270d1a0243119fb922aac887b68320128254546a410225893473381219623e"
                target="_blank"
                variant="success"
                class="px-5"
            >
                Snapshot Space
            </b-button>
            <b-button variant="link" class="text-white" href="https://gov.thx.network" target="_blank">
                Discussion
            </b-button>
        </template>
        <template #secondary>
            <div class="d-flex align-items-center h-100">
                <b-card no-body style="overflow: hidden">
                    <b-row>
                        <b-col class="p-0">
                            <BCardImg :src="imgJumbotron" alt="Image" class="rounded-0" />
                        </b-col>
                        <b-col class="d-flex align-items-center justify-content-center">
                            <div class="text-center">
                                <span class="text-opaque">Voting Power</span>
                                <div class="h4 fw-bold">
                                    {{ votingPower.toFixed(6) }}
                                </div>
                                <b-link v-if="!votingPower" to="/earn" class="text-accent">
                                    Become a member to vote
                                </b-link>
                            </div>
                        </b-col>
                    </b-row>
                </b-card>
            </div>
        </template>
    </BaseCardHeader>
    <b-container>
        <BaseCardSnapshotProposal v-for="proposal of proposals" :proposal="proposal" class="mt-3" />
    </b-container>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useSnapshotStore } from '../../stores/Snapshot';
import { marked } from 'marked';
import { useVeStore } from '@thxnetwork/campaign/stores/VE';
import { formatUnits } from 'ethers/lib/utils';
import imgJumbotron from '../../assets/thx_token_governance.png';

export default defineComponent({
    name: 'Community',
    data() {
        return {
            imgJumbotron,
            formatUnits,
        };
    },
    computed: {
        ...mapStores(useSnapshotStore, useVeStore),
        votingPower() {
            return Number(formatUnits(String(this.veStore.balance), 18));
        },
        proposals() {
            return this.snapshotStore.proposals.map(
                ({ id, title, choices, scores, scores_total, body, start, end, state }: any) => {
                    return {
                        id,
                        title,
                        choices,
                        scores,
                        scores_total,
                        body: marked.parse(body),
                        start: start * 1000, // convert to ms
                        end: end * 1000, // convert to ms
                        state,
                    };
                },
            );
        },
    },
    mounted() {
        this.snapshotStore.listProposals();
    },
});
</script>
