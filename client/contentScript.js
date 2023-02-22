//contentScript 在每个tab都会加载
console.log("contentScript loaded");

//添加assistant-modal到document，作为APP的root
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "assistant-modal");
document.body.appendChild(modalDiv);




chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('contentScript收到消息', request);
    if (request.type === "SETTOWINDOW") {
        const data = request.data
        for (const key of Object.keys(data)) {
            window[key] = data[key]
        }
    }
    else if (request.type === "RELOAD") {
        location.reload()
    }
    else if (request.type === "NOTLOGIN") {
        alert('Please Login to ChatGPT-Assistant Extension')
    }

    else if (request.type === "UNKNOWN") {
        alert('UNKNOWN Type')
    }
});





