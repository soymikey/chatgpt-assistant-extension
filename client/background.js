// //background.js 只会执行一次
console.log("background loaded");
chrome.storage.sync.clear()

//常量
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"
const NOTLOGIN = 'NOTLOGIN'
const SETSHORTCUTLIST = 'SETSHORTCUTLIST'
const UNKNOWN = 'UNKNOWN'


async function sendToContentScript(payload) {
    const { type = UNKNOWN, data = {} } = payload
    const tab = await getCurrentTab()
    return await chrome.tabs.sendMessage(tab.id, { type, data })
}

const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};


// 当前标签页加载modal
async function loadModal() {

    const tab = await getCurrentTab();
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/static/js/main.min.js'],
    });
}

// =========================================================
//监听control+B 快捷键
chrome.commands.onCommand.addListener(async (command) => {
    const { ISLOGIN } = await chrome.storage.sync.get("ISLOGIN")
    if (!ISLOGIN) {
        await sendToContentScript({ type: NOTLOGIN })
        return
    }
    else if (command === "show-modal") {
        loadModal()
    }
});


// =======================API==================================
const createUserApi = async () => {
    const { USERINFO } = await chrome.storage.sync.get("USERINFO")
    const url = 'http://localhost:3001/api/user/create'
    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(USERINFO)
        })
    const result = await response.json()
    if (result.errno !== 0) {
        throw new Error('API error:api/user/create');
    }
}

const shortcutListAPI = async () => {
    const { USERINFO } = await chrome.storage.sync.get("USERINFO")

    const url = 'http://localhost:3001/api/shortcut/get'
    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sub: USERINFO.sub })
        })
    const result = await response.json()
    if (result.errno !== 0) {
        throw new Error('API error:api/shortcut/get');
    }
    await chrome.storage.sync.set({ SHORTCUTLIST: result.data })

}

// =======================google API==================================
const getAuthToken = async () => {
    const response = await chrome.identity.getAuthToken({ interactive: true });
    await chrome.storage.sync.set({ TOKEN: response.token })
}

const getUserInfo = async () => {
    const { TOKEN } = await chrome.storage.sync.get("TOKEN")
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${TOKEN}`
    const res = await fetch(url)
    const userInfo = await res.json()
    await chrome.storage.sync.set({ USERINFO: userInfo })
}

const loginHandler = async () => {
    try {
        await getAuthToken()//获取用户token
        await getUserInfo()//获取用户信息
        await createUserApi()//创建用户
        await shortcutListAPI()//获取用户快捷键列表
        await chrome.storage.sync.set({ ISLOGIN: true });
        console.log('登录成功');
    } catch (error) {
        console.log('loginHandler Error:', error);
    }
}


const logoutHanlder = async () => {
    const { TOKEN } = await chrome.storage.sync.get('TOKEN')
    await chrome.identity.removeCachedAuthToken({ token: TOKEN });
    await chrome.storage.sync.remove("TOKEN")
    await chrome.storage.sync.remove("ISLOGIN")
    await chrome.storage.sync.remove("USERINFO")
    await chrome.storage.sync.remove("SHORTCUTLIST")
    console.log('退出成功');
}

// =========================================================
//监听popup和contentScript的消息。
const wrapAsyncFunction = (listener) => (request, sender, sendResponse) => {
    Promise.resolve(listener(request, sender)).then(sendResponse);
    return true;
};

chrome.runtime.onMessage.addListener(wrapAsyncFunction(async (request, sender) => {
    const { type, data } = request;
    console.log('background-收到消息:', request);
    if (type === LOGIN) {
        await loginHandler()
        return true
    }
    else if (type === LOGOUT) {
        await logoutHanlder()
    }
    else if (type === SETSHORTCUTLIST) {
        await chrome.storage.sync.set({ SHORTCUTLIST: data })
    }
    else {
        alert('UNKNOWN Type')
    }
})
);


// =========================================================
//添加右键菜单
// chrome.contextMenus.create({
//     id: "ChatGPT-Assistant",
//     title: "ChatGPT Assistant",
//     contexts: ["page", 'selection'],

// });
// //监听快捷键被点击
// chrome.contextMenus.onClicked.addListener(function (info, tab) {
//     if (info.menuItemId === "ChatGPT-Assistant") {
//         loadModal()
//     }
// });