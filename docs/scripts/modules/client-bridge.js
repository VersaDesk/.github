async function waitForClientAPI(maxWaitMs = 2500) {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        if (typeof window.PhantomClientAPI === 'function') {
            return window.PhantomClientAPI;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    return null;
}

export async function initClientBridge() {
    const ClientAPI = await waitForClientAPI();
    if (typeof ClientAPI !== 'function') return;

    const clientAPI = new ClientAPI();

    try {
        await clientAPI.initialize();
    } catch (error) {
        console.warn('VersaDesk API Offline Mode');
    }

    document.querySelector('.gotodesktop')?.addEventListener('click', () => {
        clientAPI.navigation?.toDesktop?.({});
    });

    document.querySelector('.gotoweb')?.addEventListener('click', () => {
        clientAPI.navigation?.toWeb?.({ path: 'project/list' });
    });
}
