var count = document.getElementById("count");

self.port.on("set", function(n) {
  count.textContent = n > 0 ? n : "...";
  count.style.display = n == 0 ? "none" : "block";
});
