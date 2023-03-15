//contentScript 在每个tab都会加载
console.log("contentScript loaded");


//常量
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"
const LOGINSTATUS = 'LOGINSTATUS'
const NOTLOGIN = 'NOTLOGIN'
const UNKNOWN = 'UNKNOWN'

//添加assistant-modal到document，作为APP的root
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "assistant-modal");
document.body.appendChild(modalDiv);




chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const { type } = request;
    console.log('contentScript-收到消息:', request);


    if (type === NOTLOGIN) {
        alert('Please Login to ChatGPT-Assistant Extension')
    }

    else if (type === UNKNOWN) {
        alert('UNKNOWN Type')
    }
    else if (type === "RELOAD") {
        location.reload()
    }
});





