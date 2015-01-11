var githubDiffBackground = {

  curIdx : 0,
  total : 0,
  diffIds : [],
  doctype : "",  

  // init: add listeners
  init : function() {
    chrome.runtime.onInstalled.addListener(function() {
      // Replace all rules ...
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      // With a new rule ...
      chrome.declarativeContent.onPageChanged.addRules([
        {
        // That fires when a page's URL is in a github edit page
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: '.*/github.com/.*/edit/.*' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
        }
      ]);
      });
    });

    chrome.runtime.onMessage.addListener(
      function(request, sender) {
        // when the extension refreshed, save all the data and refresh the UI
        if (request.action == "refreshed") {
          githubDiffBackground.diffIds = request.diffIds;
          githubDiffBackground.curIdx = 0;
          githubDiffBackground.total = request.diffIds.length;
          githubDiffBackground.doctype = request.doctype;
          
          githubDiffBackground.refreshView(true);
        }
      }
    )    
  },
  
  getCurIdx : function() {
    return githubDiffBackground.curIdx;
  },

  getTotal : function() {
    return githubDiffBackground.total;
  },

  getDoctype : function() {
    return githubDiffBackground.doctype;
  },
  
  getDiffIds : function() {
    return githubDiffBackground.diffIds;
  },
  
  prevClick : function() {
    githubDiffBackground.curIdx--;
    if (githubDiffBackground.curIdx < 1) {
      githubDiffBackground.curIdx = githubDiffBackground.total;
    }
    githubDiffBackground.refreshView();
    githubDiffBackground.highlightDiff();
  },

  nextClick : function() {
    githubDiffBackground.curIdx++;
    if (githubDiffBackground.curIdx > githubDiffBackground.total) {
      githubDiffBackground.curIdx = 1;
    }
    githubDiffBackground.highlightDiff();
    githubDiffBackground.refreshView();
  },

  refreshView : function(complete) {
    var viewTabUrl = chrome.extension.getURL('popup.html');
    var views = chrome.extension.getViews({type: "popup"});
    var view = views[0];
    view.githubDiffPopup.refreshView(complete);
  },

  highlightDiff : function() {
    var curId = githubDiffBackground.diffIds[githubDiffBackground.curIdx - 1];
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id,
                             {action: "highlightDiff", el: curId});
    });
  }
}

githubDiffBackground.init();
