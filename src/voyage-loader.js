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
    const chapter = chapters.find((c) => String(c.number) === id);

    if (!chapter) {
      throw new Error(`Không tìm thấy dữ liệu cho chuyến đi số ${id}.`);
    }

    // Cập nhật tiêu đề trang
    document.title = `${chapter.title} — Nhật Ký Hải Trình`;

    // Tạo HTML từ dữ liệu
    const renderedHTML = `
      <div id="voyage-content"> <div class="voyage-header">
          <span class="voyage-badge"><i class="fas fa-anchor me-2"></i>Chuyến đi số ${
            chapter.number
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
            <div class="chapter-number">${chapter.number}</div>
            <h2 class="chapter-title">${chapter.title}</h2>
          </div>
          <div class="chapter-content">${chapter.content}</div>
          <div class="media-grid">
            <div class="media-card"><i class="fas fa-map"></i><h6>Bản đồ tuyến đường</h6><p>${
              chapter.mapTitle || "Bản đồ hải trình"
            }</p></div>
            <div class="media-card"><i class="fas fa-image"></i><h6>Hình minh họa</h6><p>${
              chapter.sketchTitle || "Minh họa thuyền buồm"
            }</p></div>
          </div>
          <div class="analysis-box"><h5><i class="fas fa-lightbulb"></i> Phân tích</h5><p>${
            chapter.analysis
          }</p></div>
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
