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

const toggleAllBtn = document.getElementById("toggleAllBtn");
let allExpanded = true;

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
    toggleAllBtn.addEventListener("click", toggleAllSections);
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
        title.onclick = () => toggleSection(sec);

        const grid = document.createElement("div");
        grid.className = "cards";

        section.contacts.forEach(c => grid.appendChild(createCard(c)));

        sec.append(title, grid);
        directoryEl.appendChild(sec);
    });

    if (!allExpanded) {
        document.querySelectorAll(".section").forEach(sec => {
            toggleSection(sec);
        });
    }
}

function toggleSection(section) {
    const cards = section.querySelector(".cards");

    const isHidden = cards.style.display === "none";

    if (isHidden) {
        // EXPAND

        cards.style.display = "grid";

        requestAnimationFrame(() => {
            cards.style.opacity = "0";
            cards.style.transform = "translateY(-10px)";

            requestAnimationFrame(() => {
                cards.style.opacity = "1";
                cards.style.transform = "translateY(0)";
            });
        });

        section.classList.remove("collapsed");
    } else {
        // COLLAPSE

        section.classList.add("collapsing");

        cards.style.opacity = "0";
        cards.style.transform = "translateY(-10px)";

        setTimeout(() => {
            cards.style.display = "none";
            section.classList.remove("collapsing");
            section.classList.add("collapsed");
        }, 300);
    }
}

function toggleAllSections() {
    const sections = document.querySelectorAll(".section");

    allExpanded = !allExpanded;

    sections.forEach(sec => {
        const isCollapsed = sec.classList.contains("collapsed");

        if (allExpanded && isCollapsed) {
            toggleSection(sec);
        }

        if (!allExpanded && !isCollapsed) {
            toggleSection(sec);
        }
    });

    toggleAllBtn.textContent = allExpanded
        ? "Colapsar todo"
        : "Expandir todo";
}

// ---------- Filter ----------
function filter(sections, term) {
    term = term
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const filtered = sections
        .map(section => {
            const sectionMatches = section.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .includes(term);

            // If section title matches, keep all contacts
            if (sectionMatches) {
                return section;
            }

            // Otherwise, filter contacts
            const contacts = section.contacts.filter(c =>
                Object.values(c).some(v =>
                    String(v ?? "")
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .includes(term)
                )
            );

            return {...section, contacts};
        })
        .filter(section => section.contacts.length);

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
    const base = c.nomina ?? "default";
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

    // Set the image src and link, fallback to default if not found
    modalPhoto.src = `photos/${c.nomina ?? "default"}.jpg`;
    modalPhoto.alt = c.name;
    modalPhotoLink.href = modalPhoto.src;

    modalPhoto.onerror = () => {
        modalPhoto.src = `photos/default.jpg`;
        modalPhotoLink.href = modalPhoto.src;
    };

    modalName.textContent = c.name;
    modalPosition.textContent = c.position ?? "";
    modalExt.textContent = c.extension ? `Ext: ${c.extension}` : "";
    modalCub.textContent = c.cubicle ?? "";

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
