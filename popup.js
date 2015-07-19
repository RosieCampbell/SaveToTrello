chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        message: "authorise"
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.boardList) {
            var list = document.getElementById("list");
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
        }
        if (request.boardList.length === 0) {
            var warning = document.createElement("p");
            warning.innerText = "You have no starred boards! Please go to Trello and star some, then try again. You'll see them listed here and be able to choose one.";
            list.appendChild(warning);
        }
        for (var i = 0; i < request.boardList.length; i++) {

            var li = document.createElement("button");
            li.innerText = request.boardList[i].name;
            li.boardId = request.boardList[i].id;

            li.addEventListener('click', function() {
                var that = this;
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        message: "board",
                        id: that.boardId
                    });
                });
                window.close();
            });

            list.appendChild(li);

        };
    });
