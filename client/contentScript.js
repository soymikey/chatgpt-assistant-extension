//contentScript 在每个tab都会加载
console.log("contentScript loaded");


//常量
const NOTLOGIN = 'NOTLOGIN'

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

    else if (type === "RELOAD") {
        location.reload()
    }
    else {
        alert('UNKNOWN Type')
    }
});





