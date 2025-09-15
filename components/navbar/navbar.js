var urlpath = window.location.pathname;
var urlSegment = urlpath.split("/")[1]; // Get the first path segment

var activetabset = setInterval(() => {
    // Try to find a link whose href starts with the same segment
    var links = document.querySelectorAll("#navbar nav a");
    links.forEach(link => {
        var linkSegment = link.getAttribute("href").replace(/^\/+|\/+$/g, "").split("/")[0];
        if (linkSegment === urlSegment) {
            link.classList.add("active");
            clearInterval(activetabset);
        }
    });
}, 100);
