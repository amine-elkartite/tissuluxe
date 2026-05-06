(() => {
  const { qs, apiPost, setSession, notify, getUser } = window.TLX || {};

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-login-form], [data-register-form]");
    if (!form) return;
    event.preventDefault();
    const submit = form.querySelector("button[type='submit'], button:not([type])");
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = "Veuillez patienter...";
      }
      const result = await apiPost(form.matches("[data-register-form]") ? "/auth/register" : "/auth/login", data);
      setSession(result);
      notify("Bienvenue chez TissuLuxe");
      location.href = result.user.role === "admin" ? "../admin/dashboard.html" : "profil.html";
    } catch (err) {
      notify(err.message, "error");
      if (submit) {
        submit.disabled = false;
        submit.textContent = submit.dataset.originalText || "Réessayer";
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-logout]")) window.TLX.logout();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();
    const account = qs("[data-account-label]");
    const accountKicker = qs("[data-account-kicker]");
    const accountLink = qs("[data-account-link]");
    if (account) account.textContent = user ? `Bonjour, ${user.first_name}` : "Mon compte";
    if (accountKicker) accountKicker.textContent = user ? "Mon compte" : "Se connecter";
    if (accountLink && user) accountLink.href = "profil.html";
  });
})();
