var token;
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        token = request.greeting;
        savePage(token);
    });

function savePage(token) {
    Trello.setKey("cdd325be6c9a1d33196a11f7a2d1f5d3");
    Trello.setToken(token);
    Trello.members.get("me", function() {
        Trello.post("cards", {
            name: $('meta[property="og:title"]').attr('content') || document.getElementsByTagName("title").innerText,
            desc: $('meta[property="og:description"]').attr('content') || "",
            urlSource: document.URL,
            idList: "558d54841eafb3823d05bc40"
        });
    }, function() {
        console.log("invalid token");
        localStorage.removeItem('trello_token')
        HashSearch.remove("token");
        Trello.deauthorize();
        login();
    })
}

function login() {
    if (HashSearch.keyExists('token')) {
        authorizeWithToken(token);
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
            token = localStorage.trello_token
            chrome.runtime.sendMessage({
                greeting: token
            }, function(response) {});
            savePage(token);
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
        success: function() {
            // Can't do nothing, we've left the page
        },
        error: function() {
            alert("Failed to authorize with Trello.")
        }
    });
}

if (HashSearch.keyExists('token')) {
    authorizeWithToken();
}
