/**
 * Dean Attali
 * December 2014
 */

var githubDiffPopup = {

	// init: when the user clicks on the extension icon, initialize the UI and add listeners on buttons
	init : function() {
		githubDiffPopup.initUi();
		document.getElementById("github-diff-ext-refresh").addEventListener("click", githubDiffPopup.refreshClick);
		document.getElementById("github-diff-ext-prev").addEventListener("click", githubDiffPopup.prevClick);
		document.getElementById("github-diff-ext-next").addEventListener("click", githubDiffPopup.nextClick);
	},

	// initUi: initialize the UI from opening the extension
	initUi : function() {
		githubDiffPopup.refreshUiInit(false);
	},
	
	// refreshClick: initialize the UI from clicking on Refresh
	refreshClick : function() {
		githubDiffPopup.refreshUiInit(true);
	},
	
	// refreshUiInit: refresh the UI
	/* This function is a little messy and definitely not coded in a nice way,
	   but it's 4am and I worked on it for 2 days straight, so screw it :)
	   Logic: First, make sure the user is in the Preview tab. If not, show a message and quit.
	   If the Refresh button was clicked, then perform a refresh right away.
	   If we're here trying to do an automatic refresh because the extension was just opened,
	   first try to see if a refresh is necessary: if there were previously no changes or if the
	   previous changes are outdated (the DOM has been rewritten since), then perform an update.
	*/
	refreshUiInit : function(force) {
		var cb = function(bg) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,
										{action: "isInPreviewTab"},
										function(response) {
											if (!response.isInPreviewTab) {
												githubDiffPopup.notInPreviewTabMsg();
											} else {
												if (force) {
													chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
														chrome.tabs.sendMessage(tabs[0].id, {action: "refresh"});
													});
												} else {
													chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
														chrome.tabs.sendMessage(tabs[0].id,
															{action: "isDiffOutdated", diffIds: bg.githubDiffBackground.getDiffIds()},
															function(response) {
																if (response.isDiffOutdated) {
																	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
																		chrome.tabs.sendMessage(tabs[0].id, {action: "refresh"});
																	});
																} else {
																	githubDiffPopup.refreshView(true);
																}
														});
													});					
												}
											}
										});
			});
		};
		
		chrome.runtime.getBackgroundPage(cb);	
	},
	
	prevClick : function() {
		var cb = function(bg) {
			bg.githubDiffBackground.prevClick();
		};
		chrome.runtime.getBackgroundPage(cb);
	},

	nextClick : function() {
		var cb = function(bg) {
			bg.githubDiffBackground.nextClick();
		};
		chrome.runtime.getBackgroundPage(cb);
	},

	refreshNav : function() {
		githubDiffPopup.refreshNavCur();
		githubDiffPopup.refreshNavTotal();
	},

	refreshNavCur : function() {
		var cb = function(bg) {
			var num = bg.githubDiffBackground.getCurIdx();
			document.getElementById("github-diff-ext-cur").innerHTML = num;
		};
		chrome.runtime.getBackgroundPage(cb);
	},

	refreshNavTotal : function() {
		var cb = function(bg) {
			var num = bg.githubDiffBackground.getTotal();
			document.getElementById("github-diff-ext-total").innerHTML = num;
		};
	   chrome.runtime.getBackgroundPage(cb);
	},

	notInPreviewTabMsg : function() {
		document.getElementById("github-diff-ext-nav").style.display = 'none';
		document.getElementById("github-diff-ext-msg").innerHTML = "It doesn't seem like you're in the \"Preview changes\" tab.";
	},
	
	refreshTitle : function() {
	   var cb = function(bg) {
		   var doctype = bg.githubDiffBackground.getDoctype();
		   var total = bg.githubDiffBackground.getTotal();
		   
		   if (total == 0) {
				document.getElementById("github-diff-ext-nav").style.display = 'none';
				document.getElementById("github-diff-ext-msg").innerHTML = "No changes found in this GitHub edit.";
				return;
		   }
		   
		   document.getElementById("github-diff-ext-nav").style.display = 'block';
		   document.getElementById("github-diff-ext-msg").innerHTML = doctype + " file";
		};
		chrome.runtime.getBackgroundPage(cb);
	},
	
	refreshView : function(complete) {
		githubDiffPopup.refreshNav();
		if (typeof(complete) !== 'undefined' && complete) {
			githubDiffPopup.refreshTitle();
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	githubDiffPopup.init();
});