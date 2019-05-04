addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let newUrl = new URL(request.url);
  let env = "";
  if (newUrl.hostname == "azurenews.pl") {
    env = "prod";
  } else {
    env = newUrl.hostname.split(".")[0];
  }
  const env_settings = await ENVIRONMENT.get(env, "json");
  console.log(env_settings);
  if (/storage/.test(newUrl)) {
    newUrl.hostname = env_settings.storage;
    newUrl.pathname = newUrl.pathname.replace("/storage",
      "")
  } else if (/api/.test(newUrl)) {
    newUrl.hostname = env_settings.api;
  } else {
    newUrl.hostname = env_settings.spa;
  }
  return fetch(newUrl,
    {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
}