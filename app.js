const modal = document.querySelector("#report-modal");
const form = document.querySelector("#report-form");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("#toast-message");
const pointsTotal = document.querySelector("#points-total");
const rewardBalance = document.querySelector("#reward-balance");

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

function openReport() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.querySelector("#issue-type").focus();
}

function closeReport() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelector("#open-report").addEventListener("click", openReport);
document.querySelector("#close-report").addEventListener("click", closeReport);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeReport();
});
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) openReport();
  if (event.key === "Escape") closeReport();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const total = Number(pointsTotal.textContent.replace(",", "")) + 50;
  const balance = Number(rewardBalance.textContent.replace(",", "").replace(" pts", "")) + 50;
  pointsTotal.textContent = total.toLocaleString();
  rewardBalance.innerHTML = `${balance.toLocaleString()} <em>pts</em>`;
  document.querySelector("#form-success").classList.add("show");
  showToast("You earned 50 points.");
  window.setTimeout(() => {
    closeReport();
    form.reset();
    document.querySelector("#form-success").classList.remove("show");
  }, 1800);
});

document.querySelectorAll(".map-pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    const tooltip = document.querySelector("#map-tooltip");
    tooltip.querySelector("strong").textContent = pin.dataset.title;
    tooltip.querySelector("small").textContent = pin.classList.contains("green-dot") ? "Resolved by the community" : "Reported nearby • +50 pts";
    tooltip.classList.add("show");
  });
});

document.querySelectorAll("[data-section]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-section="${item.dataset.section}"]`);
    if (navItem) navItem.classList.add("active");
    if (item.dataset.section === "rewards") showToast("Rewards shop is ready for your points.");
    if (item.dataset.section === "missions") showToast("3 missions are waiting for you.");
    if (item.dataset.section === "explore") document.querySelector(".map-panel").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector(".filter-button").addEventListener("click", () => showToast("Showing 3 issue types near you."));
