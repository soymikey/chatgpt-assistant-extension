

let count = 1
count += 1
console.log("I am contentscript:" + count);

//添加assistant-modal到document
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "assistant-modal");
document.body.appendChild(modalDiv);




chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('contentScript收到消息', request);
    if (request.msg === "block") {
        sendResponse(true);
        modalDiv.style.display = request.msg
    }
    if (request.msg === "isAppExist") {
        const isAppExist = !!document.getElementById('chatgpt-assistant-app')
        sendResponse(isAppExist)
    }
});





