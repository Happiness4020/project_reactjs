// src/voyage-loader.js

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function loadVoyage() {
  const id = getQueryParam("v");
  const root = document.getElementById("voyage-root");
  const loading = document.getElementById("loading-state");

  if (!root || !loading) {
    console.error(
      "voyage-loader: Required elements #voyage-root or #loading-state not found."
    );
    return;
  }

  // Nếu không có id chuyến đi, hiển thị thông báo lỗi và ẩn loading
  if (!id) {
    root.innerHTML =
      '<div class="alert alert-info">Vui lòng chọn một chuyến đi để xem chi tiết.</div>';
    loading.style.display = "none";
    return;
  }

  try {
    // Luôn hiển thị loading khi bắt đầu tải dữ liệu
    loading.style.display = "block";

    // Đường dẫn tương đối đến file JSON
    const res = await fetch("src/data/journal.json");
    if (!res.ok) {
      throw new Error(
        `Không thể tải dữ liệu. Lỗi: ${res.status} ${res.statusText}`
      );
    }
    const chapters = await res.json();

    // Tìm chapter dựa trên ID
    // journal.json dùng "id": "v1", "v2"... nhưng query param gửi '1', vì vậy hỗ trợ nhiều kiểu tìm:
    //  - tìm theo trường id (exact)
    //  - tìm theo 'v' + id
    //  - tìm theo trường number (nếu có) hoặc so sánh chỉ số
    const chapter = chapters.find((c) => {
      const cid = c.id || "";
      const cnum = c.number !== undefined ? String(c.number) : null;
      if (cid === id) return true; // match exact id like 'v1'
      if (cid === `v${id}`) return true; // match 'v1' when id='1'
      if (cnum && cnum === id) return true; // match numeric
      // also support when id passed already like 'v1' and items have numeric number field
      if (id && id.startsWith("v") && cnum && `v${cnum}` === id) return true;
      return false;
    });

    if (!chapter) {
      throw new Error(`Không tìm thấy dữ liệu cho chuyến đi số ${id}.`);
    }

    // Cập nhật tiêu đề trang
    document.title = `${chapter.title} — Nhật Ký Hải Trình`;

    // Tính toán số chuyến để hiển thị an toàn: ưu tiên chapter.number, nếu không có
    // thì cố gắng rút ra chữ số từ chapter.id (ví dụ 'v1' -> '1'), nếu không có
    // chữ số thì dùng chapter.id hoặc ký tự gạch ngang làm fallback.
    const displayNumber =
      chapter.number !== undefined && chapter.number !== null
        ? chapter.number
        : (() => {
            const cid = chapter.id || "";
            const m = cid.match(/\d+/);
            if (m) return m[0];
            return chapter.id || "—";
          })();

    // Helper: escape HTML and convert newlines to paragraphs/line breaks so
    // long content from JSON renders with preserved line breaks.
    function nl2p(text) {
      if (!text && text !== 0) return "";
      // Ensure it's a string
      const s = String(text);
      // Basic HTML-escape
      const esc = s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
      // Split on two or more newlines -> paragraph, single newline -> <br>
      const paras = esc.split(/\n{2,}/g).map((p) => p.replace(/\n/g, "<br>"));
      return paras.map((p) => `<p>${p}</p>`).join("\n");
    }

    // escape helper for building inline content
    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    // Build content HTML by splitting paragraphs (\n\n). After each paragraph,
    // if images array has an image at the same index, insert it as an inline
    // image-card. Return remaining images (those not inserted) so media-grid can
    // render them as gallery.
    function buildContentWithInlineImages(text, images = [], title = "") {
      if (!text && text !== 0) return { html: "", remaining: images || [] };
      const paras = String(text).split(/\n{2,}/g);
      let html = "";
      for (let i = 0; i < paras.length; i++) {
        const p = paras[i].trim();
        if (!p) continue;
        const esc = escapeHtml(p).replace(/\n/g, "<br>");
        html += `<p>${esc}</p>` + "\n";
        if (Array.isArray(images) && images[i]) {
          const src = images[i];
          html +=
            `<div class="media-card image-card"><img src="${src}" alt="${escapeHtml(
              title
            )} image" loading="lazy"/></div>` + "\n\n";
        }
      }
      const remaining = Array.isArray(images) ? images.slice(paras.length) : [];
      return { html, remaining };
    }

    const { html: contentHtml, remaining: remainingImages } =
      buildContentWithInlineImages(
        chapter.content,
        chapter.images,
        chapter.title
      );
    const analysisHtml = nl2p(chapter.analysis);

    // Tạo HTML từ dữ liệu
    // find current index to allow prev/next navigation
    const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
    const nextChapter =
      currentIndex >= 0 && currentIndex < chapters.length - 1
        ? chapters[currentIndex + 1]
        : null;
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;

    const renderedHTML = `

        <div class="chapter-section">
          <div class="chapter-header">
            <div class="chapter-number">${displayNumber}</div>
            <h2 class="chapter-title">${chapter.title}</h2>
              <div class="chapter-meta">
                <span class="meta-item"><i class="fas fa-calendar-alt"></i><span>${
                  chapter.date
                }</span></span>
              </div>
        
          </div>
          <div class="chapter-content">${contentHtml}</div>
          <div class="media-grid">
            ${
              Array.isArray(remainingImages) && remainingImages.length
                ? remainingImages
                    .map(
                      (src) =>
                        `<div class="media-card image-card"><img src="${src}" alt="${chapter.title} image" loading="lazy"/></div>`
                    )
                    .join("")
                : `
           
            `
            }
          </div>
          

          <div class="chapter-navigation">
            <a class="nav-btn ${!prevChapter ? "disabled" : ""}" href="${
      prevChapter ? `voyage.html?v=${prevChapter.id.replace(/^v/, "")}` : "#"
    }"><i class="fas fa-chevron-left"></i> Trước</a>
            <a class="nav-btn ${!nextChapter ? "disabled" : ""}" href="${
      nextChapter ? `voyage.html?v=${nextChapter.id.replace(/^v/, "")}` : "#"
    }">Tiếp theo <i class="fas fa-chevron-right"></i></a>
          </div>
        </div>
      </div>
    `;

    // Đưa HTML vào trang và ẩn loading
    root.innerHTML = renderedHTML;
    loading.style.display = "none";

    // Cuộn lên đầu trang để người dùng thấy nội dung ngay
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    // Nếu có lỗi, hiển thị thông báo và ẩn loading
    root.innerHTML = `<div class="alert alert-danger"><strong>Đã xảy ra lỗi:</strong> ${err.message}</div>`;
    loading.style.display = "none";
  }
}

// Chạy hàm khi DOM đã được tải
document.addEventListener("DOMContentLoaded", loadVoyage);

export default loadVoyage;
