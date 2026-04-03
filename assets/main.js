const THEME_KEY = "site_theme";

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved ? saved : "light";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function boldMyName(authors) {
  const name = "Khurram Ashfaq";
  if (!authors) return "";
  return authors.replaceAll(name, `<strong>${name}</strong>`);
}

function renderPublications(items) {
  const list = document.getElementById("pubList");
  list.innerHTML = "";

  for (const p of items) {
    const card = el("div", "pub");
    if (!p.image) card.classList.add("pub-noimg");

    if (p.image) {
      const media = el("div", "pub-media");
      const img = document.createElement("img");
      img.src = p.image;
      img.alt = p.title || "Paper figure";
      img.className = "pub-image";
      media.appendChild(img);
      card.appendChild(media);
    }

    const content = el("div", "pub-content");
    content.appendChild(el("div", "pub-title", p.title || "Untitled"));

    const authors = el("div", "pub-authors");
    authors.innerHTML = boldMyName(p.authors || "");
    content.appendChild(authors);

    const venueParts = [];
    if (p.venue) venueParts.push(p.venue);
    if (p.year) venueParts.push(String(p.year));
    content.appendChild(el("div", "pub-venue", venueParts.join(", ")));

    const links = el("div", "pub-links");
    const linkDefs = [
      ["Paper", p.paper],
      ["arXiv", p.arxiv],
      ["Code", p.code],
      ["Project", p.project],
      ["BibTeX", p.bibtex],
    ];

    for (const [label, href] of linkDefs) {
      if (!href) continue;
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = label;
      links.appendChild(a);
    }

    if (links.childElementCount > 0) content.appendChild(links);

    card.appendChild(content);
    list.appendChild(card);
  }
}

function applyPublicationFilters(allPubs) {
  const q = (document.getElementById("pubSearch").value || "").toLowerCase().trim();
  const type = document.getElementById("pubFilter").value;

  let filtered = allPubs;
  if (type !== "all") filtered = filtered.filter(p => (p.type || "").toLowerCase() === type);

  if (q.length > 0) {
    filtered = filtered.filter(p =>
      `${p.title || ""} ${p.venue || ""} ${p.year || ""} ${p.authors || ""}`.toLowerCase().includes(q)
    );
  }

  renderPublications(filtered);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
}

function renderNews(items) {
  const list = document.getElementById("newsList");
  list.innerHTML = "";

  for (const n of items) {
    const row = el("div", "news-item");
    row.appendChild(el("div", "news-date", n.date || ""));
    row.appendChild(el("div", "news-body", n.text || ""));
    list.appendChild(row);
  }
}

(async function init() {
  const theme = getTheme();
  setTheme(theme);
  updateThemeIcon(theme);

  document.getElementById("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    setTheme(next);
    updateThemeIcon(next);
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());

  let allPubs = [];
  try {
    allPubs = await loadJSON("data/publications.json");
    allPubs.sort((a, b) => (b.year || 0) - (a.year || 0));
    renderPublications(allPubs);
  } catch (e) {
    document.getElementById("pubList").textContent = "Add data/publications.json to show publications.";
  }

  try {
    const news = await loadJSON("data/news.json");
    renderNews(news);
  } catch (e) {
    document.getElementById("newsList").textContent = "Add data/news.json to show news.";
  }

  document.getElementById("pubSearch").addEventListener("input", () => applyPublicationFilters(allPubs));
  document.getElementById("pubFilter").addEventListener("change", () => applyPublicationFilters(allPubs));
})();
