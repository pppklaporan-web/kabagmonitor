// ===============================
// PPPK — Dashboard Pimpinan UI
// ===============================

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxI9egPpN3R3Bck7qAbEjvOc_98QkpCeJsDOL9BYQ72q9tyur6m_SUC-8dtm_2kTTBd8g/exec";

let tableBody;

// Pastikan DOM siap
document.addEventListener("DOMContentLoaded", () => {
  tableBody = document.querySelector("#laporanTable tbody");
  fetchLaporanPimpinan();
  setInterval(fetchLaporanPimpinan, 5000);
});

// ===============================
// FETCH LAPORAN
// ===============================
async function fetchLaporanPimpinan() {
  try {
    const res = await fetch(GAS_URL);
    const json = await res.json();

    if (!json.laporan) return;

    const data = json.laporan.reverse(); // terbaru pertama

    tableBody.innerHTML = data
      .map((row) => {
        const ratingStars = createStarHTML(row.rating || 0, row.id, row.status);

        return `
          <tr class="${
            row.status === "Menunggu"
              ? "row-menunggu"
              : row.status === "Proses"
              ? "row-proses"
              : "row-selesai"
          }">

            <td>${row.id}</td>
            <td>${new Date(row.timestamp).toLocaleString()}</td>
            <td>${row.nama}</td>
            <td>${row.ruangan}</td>
            <td>${row.keterangan}</td>

            <td>${
              row.foto
                ? `<a href="${row.foto}" target="_blank">
                     <img src="${row.foto}" style="max-width:60px;border-radius:6px;">
                   </a>`
                : "-"
            }</td>

            <td>${row.status}</td>

            <td>
              <input type="text"
                value="${row.petugas || ""}"
                onchange="updatePetugasPimpinan('${row.id}', this.value)"
                placeholder="Tunjuk Petugas">
            </td>

            <td>${row.catatan || "-"}</td>

            <td>${ratingStars}</td>

            <td>
              <button onclick="openEdit('${row.id}', '${row.petugas}', '${
          row.rating || 0
        }')">
                Edit
              </button>
            </td>

          </tr>
        `;
      })
      .join("");

    updateSummary(json.summary);
    drawChart(json.summary);

  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

// ===============================
// UPDATE PETUGAS
// ===============================
async function updatePetugasPimpinan(id, petugas) {
  await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "update_petugas",
      id,
      petugas,
    }),
  });
}

// ===============================
// RATING
// ===============================
function createStarHTML(current, id, status) {
  if (status !== "Selesai")
    return `<span style="color:#777">Belum selesai</span>`;

  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= current ? "selected" : ""}"
                onclick="giveRating('${id}', ${i})">★</span>`;
  }
  return html;
}

async function giveRating(id, rating) {
  await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "update_rating",
      id,
      rating,
    }),
  });
  fetchLaporanPimpinan();
}

// ===============================
// MODAL
// ===============================
let selectedRating = 0;

function openEdit(id, petugas, rating) {
  document.getElementById("modalPimpinan").classList.remove("hidden");
  document.getElementById("editId").value = id;
  document.getElementById("editPetugasPimpinan").value = petugas;
  selectedRating = rating;
}

function closePimpinan() {
  document.getElementById("modalPimpinan").classList.add("hidden");
}

function saveEditPimpinan() {
  const id = document.getElementById("editId").value;
  const petugas = document.getElementById("editPetugasPimpinan").value;

  updatePetugasPimpinan(id, petugas);
  giveRating(id, selectedRating);

  closePimpinan();
  fetchLaporanPimpinan();
}

// ===============================
// SUMMARY
// ===============================
function updateSummary(sum) {
  document.getElementById("sumTotal").textContent = sum.total;
  document.getElementById("sumDone").textContent = sum.selesai;
  document.getElementById("sumProcess").textContent = sum.proses;
}

// ===============================
// CHART
// ===============================
let chart;

function drawChart(sum) {
  const ctx = document.getElementById("chartStatus");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Selesai", "Proses"],
      datasets: [
        {
          data: [sum.selesai, sum.proses],
          backgroundColor: ["#22c55e", "#3b82f6"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%", 
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

