console.log('background loaded');
let isLogin = false
let TOKEN = '';
let USERINFO = {}
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
    // await sendToContentScript({ type: 'SETTOWINDOW', data: { name: 'michael' } })
    const tab = await getCurrentTab();
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/static/js/main.min.js'],
    });
}


//监听control+B 快捷键
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


const loginHanlder = async () => {
    // 1.查看sub 查看用户是否存在
    // 2.如果不存在添加到数据库 +isLogin
    try {

        const getAuthTokenResult = await chrome.identity.getAuthToken({ interactive: true });
        TOKEN = getAuthTokenResult.token
        const fetch_url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${TOKEN}`
        const res = await fetch(fetch_url)
        const userInfo = await res.json()
        console.log('获取用户信息成功:', userInfo);
        // 对接后端
        // const loginURL = 'http://localhost:3001/api/user/create'
        // await fetch(loginURL,
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(userInfo)
        //     })
        USERINFO = userInfo
        isLogin = true
        console.log('登录成功');
    } catch (error) {
        console.log('loginHanlder Error:', JSON.stringify(error));
    }
}


const logoutHanlder = async () => {
    await chrome.identity.removeCachedAuthToken({ token: TOKEN });
    USERINFO = {}
    isLogin = false
    TOKEN = ''
    console.log('退出成功');
}

// =========================================================
//监听popup和contentScript的消息。
const wrapAsyncFunction = (listener) => (request, sender, sendResponse) => {
    Promise.resolve(listener(request, sender)).then(sendResponse);
    return true;
};


chrome.runtime.onMessage.addListener(wrapAsyncFunction(async (request, sender) => {

    const { type } = request;
    console.log('background-请求类型:', type);
    if (type === "LOGIN") {
        await loginHanlder()
        return { isLogin, userInfo: USERINFO }

    }
    else if (type === 'LOGOUT') {
        await logoutHanlder()
    }
    else if (type === 'LOGINSTATUS') {
        return { isLogin, userInfo: USERINFO }
    }
})
);
