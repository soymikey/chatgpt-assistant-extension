
//谷歌登录
// document
//     .getElementById("login-button")
//     .addEventListener("click", function () {
//         chrome.identity.getAuthToken({ interactive: true }, function (token) {
//             // Use the token to make Google API requests
//             // ...

//             alert(`谷歌登录token:${token}`);
//         });
//     });


//=========================================================
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
//=========================================================
const loginButton = document.getElementsByClassName('login-button')[0]
const changeShortcutButton = document.getElementsByClassName('change-shortcut')[0]

async function init() {
    const isLogin = await chrome.runtime.sendMessage({ type: "LOGINSTATUS" });
    loginButton.innerHTML = isLogin ? 'Logout' : 'Login with Google'
}

//和background通信-登录
loginButton.addEventListener("click", async () => {
    const isLogin = await sendToBackground({ type: "LOGINSTATUS" })
    if (isLogin) {
        await sendToBackground({ type: "LOGOUT" })
        loginButton.innerHTML = 'Login with Google'
        loginButton.classList.remove('logout')
    } else {
        await sendToBackground({ type: "LOGIN" })
        loginButton.innerHTML = 'Logout'
        loginButton.classList.add('logout')

    }
});

changeShortcutButton.addEventListener("click", async () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });

});

//和content script通信
// document.querySelector("#reload").addEventListener("click", async () => {
//     const tab = await getCurrentTab();
//     await chrome.tabs.sendMessage(tab.id, { type: 'RELOAD' });
// });


init()


