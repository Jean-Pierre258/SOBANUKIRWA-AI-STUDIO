
window.API = {
  async call(action,payload={}) {
    const response = await fetch(
      window.APP_CONFIG.API_URL,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action,...payload})
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }
};
