addEventListener("fetch", event => {
    let newUrl = new URL(event.request.url);
    if(/storage/.test(newUrl))
    {
    newUrl.hostname = "devnewssa.table.core.windows.net";
    newUrl.pathname = newUrl.pathname.replace("/storage",
        "")
    event.respondWith(fetch(newUrl,
        {
      method: event.request.method,
      headers: event.request.headers
        }));
    } else if(/api/.test(newUrl))  {
  newUrl.hostname = "dev-news-functions.azurewebsites.net";
    event.respondWith(fetch(newUrl,
        {
      method: event.request.method,
      headers: event.request.headers
        }));
    } else {
  newUrl.hostname = "devnewssa.z6.web.core.windows.net";
    event.respondWith(fetch(newUrl,
        {
      method: event.request.method,
      headers: event.request.headers
        }));
    }
});