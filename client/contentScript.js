//contentScript 在每个tab都会加载
console.log("contentScript loaded");


//常量
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"
const LOGINSTATUS = 'LOGINSTATUS'
const NOTLOGIN = 'NOTLOGIN'
const UNKNOWN = 'UNKNOWN'
const SETUSERINFO = 'SETUSERINFO'
const SETSHORTCUTLIST = 'SETSHORTCUTLIST'
//添加assistant-modal到document，作为APP的root
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "assistant-modal");
document.body.appendChild(modalDiv);



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const { type, data } = request;
    console.log('contentScript-收到消息:', request);


    if (type === NOTLOGIN) {
        alert('Please Login to ChatGPT-Assistant Extension')
    }

    else if (type === SETUSERINFO) {
        if (!window.CHATGPT_ASSISTANT) {
            window.CHATGPT_ASSISTANT = {}
        }
        window.CHATGPT_ASSISTANT.userInfo = data

    }
    else if (type === SETSHORTCUTLIST) {
        if (!window.CHATGPT_ASSISTANT) {
            window.CHATGPT_ASSISTANT = {}
        }
        window.CHATGPT_ASSISTANT.shortcutList = data

    }
    else if (type === UNKNOWN) {
        alert('UNKNOWN Type')
    }
    else if (type === "RELOAD") {
        location.reload()
    }
});





