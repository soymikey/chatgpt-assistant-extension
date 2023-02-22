//当前tab加载modal
function loadModal() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['/static/js/main.min.js']
        });
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
    id: "myContextMenu",
    title: "My Context Menu Item",
    contexts: ["page", 'selection'],

});
//监听快捷键被点击
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "myContextMenu") {
        loadModal()
        // 处理右键菜单点击事件
        console.log('right menu clicked');
    }
});


