var githubDiffNav = {

  // init: add message listeners and call the appropriate function based on the request
  init : function() {
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {      
        if (request.action == "refresh") {
          githubDiffNav.refreshDiffEls();
        } else if (request.action == "highlightDiff") {
          githubDiffNav.highlightDiff(request.el);
        } else if (request.action == "isInPreviewTab") {
          sendResponse({isInPreviewTab : githubDiffNav.isInPreviewTab()});
        } else if (request.action == "isDiffOutdated") {
          sendResponse({isDiffOutdated : githubDiffNav.isDiffOutdated(request.diffIds)});
        }        
      }
    );
  },
  
  // refreshDiffEls: look at the page's DOM and find all the elements that are changed
  refreshDiffEls : function() {
    // find the elements depending on the file type
    if (document.getElementsByClassName("markdown-body").length > 0) {  // diff view for markdown files
      var githubDiffEls = document.querySelectorAll(".prose-diff .markdown-body>ins, .prose-diff .markdown-body>del, .rich-diff-level-zero.changed");
      var doctype = "Markdown";
    } else {    // any non-markdown file
      // get all edited sections by first getting all editted lines and then
      // only keeping the first line from a section of consecutive lines
      var githubDiffCells = document.querySelectorAll("td.blob-num-addition, td.blob-num-deletion");
      var githubDiffEls = [];
      var lastRow = null;
      for (var i = 0; i < githubDiffCells.length; i++) {
        var el = githubDiffCells[i];
        var rowEl = el.parentNode;
        if (i == 0 || (rowEl != lastRow && rowEl.previousElementSibling != lastRow)) {
          githubDiffEls.push(rowEl);
        }  
        lastRow = rowEl;
      }
      var doctype = "Non-markdown";
    }
    
    // Since we cannot pass DOM elements using JSON, we need to pass a reference to them.
    // Make sure every element has an ID (create a random one if it doesn't), and send those ids
    var githubDiffIds = [];
    for (var i = 0; i < githubDiffEls.length; i++) {
      var el = githubDiffEls[i];
      if(!el.id) {
        el.id = "github-diff-el_" + Math.floor(Math.random() * 10000000000);
      }
      githubDiffIds.push(el.id);
    }

    chrome.runtime.sendMessage({action: "refreshed",
                  diffIds: githubDiffIds,
                  doctype: doctype});
  },

  // highlightDiff: given a DOM element, scroll it into the view pane
  highlightDiff : function(el) {
    var el = document.getElementById(el);
    el.scrollIntoView();
  },

  // isInPreviewTab: determine if the user is currently on the Preview tab or not
  isInPreviewTab : function() {
    return document.getElementsByClassName("tabnav-tab selected preview").length > 0;
  },
  
  // isDiffOutdated: determine if the diffs in the Preview tab are outdated
  // (outdated means that the user switched tabs and now the DOM has been rewritten
  // or that there were previously no changes)
  isDiffOutdated : function(diffIds) {
    if (diffIds.length == 0) return true;
    
    for (var i = 0; i < diffIds.length; i++) {
      var el = diffIds[i];
      if (!document.getElementById(el)) {
        return true;
      }
    }
    return false;
  }
}

githubDiffNav.init();
