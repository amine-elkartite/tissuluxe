(() => {
  const { apiGet, qs } = window.TLX;

  const fillCategorySelects = async () => {
    const selects = document.querySelectorAll("select[name='category']");
    if (!selects.length) return;
    const selectedCategory = new URLSearchParams(location.search).get("category") || "";
    try {
      const categories = await apiGet("/categories");
      selects.forEach((select) => {
        if (select.dataset.filled) return;
        const current = select.value;
        select.insertAdjacentHTML("beforeend", categories.map((c) => `<option value="${c.slug}">${c.name}</option>`).join(""));
        select.value = current || selectedCategory;
        select.dataset.filled = "true";
      });
    } catch (_err) {}
  };

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-site-search], .search-bar");
    if (!form) return;
    const data = new FormData(form);
    const params = new URLSearchParams();
    ["search", "category"].forEach((key) => {
      const value = data.get(key);
      if (value) params.set(key, value);
    });
    if (params.toString()) {
      event.preventDefault();
      location.href = `liste-produits.html?${params.toString()}`;
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    fillCategorySelects();
    const input = qs(".search-bar input[name='search']");
    const search = new URLSearchParams(location.search).get("search");
    if (input && search) input.value = search;
  });
})();
