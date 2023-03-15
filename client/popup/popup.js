



console.log("popup loaded");
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


//监听登录
loginButton.addEventListener("click", async () => {
    const { isLogin } = await sendToBackground({ type: "LOGINSTATUS" })
    console.log('登录状态:', isLogin);
    if (isLogin) {
        await sendToBackground({ type: "LOGOUT" })
        userInfoElement.innerHTML = ''
        loginButton.innerHTML = 'Login with Google'
        loginButton.classList.remove('logout')
    } else {
        const loginResult = await sendToBackground({ type: "LOGIN" })
        userInfoElement.innerHTML = loginResult.userInfo.name
        loginButton.innerHTML = 'Logout'
        loginButton.classList.add('logout')
    }
});



//初始化popup页面状态
async function init() {
    const { isLogin, userInfo } = await sendToBackground({ type: "LOGINSTATUS" });
    loginButton.innerHTML = isLogin ? 'Logout' : 'Login with Google'
    if (isLogin) {
        userInfoElement.innerHTML = userInfo.name
        loginButton.innerHTML = 'Logout'
        loginButton.classList.add('logout')
    } else {
        userInfoElement.innerHTML = ''
        loginButton.innerHTML = 'Login with Google'
        loginButton.classList.remove('logout')
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