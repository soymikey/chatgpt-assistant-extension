// //background.js 只会执行一次
console.log("background loaded");

//常量
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"
const LOGINSTATUS = 'LOGINSTATUS'
const NOTLOGIN = 'NOTLOGIN'
const UNKNOWN = 'UNKNOWN'
const SETUSERINFO = 'SETUSERINFO'
const SETSHORTCUTLIST = 'SETSHORTCUTLIST'
const GETUSERINFO = 'GETUSERINFO'


let ISLOGIN = false
let TOKEN = '';
let USERINFO = {}
let SHORTCUTLIST = []

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
    await sendToContentScript({ type: SETUSERINFO, data: USERINFO })
    await sendToContentScript({ type: SETSHORTCUTLIST, data: SHORTCUTLIST })
    const tab = await getCurrentTab();
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/static/js/main.min.js'],
    });
}

// =========================================================
//监听control+B 快捷键
chrome.commands.onCommand.addListener(async (command) => {
    if (!ISLOGIN) {
        await sendToContentScript({ type: NOTLOGIN })
        return
    }
    else if (command === "show-modal") {
        loadModal()
    }
});





// =======================API==================================
const createUserApi = async (userInfo) => {
    const url = 'http://localhost:3001/api/user/create'
    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        })
    const result = await response.json()
    if (result.errno !== 0) {
        throw new Error('API error:api/user/create');
    }
}

const shortcutListAPI = async (sub) => {
    const url = 'http://localhost:3001/api/shortcut/get'
    const response = await fetch(url,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sub })
        })
    const result = await response.json()
    if (result.errno !== 0) {
        throw new Error('API error:api/shortcut/get');
    }
    SHORTCUTLIST = result.data
}

// =======================google API==================================
const getAuthToken = async () => {
    const response = await chrome.identity.getAuthToken({ interactive: true });
    return response.token
}
const getUserInfo = async (TOKEN) => {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${TOKEN}`
    const res = await fetch(url)
    const userInfo = await res.json()
    return userInfo

}

const loginHandler = async () => {
    try {
        TOKEN = await getAuthToken()//获取用户token
        const userInfo = await getUserInfo(TOKEN)//获取用户信息
        console.log('获取用户信息成功:', userInfo);
        await createUserApi(userInfo)//创建用户
        await shortcutListAPI(userInfo.sub)//获取用户快捷键列表
        USERINFO = userInfo
        ISLOGIN = true
        console.log('登录成功');
    } catch (error) {
        console.log('loginHandler Error:', JSON.stringify(error));
    }
}


const logoutHanlder = async () => {
    await chrome.identity.removeCachedAuthToken({ token: TOKEN });
    USERINFO = {}
    ISLOGIN = false
    TOKEN = ''
    SHORTCUTLIST = []
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
    else if (type === LOGINSTATUS) {
        return { isLogin: ISLOGIN }
    }
    else if (type === SETSHORTCUTLIST) {
        SHORTCUTLIST = data
        return {}
    }
    else if (type === GETUSERINFO) {
        return { userInfo: USERINFO }
    }

    else if (type === UNKNOWN) {
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