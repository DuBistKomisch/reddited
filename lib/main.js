var self = require("sdk/self");

var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var reqs = require("sdk/request");

var sp = require('sdk/simple-prefs');
var ss = require("sdk/simple-storage");
if (!ss.storage.pages)
  ss.storage.pages = {};

var widget = widgets.Widget({
  id: "reddited-button",
  label: "Reddited",
  width: 24,
  contentURL: self.data.url("button.html"),
  contentScriptFile: self.data.url("button.js"),
  onClick: function () {
    tabs.open("http://www.reddit.com/api/info?url=" + tabs.activeTab.url);
  }
});

tabs.on("ready", function(tab) {
  if (tab.url in ss.storage.pages && Date.now() - ss.storage.pages[tab.url][1] < sp.prefs['timeout'] * 60000)
    // use cache
    return;

  if (tab.url.substr(0, 4) != "http")
  {
    // ignore special pages, e.g. about:blank, about:newtab
    widget.port.emit("set", 0);
    return;
  }

  // invalidate
  ss.storage.pages[tab.url] = [-1, Date.now()];
  widget.port.emit("set", -1);

  // fetch
  var req = reqs.Request({
    url: "http://www.reddit.com/api/info.json?url=" + tab.url,
    onComplete: function (response) {
      // update
      ss.storage.pages[tab.url] = [response.json.data.children.length, Date.now()];
      widget.port.emit("set", response.json.data.children.length);
    }
  });
  req.get();
});

tabs.on("activate", function(tab) {
  widget.port.emit("set", tab.url in ss.storage.pages ? ss.storage.pages[tab.url][0] : 0);
});
