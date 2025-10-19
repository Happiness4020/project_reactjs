function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function loadVoyage() {
  const id = getQueryParam("v");
  const root = document.getElementById("voyage-root");
  if (!root) {
    // If the expected root container doesn't exist, abort early to avoid
    // attempting to write into a null element (this happens on some pages).
    console.warn("voyage-loader: #voyage-root not found, aborting loadVoyage");
    return;
  }
  // If there's no query param `v`, do nothing and keep the sample content
  if (!id) return;

  // If dynamic rendering is requested, hide the sample content/loading
  // and render into the existing #voyage-content so the page keeps its CSS
  const loading = document.getElementById("loading-state");
  const voyageContent = document.getElementById("voyage-content");
  if (loading) loading.style.display = "none";
  if (voyageContent) voyageContent.style.display = "none";

  try {
    // Use a relative path (no leading slash) so the request works when the
    // site is hosted under a repo subpath on GitHub Pages (e.g.
    // https://username.github.io/repo-name/). A leading slash requests the
    // domain root which will 404 for repo pages.
    const res = await fetch("src/data/journal.json");
    if (!res.ok) throw new Error("Không thể tải dữ liệu");
    const chapters = await res.json();

    // Find chapter: accept numeric (1) or full id ('v1')
    let chapter = null;
    if (/^\d+$/.test(id)) {
      // try match by number or by id ending
      chapter = chapters.find(
        (c) => c.number === Number(id) || String(c.id).endsWith(String(id))
      );
    } else {
      chapter = chapters.find((c) => c.id === id || c.id === `v${id}`);
    }

    if (!chapter) {
      root.innerHTML =
        '<div class="alert alert-warning">Không tìm thấy chuyến đi.</div>';
      return;
    }

    document.title = `${chapter.title} — Nhật Ký Hải Trình`;

    const rendered = `
      <div class="voyage-header">
        <span class="voyage-badge"><i class="fas fa-anchor me-2"></i>Chuyến đi số ${
          chapter.number || ""
        }</span>
        <h1 class="voyage-title">${chapter.title}</h1>
        <div class="voyage-meta">
          <div class="meta-item"><i class="fas fa-calendar-alt"></i><div><strong>Ngày:</strong> ${
            chapter.date
          }</div></div>
        </div>
      </div>

      <div class="chapter-section">
        <div class="chapter-header">
          <div class="chapter-number">${chapter.number || ""}</div>
          <h2 class="chapter-title">${chapter.title}</h2>
          <div class="chapter-meta">
            <span class="meta-item"><i class="fas fa-calendar-alt"></i><span>${
              chapter.date
            }</span></span>
          </div>
        </div>
        <div class="chapter-content">${chapter.content}</div>
        <div class="media-grid">
          <div class="media-card"><i class="fas fa-map"></i><h6>Bản đồ tuyến đường</h6><p>${
            chapter.mapTitle || "Bản đồ (placeholder)"
          }</p></div>
          <div class="media-card"><i class="fas fa-image"></i><h6>Hình minh họa</h6><p>${
            chapter.sketchTitle || "Hình minh họa (placeholder)"
          }</p></div>
        </div>
        <div class="analysis-box"><h5><i class="fas fa-lightbulb"></i> Phân tích</h5><p>${
          chapter.analysis
        }</p></div>
      </div>
    `;

    if (voyageContent) {
      voyageContent.innerHTML = rendered;
      voyageContent.style.display = "block";
    } else {
      root.innerHTML = rendered;
    }

    // scroll to top so user sees content immediately
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    root.innerHTML = `<div class="alert alert-danger">Lỗi: ${err.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadVoyage);
export default loadVoyage;
