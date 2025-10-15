// diary-loader.js
// Enhanced DOM renderer with routing: loads entries from journal.json
// and handles single-page navigation

// Utility to create DOM elements with attributes
const createElement = (tag, attrs = {}, ...children) => {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  return element;
};

async function loadJournal() {
  try {
    const res = await fetch("/src/data/journal.json");
    if (!res.ok) throw new Error("Không thể tải dữ liệu: " + res.status);
    const entries = await res.json();

    const entriesRoot = document.getElementById("entries");
    if (!entriesRoot) return;

    // Check if we're viewing a specific chapter
    const hash = window.location.hash;
    if (hash && hash.startsWith("#v")) {
      const chapterId = hash.substring(1);
      const chapter = entries.find((e) => e.id === chapterId);
      if (chapter) {
        renderChapterDetail(chapter, entries);
      } else {
        renderChapterList(entries);
      }
    } else {
      renderChapterList(entries);
    }

    // Handle navigation
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash;
      if (newHash && newHash.startsWith("#v")) {
        const chapterId = newHash.substring(1);
        const chapter = entries.find((e) => e.id === chapterId);
        if (chapter) {
          renderChapterDetail(chapter, entries);
        }
      } else {
        renderChapterList(entries);
      }
    });
  } catch (err) {
    console.error(err);
    const entriesRoot = document.getElementById("entries");
    if (entriesRoot)
      entriesRoot.innerHTML = `<p class="error">Lỗi khi tải nhật ký: ${err.message}</p>`;
  }
}

// Render the chapter list (home page)
function renderChapterList(chapters) {
  const entriesRoot = document.getElementById("entries");
  entriesRoot.innerHTML = "";

  const list = createElement("div", { className: "chapter-list" });

  chapters.forEach((chapter) => {
    const card = createElement(
      "a",
      {
        className: "chapter-card",
        href: `#${chapter.id}`,
      },
      createElement("div", { className: "chapter-meta" }, chapter.date),
      createElement("h2", {}, `${chapter.title}`),
      createElement("p", { className: "chapter-preview" }, chapter.content)
    );

    list.appendChild(card);
  });

  entriesRoot.appendChild(list);
}

// Render a single chapter's detail page
function renderChapterDetail(chapter, allChapters) {
  const entriesRoot = document.getElementById("entries");
  entriesRoot.innerHTML = "";

  // Back button
  const backLink = createElement(
    "a",
    {
      className: "back-to-home",
      href: "#",
    },
    "← Trở về trang chủ"
  );

  // Chapter content
  const detail = createElement(
    "article",
    { className: "chapter-detail" },
    createElement(
      "header",
      { className: "chapter-header" },
      createElement("h1", {}, chapter.title),
      createElement("div", { className: "chapter-meta" }, chapter.date)
    ),
    createElement("div", { className: "chapter-content" }, chapter.content),
    createElement(
      "div",
      { className: "media-grid" },
      createElement("div", { className: "map-container" }, "Bản đồ hải trình"),
      createElement(
        "div",
        { className: "sketch-container" },
        "Phác thảo minh họa"
      ),
      createElement("div", { className: "analysis-box" }, chapter.analysis)
    )
  );

  // Navigation between chapters
  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id);
  const nav = createElement("div", { className: "chapter-navigation" });

  if (currentIndex > 0) {
    nav.appendChild(
      createElement(
        "a",
        {
          className: "nav-prev",
          href: `#${allChapters[currentIndex - 1].id}`,
        },
        `← ${allChapters[currentIndex - 1].title}`
      )
    );
  }

  if (currentIndex < allChapters.length - 1) {
    nav.appendChild(
      createElement(
        "a",
        {
          className: "nav-next",
          href: `#${allChapters[currentIndex + 1].id}`,
        },
        `${allChapters[currentIndex + 1].title} →`
      )
    );
  }

  entriesRoot.appendChild(backLink);
  entriesRoot.appendChild(detail);
  entriesRoot.appendChild(nav);
}

// Auto-run on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadJournal);
} else {
  loadJournal();
}

export default loadJournal;
