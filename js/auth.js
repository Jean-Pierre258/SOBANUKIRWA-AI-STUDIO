
window.Auth = {
  token() {
    return sessionStorage.getItem("sct_token") || "";
  },

  async login(email,password) {
    const result = await API.call("login",{email,password});

    sessionStorage.setItem("sct_token",result.token);
    sessionStorage.setItem("sct_user",JSON.stringify(result.user));

    return result.user;
  },

  async register(name,email,password) {
    return API.call("register",{name,email,password});
  },

  async me() {
    const result = await API.call("me",{token:this.token()});
    sessionStorage.setItem("sct_user",JSON.stringify(result.user));
    return result.user;
  },

  user() {
    try {
      return JSON.parse(sessionStorage.getItem("sct_user") || "null");
    } catch(e) {
      return null;
    }
  },

  async logout() {
    try {
      await API.call("logout",{token:this.token()});
    } catch(e) {}

    sessionStorage.clear();
    location.href="login.html";
  },

  requireLogin() {
    if (!this.token()) location.href="login.html";
  }
};
