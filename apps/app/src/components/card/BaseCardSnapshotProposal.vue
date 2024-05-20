<template>
    <b-card>
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
                        <b-link
                            :href="'https://snapshot.org/#/thxprotocol.eth/proposal/' + proposal.id"
                            target="_blank"
                            class="text-white text-decoration-none"
                        >
                            {{ proposal.title }}
                        </b-link>
                        <b-link
                            :href="'https://snapshot.org/#/thxprotocol.eth/proposal/' + proposal.id"
                            target="_blank"
                            class="ms-2 text-white text-opaque"
                        >
                            <i class="fas fa-external-link-alt" />
                        </b-link>
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
                <b-col lg="9" class="d-flex align-items-center">
                    <b-progress :max="proposal.scores_total" class="flex-grow-1">
                        <b-progress-bar variant="success" :value="proposal.scores[0]">
                            <small>{{ proposal.scores[0].toFixed(6) }} veTHX</small>
                        </b-progress-bar>
                        <b-progress-bar variant="primary" :value="proposal.scores[1]" class="text-danger">
                            <small>{{ proposal.scores[1].toFixed(6) }} veTHX</small>
                        </b-progress-bar>
                    </b-progress>
                </b-col>
                <b-col lg="3">
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
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useSnapshotStore } from '../../stores/Snapshot';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardSnapshotProposal',
    props: {
        proposal: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            format,
            isModalProposalShown: false,
        };
    },
    computed: {
        ...mapStores(useSnapshotStore, useVeStore),
    },
});
</script>
