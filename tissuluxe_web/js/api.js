(() => {
  const tokenKey = "tlx_token";
  const userKey = "tlx_user";
  const sessionKey = "tlx_session_id";

  const sessionId = () => {
    let id = localStorage.getItem(sessionKey);
    if (!id) {
      id = `tlx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(sessionKey, id);
    }
    return id;
  };

  const headers = (isJson = true) => {
    const h = { "X-Session-Id": sessionId() };
    if (isJson) h["Content-Type"] = "application/json";
    const token = localStorage.getItem(tokenKey);
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...headers(!(options.body instanceof FormData)), ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({ success: false, message: "Réponse API invalide" }));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || "Erreur API");
    }
    return payload.data;
  }

  const money = (amount) => `${Number(amount || 0).toFixed(2)} MAD`;
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const asset = (url) => {
    if (!url) return "images/products/fabric-01.jpg";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_ORIGIN}${url}`;
    return url;
  };

  const notify = (message, type = "success") => {
    let toast = qs(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");
    clearTimeout(window.__tlxToast);
    window.__tlxToast = setTimeout(() => toast.classList.remove("show"), 2800);
  };

  const getToken = () => localStorage.getItem(tokenKey);
  const setToken = (token) => localStorage.setItem(tokenKey, token);
  const removeToken = () => localStorage.removeItem(tokenKey);

  window.TLX = {
    apiGet: (path) => apiRequest(path),
    apiPost: (path, data) => apiRequest(path, { method: "POST", body: data instanceof FormData ? data : JSON.stringify(data || {}) }),
    apiPut: (path, data) => apiRequest(path, { method: "PUT", body: JSON.stringify(data || {}) }),
    apiDelete: (path) => apiRequest(path, { method: "DELETE" }),
    tokenKey,
    userKey,
    sessionId,
    getToken,
    setToken,
    removeToken,
    money,
    qs,
    qsa,
    asset,
    notify,
    getUser: () => JSON.parse(localStorage.getItem(userKey) || "null"),
    setSession: (data) => {
      setToken(data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));
    },
    logout: () => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      location.href = "index.html";
    }
  };

  window.apiGet = window.TLX.apiGet;
  window.apiPost = window.TLX.apiPost;
  window.apiPut = window.TLX.apiPut;
  window.apiDelete = window.TLX.apiDelete;
  window.getToken = getToken;
  window.setToken = setToken;
  window.removeToken = removeToken;
})();
