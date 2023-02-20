document
    .getElementById("login-button")
    .addEventListener("click", function () {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            // Use the token to make Google API requests
            // ...

            alert(`谷歌登录token:${token}`);
        });
    });