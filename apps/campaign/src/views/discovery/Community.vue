<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">Protocol Governance</h1>
            <p class="lead mb-4">Vote on proposals that determine the future of the protocol.</p>
            <b-button
                href="https://snapshot.org/#/thxprotocol.eth/proposal/0x5e270d1a0243119fb922aac887b68320128254546a410225893473381219623e"
                target="_blank"
                variant="success"
                class="w-100"
            >
                Snapshot Voting
            </b-button>
        </template>
        <template #secondary>
            <b-img :src="imgJumbotron" fluid alt="Governance" />
        </template>
    </BaseCardHeader>
    <b-container class="mt-3">
        <b-card v-for="proposal of proposals" class="mb-3">
            <template #header>
                <b-container class="p-0">
                    <b-row>
                        <b-col lg="9" class="d-flex align-items-center justify-content-start">
                            <b-badge
                                class="p-2 fw-normal me-2"
                                :class="{ 'text-opaque': proposal.state == 'closed' }"
                                :variant="proposal.state == 'open' ? 'success' : 'primary'"
                            >
                                {{ proposal.state }}
                            </b-badge>
                            {{ proposal.title }}
                        </b-col>
                        <b-col lg="3" class="d-flex align-items-center justify-content-end text-opaque small">
                            <i class="fas fa-clock me-2" />
                            <span>{{ format(new Date(proposal.end), 'MMMM do yyyy hh:mm:ss') }}</span>
                        </b-col>
                    </b-row>
                </b-container>
            </template>
            <b-container class="p-0">
                <b-row>
                    <b-col lg="8" class="d-flex align-items-center">
                        <b-progress :max="proposal.scores_total" class="flex-grow-1">
                            <b-progress-bar variant="success" :value="proposal.scores[0]">
                                <small>{{ proposal.scores[0].toFixed(6) }} veTHX</small>
                            </b-progress-bar>
                            <b-progress-bar variant="danger" :value="proposal.scores[1]">
                                <small>{{ proposal.scores[1].toFixed(6) }} veTHX</small>
                            </b-progress-bar>
                        </b-progress>
                    </b-col>
                    <b-col lg="4">
                        <b-button-group size="sm" class="w-100 mt-3 mt-lg-0">
                            <b-button class="text-success" variant="primary" disabled>
                                <i class="fas me-2 fa-check-circle" />For
                            </b-button>
                            <b-button class="text-danger" variant="primary" disabled>
                                <i class="fas me-2 fa-times-circle" />Against
                            </b-button>
                        </b-button-group>
                    </b-col>
                </b-row>
            </b-container>
        </b-card>
    </b-container>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useSnapshotStore } from '../../stores/Snapshot';
import imgJumbotron from '../../assets/thx_token_governance.png';
import { marked } from 'marked';
import { format } from 'date-fns';

export default defineComponent({
    name: 'Community',
    data() {
        return {
            imgJumbotron,
            format,
        };
    },
    computed: {
        ...mapStores(useSnapshotStore),
        proposals() {
            return this.snapshotStore.proposals.map(
                ({ title, choices, scores, scores_total, body, start, end, state }: any) => {
                    return {
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
