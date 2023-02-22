let isLogin = false

async function sendToContentScript(payload) {
    const { type = 'UNKNOWN', data = {} } = payload
    const tab = await getCurrentTab()
    return await chrome.tabs.sendMessage(tab.id, { type, data })
}

// //background.js 只会执行一次
// console.log("background loaded");

const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};


//当前tab加载modal
// 如果当前的App不存在就加载js，如果存在了就用display元素控制
async function loadModal() {
    await sendToContentScript({ type: 'SETTOWINDOW', data: { name: 'michael' } })
    const tab = await getCurrentTab();
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/static/js/main.min.js'],
    });
}


//监听control+shift+Y 快捷键
chrome.commands.onCommand.addListener(async (command) => {
    if (!isLogin) {
        await sendToContentScript({ type: 'NOTLOGIN' })
        return
    }
    else if (command === "show-modal") {
        loadModal()
    }
});

// =========================================================
//添加右键菜单
chrome.contextMenus.create({
    id: "ChatGPT-Assistant",
    title: "ChatGPT Assistant",
    contexts: ["page", 'selection'],

});
//监听快捷键被点击
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "ChatGPT-Assistant") {
        loadModal()
    }
});

// =========================================================
//监听popup的消息。
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type } = request;
    if (type === "LOGIN") {
        isLogin = true
    }
    else if (type === 'LOGOUT') {
        isLogin = false
    }
    else if (type === 'LOGINSTATUS') {
        sendResponse(isLogin)
    }

});
