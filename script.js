let tenants = JSON.parse(localStorage.getItem("tenants")) || [];
let editId = null;

/* ======================
   INITIAL LOAD
====================== */
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
});

/* ======================
   SAVE / UPDATE TENANT
====================== */
function saveTenant() {
  const tenantData = {
    id: editId || generateTenantId(),
    name: fullName.value.trim(),
    contact: contactNo.value.trim(),
    emergencyName: emergencyName.value.trim(),
    emergencyNo: emergencyNo.value.trim(),
    moveIn: moveInDate.value,
    room: room.value || "Unassigned",
    payment: paymentStatus.value,
    status: "Active"
  };

  if (editId) {
    const index = tenants.findIndex(t => t.id === editId);
    tenants[index] = tenantData;
    editId = null;
  } else {
    tenants.push(tenantData);
  }

  localStorage.setItem("tenants", JSON.stringify(tenants));
  renderTable();
  clearForm();

  bootstrap.Modal.getInstance(
    document.getElementById("tenantModal")
  ).hide();
}

/* ======================
   RENDER + FILTER
====================== */
function renderTable() {
  const table = document.getElementById("tenantTable");
  table.innerHTML = "";

  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const payment = paymentFilter.value;

  tenants
    .filter(t => {
      const searchMatch =
        t.id.toLowerCase().includes(search) ||
        t.name.toLowerCase().includes(search) ||
        t.room.toLowerCase().includes(search) ||
        t.contact.includes(search);

      const statusMatch = !status || t.status === status;
      const paymentMatch = !payment || t.payment === payment;

      return searchMatch && statusMatch && paymentMatch;
    })
    .forEach(t => {
      table.innerHTML += `
        <tr>
          <td>${t.id}</td>
          <td>${t.name}</td>
          <td>${t.room}</td>
          <td>${t.contact}</td>
          <td>${t.moveIn}</td>
          <td>
            <span class="badge ${getPaymentBadge(t.payment)}">
              ${t.payment}
            </span>
          </td>
          <td>
            <span class="badge ${t.status === "Active" ? "bg-primary" : "bg-secondary"}">
              ${t.status}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editTenant('${t.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTenant('${t.id}')">Delete</button>
            <button class="btn btn-sm btn-secondary" onclick="moveOut('${t.id}')">Move Out</button>
          </td>
        </tr>
      `;
    });
}

/* ======================
   EDIT TENANT
====================== */
function editTenant(id) {
  const t = tenants.find(tenant => tenant.id === id);

  fullName.value = t.name;
  contactNo.value = t.contact;
  emergencyName.value = t.emergencyName;
  emergencyNo.value = t.emergencyNo;
  moveInDate.value = t.moveIn;
  room.value = t.room;
  paymentStatus.value = t.payment;

  editId = id;
  new bootstrap.Modal(document.getElementById("tenantModal")).show();
}

/* ======================
   DELETE TENANT
====================== */
function deleteTenant(id) {
  if (!confirm("Delete this tenant?")) return;

  tenants = tenants.filter(t => t.id !== id);
  localStorage.setItem("tenants", JSON.stringify(tenants));
  renderTable();
}

/* ======================
   MOVE OUT
====================== */
function moveOut(id) {
  const index = tenants.findIndex(t => t.id === id);
  tenants[index].status = "Moved Out";

  localStorage.setItem("tenants", JSON.stringify(tenants));
  renderTable();
}

/* ======================
   EVENTS
====================== */
searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
paymentFilter.addEventListener("change", renderTable);

/* ======================
   UTILITIES
====================== */
function clearForm() {
  document.querySelectorAll("#tenantModal input, #tenantModal select")
    .forEach(el => el.value = "");
}

function generateTenantId() {
  return "TN-" + String(tenants.length + 1).padStart(3, "0");
}

/* ======================
   PAYMENT BADGE COLORS
====================== */
function getPaymentBadge(payment) {
  switch (payment) {
    case "Paid":
      return "bg-success";
    case "Partially Paid":
      return "bg-warning text-dark";
    case "Overdue":
      return "bg-danger";
    case "Unpaid":
      return "bg-secondary";
    default:
      return "bg-light text-dark";
  }
}
