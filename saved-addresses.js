const STORAGE_KEY = "addresses";

/* get saved addresses */
function getSavedAddresses(){
return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function getAddresses() {
return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAddresses(addresses) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

function renderAddresses() {
const list = document.getElementById("addressList");
const addresses = getAddresses();

list.innerHTML = "";

addresses.forEach((addr, index) => {
const div = document.createElement("div");
div.className = "address-card";

div.innerHTML = `
<pre>${addr}</pre>
<button onclick="editAddress(${index})">Edit</button>
<button onclick="deleteAddress(${index})">Delete</button>
`;

list.appendChild(div);
});
}

function addAddress() {
const textarea = document.getElementById("newAddress");
const address = textarea.value.trim();
if (!address) return;

const addresses = getAddresses();
addresses.push(address);
saveAddresses(addresses);

textarea.value = "";
renderAddresses();
}

function deleteAddress(index) {
const addresses = getAddresses();
addresses.splice(index, 1);
saveAddresses(addresses);
renderAddresses();
}

function editAddress(index) {
const addresses = getAddresses();
const newAddr = prompt("Edit address:", addresses[index]);
if (newAddr) {
addresses[index] = newAddr;
saveAddresses(addresses);
renderAddresses();
}
}

renderAddresses();

document.addEventListener("DOMContentLoaded", () => {
const backBtn = document.getElementById("backBtn");

if(backBtn){
backBtn.addEventListener("click", () => {
window.history.back(); // goes back to previous page
// OR if you want to go specifically to form page:
// window.location.href = "index.html";
});
}
});