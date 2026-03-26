const EMPTY_GROUP = chrome.tabGroups.TAB_GROUP_ID_NONE;

const getKey = async<T>(key, defaultVal) => {
    const response = await new Promise<T>((resolve) => {
        chrome.storage.local.get({ [key]: defaultVal }, (result) => {
            resolve(result[key]);
        });
    });

    return response;
};

const lastGroupKey = (windowId) => `lastGroup_${windowId.toString()}`;

chrome.tabs.onActivated.addListener(async (info) => {

    // sleep
    await new Promise(resolve => setTimeout(resolve, 300));

    const tabId = info.tabId;
    const windowId = info.windowId;
    const lastGroup = await getKey(lastGroupKey(windowId), EMPTY_GROUP);

    const tabDetails = await chrome.tabs.get(tabId);
    const currentGroup = tabDetails.groupId;

    let enoughTime = true;
    const lastTime = await getKey<number>('lastTime', 0);
    if (Date.now() - lastTime < 500) {
        enoughTime = false;
    }

    if (lastGroup != EMPTY_GROUP && enoughTime) {
        const groups = await chrome.tabGroups.query({});
        for (const group of groups) {
            if (group.id != EMPTY_GROUP && group.id != currentGroup)
                chrome.tabGroups.update(group.id, { collapsed: true });
        }
    }

    chrome.storage.local.set({ [lastGroupKey(windowId)]: currentGroup });
});

const groupChange = (group) => {
    chrome.storage.local.set({
        [lastGroupKey(group.windowId)]: group.id,
        lastTime: Date.now(),
    });
};

chrome.windows.onRemoved.addListener((windowId) => {
    // Prevent memory leaks
    chrome.storage.local.remove(lastGroupKey(windowId));
});

chrome.tabGroups.onCreated.addListener(groupChange);
chrome.tabGroups.onUpdated.addListener(groupChange);
