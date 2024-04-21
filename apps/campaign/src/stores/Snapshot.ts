import axios from 'axios';
import { defineStore } from 'pinia';

export const useSnapshotStore = defineStore('snapshot', {
    state: (): TSnapshotState => ({
        proposals: [],
        messages: {},
    }),
    actions: {
        async listProposals() {
            try {
                const { data } = await axios.post('https://hub.snapshot.org/graphql', {
                    query: `
                        query {
                            proposals (
                                first: 20,
                                skip: 0,
                                where: {
                                    space_in: ["thxprotocol.eth"],
                                    state: "closed"
                                },
                                orderBy: "created",
                                orderDirection: desc
                            ) {
                                id
                                title
                                body
                                choices
                                start
                                end
                                snapshot
                                state
                                scores
                                scores_by_strategy
                                scores_total
                                scores_updated
                                author
                                space {
                                    id
                                    name
                                }
                            }
                        }
                    `,
                });
                this.proposals = data.data.proposals;
            } catch (error) {
                console.error('Error fetching data:', (error as any).toString());
            }
        },
        async listMessages(id: string) {
            try {
                const { data } = await axios.post('https://hub.snapshot.org/graphql', {
                    query: `
                        messages (
                        first: 20
                        where: { space: "thxprotocol.eth", id: ${id} }
                        orderBy: "mci"
                        orderDirection: desc
                        ) {
                            id
                            address
                            ipfs
                            receipt
                            type
                            mci
                        }
                    `,
                });
                this.messages[id] = data.data.messages;
            } catch (error) {
                console.error(error);
            }
        },
    },
});
