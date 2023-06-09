



console.log("popup loaded");
//常量
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"


//工具类函数
async function sendToBackground(payload) {
    const { type = 'UNKNOWN', data = {} } = payload
    return await chrome.runtime.sendMessage({ type, data });
}

const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};

//元素
const loginButton = document.getElementsByClassName('login-button')[0]
const userInfoElement = document.getElementsByClassName('userinfo-wrapper')[0]
const userInfoNameElement = document.getElementsByClassName('userinfo-name')[0]
const userInfoEmailElement = document.getElementsByClassName('userinfo-email')[0]
const loadingElement = document.getElementsByClassName('loading')[0]



const loginState = async () => {
    const { USERINFO } = await chrome.storage.sync.get("USERINFO")
    userInfoNameElement.innerHTML = USERINFO.name
    userInfoEmailElement.innerHTML = USERINFO.email
    loginButton.innerHTML = 'Logout'
    loginButton.classList.add('logout')
}
const logoutState = () => {
    userInfoNameElement.innerHTML = ''
    userInfoEmailElement.innerHTML = ''
    loginButton.innerHTML = 'Login with Google'
    loginButton.classList.remove('logout')
}

//监听登录
loginButton.addEventListener("click", async () => {
    const { ISLOGIN } = await chrome.storage.sync.get("ISLOGIN")
    if (ISLOGIN) {
        await sendToBackground({ type: LOGOUT })
        await logoutState()
    } else {
        loadingElement.classList.add("visible")
        await sendToBackground({ type: LOGIN })
        loginState()
        loadingElement.classList.remove("visible")

    }
});



//初始化popup页面状态
async function init() {
    const { ISLOGIN } = await chrome.storage.sync.get("ISLOGIN")
    loginButton.innerHTML = ISLOGIN ? 'Logout' : 'Login with Google'
    if (ISLOGIN) {
        loginState()
    } else {
        await logoutState()
    }
}

init()





//---------------修改快捷键
// const changeShortcutButton = document.getElementsByClassName('change-shortcut')[0]
// changeShortcutButton.addEventListener("click", async () => {
//     chrome.tabs.create({ url: "chrome://extensions/shortcuts" });

// });

//---------------和content script通信
// document.querySelector("#reload").addEventListener("click", async () => {
//     const tab = await getCurrentTab();
//     await chrome.tabs.sendMessage(tab.id, { type: 'RELOAD' });
// });