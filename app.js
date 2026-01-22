// ---------- Elements ----------
const directoryEl = document.getElementById("directory");
const searchInput = document.getElementById("search");

const modalOverlay = document.getElementById("modalOverlay");
const modalPhoto = document.getElementById("modalPhoto");
const modalName = document.getElementById("modalName");
const modalPosition = document.getElementById("modalPosition");
const modalExt = document.getElementById("modalExt");
const modalCub = document.getElementById("modalCub");
const modalEmail = document.getElementById("modalEmail");
const modalClose = document.querySelector(".modal-close");

let lastFocusedElement = null;

// ---------- Image fallback handling ----------
modalPhoto.dataset.triedPng = "false";
modalPhoto.onerror = function () {
  if (this.dataset.triedPng === "false") {
    this.dataset.triedPng = "true";
    this.src = this.src.replace(".jpg", ".png");
  } else {
    this.src = "photos/default.jpg";
  }
};

// ---------- Fetch JSON ----------
fetch("directorio.json")
  .then(res => res.json())
  .then(init)
  .catch(err => console.error("Error loading JSON:", err));

// ---------- Init ----------
function init(data) {
  render(data.sections);

  searchInput.addEventListener("input", () =>
    filter(data.sections, searchInput.value)
  );
}

// ---------- Render Sections ----------
function render(sections) {
  directoryEl.innerHTML = "";

  sections.forEach(section => {
    const sec = document.createElement("section");
    sec.className = "section";

    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${section.name}</h2><span>▼</span>`;
    title.onclick = () => sec.classList.toggle("collapsed");

    const grid = document.createElement("div");
    grid.className = "cards";

    section.contacts.forEach(c => grid.appendChild(createCard(c)));

    sec.append(title, grid);
    directoryEl.appendChild(sec);
  });
}

// ---------- Filter ----------
function filter(sections, term) {
  term = term.toLowerCase();

  const filtered = sections
    .map(s => ({
      ...s,
      contacts: s.contacts.filter(c =>
        Object.values(c).some(v =>
          String(v ?? "").toLowerCase().includes(term)
        )
      )
    }))
    .filter(s => s.contacts.length);

  render(filtered);
}

// ---------- Create Card ----------
function createCard(c) {
  const el = document.createElement("article");
  el.className = "card";
  el.tabIndex = 0;
  el.setAttribute("role", "button");

  // Image
  const img = document.createElement("img");
  const base = c.extension ?? "default";
  img.src = `photos/${base}.jpg`;
  img.alt = c.name;
  img.dataset.triedPng = "false";
  img.onerror = function () {
    if (this.dataset.triedPng === "false") {
      this.dataset.triedPng = "true";
      this.src = this.src.replace(".jpg", ".png");
    } else {
      this.src = "photos/default.jpg";
    }
  };
  el.appendChild(img);

  el.insertAdjacentHTML(
    "beforeend",
    `
    <h3>${c.name}</h3>
    <div class="position">${c.position ?? ""}</div>
    <div class="meta">
      ${c.extension ? `<span><strong>Extensión:</strong> ${c.extension}</span>` : ""}
      ${c.cubicle ? `<span><strong>Cubículo:</strong> ${c.cubicle}</span>` : ""}
    </div>
    ${c.email ? `<a href="mailto:${c.email}" class="email">${c.email}</a>` : ""}
    `
  );

  // Click and keyboard
  el.addEventListener("click", () => openModal(c));
  el.addEventListener("keydown", e => {
    if (e.key === "Enter") openModal(c);
  });

  return el;
}

// ---------- Open Modal ----------
function openModal(c) {
  lastFocusedElement = document.activeElement;

  const modalPhoto = document.getElementById("modalPhoto");
  const modalPhotoLink = document.getElementById("modalPhotoLink");

  // Set the image src and link, fallback to default if not found
  modalPhoto.src = `photos/${c.extension ?? "default"}.jpg`;
  modalPhoto.alt = c.name;
  modalPhotoLink.href = modalPhoto.src;

  modalPhoto.onerror = () => {
    modalPhoto.src = `photos/default.jpg`;
    modalPhotoLink.href = modalPhoto.src;
  };

  document.getElementById("modalName").textContent = c.name;
  document.getElementById("modalPosition").textContent = c.position ?? "";
  document.getElementById("modalExt").textContent = c.extension ? `Ext: ${c.extension}` : "";
  document.getElementById("modalCub").textContent = c.cubicle ?? "";

  const modalEmail = document.getElementById("modalEmail");
  if (c.email) {
    modalEmail.href = `mailto:${c.email}`;
    modalEmail.textContent = c.email;
  } else {
    modalEmail.href = "#";
    modalEmail.textContent = "";
  }

  // Show modal
  modalOverlay.classList.add("show");

  // Focus close button for accessibility
  modalClose.focus();
}

// Close the modal
function closeModal() {
  modalOverlay.classList.remove("show");
  if (lastFocusedElement) lastFocusedElement.focus();
}

// Close modal via close button
modalClose.addEventListener("click", closeModal);

// Close modal if clicking outside modal content
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Close modal with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
    closeModal();
  }
});
