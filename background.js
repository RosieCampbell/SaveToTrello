// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
var token;
chrome.browserAction.onClicked.addListener(function(tab) {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            greeting: token
        }, function(response) {
            console.log(response.farewell);
        });
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        token = request.greeting;
    });
