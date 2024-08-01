self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'setSession') {
        setSession(event.data.session);
    }
});

function setSession(session) {
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            console.log('Session', client.id, session);
            client.postMessage({ type: 'setSession', data: { session } });
        });
    });
}
