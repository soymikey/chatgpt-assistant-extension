chrome.commands.onCommand.addListener(function (command) {
    console.log(`Command "${command}" triggered`);
    if (command === "show-modal") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['/static/js/main.min.js']
            });
        });
    }
});

