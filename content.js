$(document).ready(function() {
    var dialog = document.createElement("div");
    var dialogContent = document.createElement("div");
    dialog.setAttribute("id", "dialog");
    dialog.style.width = '250px';
    dialog.style.backgroundColor = 'white'
    dialog.style.padding = "10px";
    dialog.style.textAlign = 'center';
    dialog.style.border = '2px solid black';
    document.getElementsByTagName("body")[0].appendChild(dialog);
    $('#dialog').popup({});

});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "board") {
            console.log(request)
            getBoardLists(request.id);

        } else {
            savePage();
        }

    });

function getBoardLists(board) {
    Trello.boards.get(board + "/lists", function(data) {
        var listId = data[0].id;
        Trello.post("cards", {
            name: $('meta[property="og:title"]').attr('content') || document.getElementsByTagName("title")[0].innerText,
            desc: $('meta[property="og:description"]').attr('content') || "",
            urlSource: document.URL,
            idList: listId,
            pos: "top"
        }, function() {}, function() {
            alert("Error posting to Trello");
        });
    }, function() {
        alert("Error retrieving Trello lists");
    })
}

function savePage() {
    Trello.setKey("cdd325be6c9a1d33196a11f7a2d1f5d3");
    chrome.runtime.sendMessage({
        "token": "request"
    }, function(response) {
        Trello.setToken(response.token);
        Trello.get("members/me/boards", function(boards) {
            var boardList = [];
            for (var i = 0; i < boards.length; i++) {
                if (boards[i].starred) {
                    boardList.push({
                        'name': boards[i].name,
                        'id': boards[i].id
                    })
                }
            };

            chrome.runtime.sendMessage({
                'boardList': boardList
            })
            chrome.runtime.sendMessage({
                'token': "popup"
            }, function(response) {
                if (!response.popup.length) {
                    if (boardList.length === 0) {
                        document.getElementById('dialog').innerText = "You have no starred boards! Please go to Trello and star some, then try again. You'll see them listed here and be able to choose one.";
                    } else {
                        document.getElementById('dialog').innerText = "Please select from your starred boards (the card will appear at the top of the first list)";
                        document.getElementById('dialog').style.textAlign = 'center';
                        for (var i = 0; i < boardList.length; i++) {

                            var li = document.createElement("button");
                            li.innerText = boardList[i].name;
                            li.style.padding = "12px 24px";
                            li.style.margin = "12px auto";
                            li.style.width = '50%';
                            li.boardId = boardList[i].id;
                            li.style.display = 'block';
                            li.addEventListener('click', function() {

                                getBoardLists(this.boardId);

                                $('#dialog').popup('hide');
                            });

                            document.getElementById('dialog').appendChild(li);

                        };
                    }
                    $('#dialog').popup('show');

                }


            });

        }, function() {
            localStorage.removeItem('trello_token');
            HashSearch.remove("token");
            Trello.deauthorize();
            login();
        });
    });

}

function login() {
    if (HashSearch.keyExists('token')) {
        authorizeWithToken();
    } else {
        authorizeBeforeToken();
    }
}

function authorizeWithToken() {
    Trello.authorize({
        name: "Save to Trello",
        expiration: "never",
        interactive: false,
        scope: {
            read: true,
            write: true
        },
        success: function() {
            Trello.setToken(localStorage.trello_token);
            chrome.runtime.sendMessage({
                token: localStorage.trello_token
            }, function(response) {});
            savePage();
        },
        error: function() {
            alert("Failed to authorize with Trello.")
        }
    });
}

function authorizeBeforeToken() {
    Trello.authorize({
        name: "Save to Trello",
        type: "redirect",
        expiration: "never",
        interactive: true,
        scope: {
            read: true,
            write: true
        },
        success: function() {},
        error: function() {
            alert("Failed to authorize with Trello.")
        }
    });
}

if (HashSearch.keyExists('token')) {

    authorizeWithToken();
}
