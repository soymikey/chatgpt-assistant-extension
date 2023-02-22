

//当前tab加载modal
// 如果当前的App不存在就加载js，如果存在了就用display元素控制
function loadModal() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { msg: "isAppExist" }, (appExist) => {
            if (appExist) {
                chrome.tabs.sendMessage(tabs[0].id, { msg: "block" }, (response) => {
                    // console.log(response);
                });
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['/static/js/main.min.js']
                });
            }
        })
    });
}


//监听control+shift+Y 快捷键
chrome.commands.onCommand.addListener(function (command) {
    if (command === "show-modal") {
        loadModal()
    }
});


//添加右键菜单
chrome.contextMenus.create({
    id: "ChatGPT-Assistant",
    title: "ChatGPT Assistant",
    contexts: ["page", 'selection'],

});
//监听快捷键被点击
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "ChatGPT-Assistant") {
        loadModal()
    }
});


