var token;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.token === "request") {
            sendResponse({
                "token": token
            });
        } else if (request.token === "popup") {
            var views = chrome.extension.getViews({
                type: "popup"
            });
            sendResponse({
                "popup": views
            });
        } else if (request.token) {
            token = request.token
        }
    });
