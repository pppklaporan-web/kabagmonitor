const GAS_URL = "https://script.google.com/macros/s/AKfycbxI9egPpN3R3Bck7qAbEjvOc_98QkpCeJsDOL9BYQ72q9tyur6m_SUC-8dtm_2kTTBd8g/exec"; // Ganti sesuai deployment WebApp kamu

const form = document.getElementById("laporForm");
const fotoFile = document.getElementById("fotoFile");
const previewWrap = document.getElementById("previewWrap");
const preview = document.getElementById("preview");
const statusMsg = document.getElementById("statusMsg");

let fotoBase64 = "";

// === Preview Foto ===
fotoFile.addEventListener("change", () => {
  const file = fotoFile.files[0];
  if (!file) {
    previewWrap.classList.add("hidden");
    fotoBase64 = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    fotoBase64 = e.target.result;
    preview.src = fotoBase64;
    previewWrap.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// Hapus foto
document.getElementById("clearPhoto").addEventListener("click", () => {
  fotoFile.value = "";
  fotoBase64 = "";
  previewWrap.classList.add("hidden");
});

// === Kirim Laporan ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.innerText = "Mengirim laporan...";
  statusMsg.style.color = "black";

  const data = {
    action: "submit_laporan",
    nama: document.getElementById("nama").value,
    kendala: document.getElementById("keterangan").value,
    lokasi: document.getElementById("ruangan").value,
    fotoBase64: fotoBase64
  };

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.status === "success") {
      statusMsg.innerText = "Laporan berhasil dikirim ✔️";
      statusMsg.style.color = "green";
      form.reset();
      previewWrap.classList.add("hidden");
      fotoBase64 = "";
    } else {
      statusMsg.innerText = "Gagal: " + result.message;
      statusMsg.style.color = "red";
    }

  } catch (error) {
    statusMsg.innerText = "Error jaringan: " + error;
    statusMsg.style.color = "red";
  }
});

