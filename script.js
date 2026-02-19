document.addEventListener("DOMContentLoaded", () => {

/* ================= ADDRESS SYSTEM ================= */

const addressField = document.getElementById("address");
const dropdown = document.getElementById("addressDropdown");

const STORAGE_KEY = "addresses";

/* get saved addresses */
function getSavedAddresses(){
return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

/* save full list */
function saveAddresses(list){
localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* save single address */
function saveAddressIfNew(value){
if(!value) return;

let list = getSavedAddresses();
if(!list.includes(value)){
list.push(value);
saveAddresses(list);
}
}

/* render dropdown suggestions */
function renderDropdown(list){
dropdown.innerHTML = "";

if(!list.length){
dropdown.style.display = "none";
return;
}

dropdown.style.display = "block";

list.forEach(addr=>{
const div = document.createElement("div");
div.className = "address-item";
div.textContent = addr;

div.addEventListener("mousedown", (e)=>{
e.preventDefault(); // prevents blur before value set
addressField.value = addr;
saveAddressIfNew(addr); // ensure saved
dropdown.style.display = "none";
});

dropdown.appendChild(div);
});
}


function formatCurrencyInput(inputElement) {
inputElement.addEventListener("input", function() {
let value = this.value.trim();

// Allow NA (case-insensitive)
if(value.toUpperCase() === "NA") {
this.value = "NA";
return;
}

// Remove all non-digit characters
value = value.replace(/[^\d]/g, "");
if(!value) {
this.value = "";
return;
}

// Format number with Indian commas + /-
let num = parseInt(value, 10);
this.value = num.toLocaleString("en-IN") + "/-";
});

// Focus: remove /- to make typing easier
inputElement.addEventListener("focus", function() {
if(this.value !== "NA") this.value = this.value.replace("/-", "");
});

// Blur: add /- back, or NA if empty
inputElement.addEventListener("blur", function() {
if(!this.value) this.value = "NA";
else if(this.value.toUpperCase() !== "NA") {
this.value = this.value.replace(/[^\d]/g, "");
let num = parseInt(this.value, 10);
this.value = num.toLocaleString("en-IN") + "/-";
}
});
}
// List of fields to format
const moneyFields = [".rent", ".guarantee", ".advance", ".amount", ".total"];

moneyFields.forEach(selector => {
const field = document.querySelector(selector);
if(field) formatCurrencyInput(field);
});

/* show suggestions while typing */
addressField.addEventListener("input", ()=>{
const value = addressField.value.toLowerCase();
const filtered = getSavedAddresses().filter(a =>
a.toLowerCase().includes(value)
);
renderDropdown(filtered);
});

/* save when leaving field */
addressField.addEventListener("blur", ()=>{
const value = addressField.value.trim();
saveAddressIfNew(value);

setTimeout(()=> dropdown.style.display="none",150);
});

/* hide dropdown when clicking outside */
document.addEventListener("click", (e)=>{
if(!e.target.closest("#address")){
dropdown.style.display="none";
}
});


/* ================= ENTER KEY NAVIGATION ================= */

const inputs = Array.from(
document.querySelectorAll("input, textarea")
);

inputs.forEach((input, index) => {
input.addEventListener("keydown", (e) => {

if (input.tagName.toLowerCase() === "textarea") return;

if (e.key === "Enter") {
e.preventDefault();
if (inputs[index + 1]) inputs[index + 1].focus();
}
});
});


const mirror = document.getElementById("addressMirror");

function syncAddress(){
mirror.textContent = addressField.value;
}

addressField.addEventListener("input", syncAddress);
addressField.addEventListener("change", syncAddress);



// Select the "Amount Payable" field and the Download button
const amountField = document.querySelector(".total");
const downloadBtn = document.querySelector(".btn");

if(amountField && downloadBtn){
amountField.addEventListener("keydown", function(e){
if(e.key === "Enter"){ // when Enter is pressed
e.preventDefault(); // prevent default form behavior
downloadBtn.click(); // trigger PDF download
}
});
}


/* ================= DATE → DAY AUTO FILL ================= */

const dateField = document.querySelector(".date1");
const dayField = document.querySelector(".day");

if(dateField && dayField){
const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

dateField.addEventListener("change", function () {
if(!this.value) return;
const selectedDate = new Date(this.value);
dayField.value = days[selectedDate.getDay()];
});
}

});


function formatDate(dateInput){
if(!dateInput) return "";
const date = new Date(dateInput);
const day = String(date.getDate()).padStart(2,"0");
const month = String(date.getMonth()+1).padStart(2,"0");
const year = date.getFullYear();
return `${day}/${month}/${year}`; // DD/MM/YYYY
}



function getTimeWithAMPM(){
const timeInput = document.querySelector(".time").value; // "14:05"
const ampm = document.getElementById("ampm").value || "AM";

if(!timeInput) return "";

let [hour, minutes] = timeInput.split(":");
hour = parseInt(hour);

let displayHour = hour % 12 || 12; // converts 24h to 12h
return `${displayHour}:${minutes} ${ampm}`; // e.g., "02:05 PM"
}




const timeField = document.querySelector(".time");

if(timeField){
// Prevent invalid HH or MM
timeField.addEventListener("input", function(){
const val = this.value; // format "HH:MM"
if(!val) return;

let [h, m] = val.split(":").map(Number);

// Clamp values
if(h > 12) h = 12;
if(h < 1) h = 1; // optional: avoid 0
if(m > 59) m = 59;
if(m < 0) m = 0;

// Reformat back to HH:MM
this.value = String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
});
}


/* ================= PDF GENERATION ================= */

async function downloadPDF() {
const { jsPDF } = window.jspdf;
const element = document.getElementById("formArea");
const parentRect = element.getBoundingClientRect();




// ===== Helper functions =====
function formatDate(dateInput){
if(!dateInput) return "";
const date = new Date(dateInput);
if(isNaN(date.getTime())) return "";
const day = String(date.getDate()).padStart(2,"0");
const month = String(date.getMonth()+1).padStart(2,"0");
const year = String(date.getFullYear()).slice(-2);
return `${day}/${month}/${year}`;
}

function getTimeWithAMPM(){
const timeInput = document.querySelector(".time").value;
const ampm = document.getElementById("ampm")?.value || "AM";
if(!timeInput) return "";
let [hour, minutes] = timeInput.split(":");
hour = parseInt(hour);
let displayHour = hour % 12 || 12;
return `${displayHour}:${minutes} ${ampm}`;
}

function formatMoney(value){
if(!value || value.toString().trim() === "") return "NA"; // blank → NA
value = value.toString().trim();

// If user typed NA (case-insensitive), just return "NA"
if(value.toUpperCase() === "NA") return "NA";

// Otherwise, remove non-digit characters
value = value.replace(/[^\d]/g, "");
if(!value) return "NA"; // if nothing left after removing non-digits


// Format number with Indian commas + /-
return parseInt(value,10).toLocaleString("en-IN") + "/-";
}

// ===== Custom position offsets for fine-tuning each field =====
const customOffsets = {
"#address": {topOffset: 15, leftOffset: 40},
".vehicle": {topOffset: 10, leftOffset: 0},
".date": {topOffset: 0, leftOffset: -20},
".brent": {topOffset: 0, leftOffset: 0},
".bguarantee": {topOffset: 0, leftOffset: 0},
".rent": {topOffset: 0, leftOffset: -35},
".guarantee": {topOffset: 0, leftOffset: 0},
".advance": {topOffset: 0, leftOffset: 0},
".amount": {topOffset: 0, leftOffset: 0},
".tip": {topOffset: -5, leftOffset: 80},
".weight": {topOffset: 0, leftOffset: 0},
".count": {topOffset: 0, leftOffset: 0},
".total": {topOffset: 0, leftOffset: 0},
".date1": {topOffset: 0, leftOffset: -9},
".time": {topOffset: 0, leftOffset: 20},
".day": {topOffset: 0, leftOffset: -15}
};




// ===== Hide all original inputs & selects =====
const allInputs = element.querySelectorAll("input, textarea, select");
allInputs.forEach(inp => inp.style.color = "transparent");
allInputs.forEach(inp => inp.style.background = "transparent");

// ===== Fields configuration =====
const fields = [
{selector: "#address", fontSize:24, fontWeight:800, multiline:true},
{selector: ".date", fontSize:24, fontWeight:800, isDate:true},
{selector: ".vehicle", fontSize:28, fontWeight:1000},
{selector: ".brent", fontSize:22, fontWeight:800},
{selector: ".bguarantee", fontSize:22, fontWeight:800},
{selector: ".rent", fontSize:22, fontWeight:800, isMoney:true},
{selector: ".guarantee", fontSize:22, fontWeight:800, isMoney:true},
{selector: ".advance", fontSize:26, fontWeight:800, isMoney:true},
{selector: ".amount", fontSize:26, fontWeight:800, isMoney:true},
{selector: ".tip", fontSize:22, fontWeight:800, multiline:true},
{selector: ".weight", fontSize:24, fontWeight:800},
{selector: ".count", fontSize:24, fontWeight:800},
{selector: ".total", fontSize:24, fontWeight:800, isMoney:true},
{selector: ".date1", fontSize:24, fontWeight:800, isDate:true},
{selector: ".time", fontSize:24, fontWeight:800, isTime:true},
{selector: ".day", fontSize:24, fontWeight:800}
];

// ===== Create overlays =====
const overlays = [];

fields.forEach(f => {

const field = document.querySelector(f.selector);
if(!field) return;

const rect = field.getBoundingClientRect();
const overlay = document.createElement("div");
const offsets = customOffsets[f.selector] || {topOffset:0, leftOffset:0};

let text = "";

// ===== VALUE LOGIC =====
if(f.selector === "#address"){
text = field.value || "";
}
else if(f.isDate){
text = formatDate(field.value);
}
else if(f.isTime){
text = getTimeWithAMPM();
}
else if(f.isMoney){
text = formatMoney(field.value);
}
else if(f.selector === ".tip"){
const value = field.value.trim();

let formattedTip = "";

if(value){
if(/^\d+$/.test(value.replace(/[^\d]/g,""))){
formattedTip = parseInt(value.replace(/[^\d]/g,""),10)
.toLocaleString("en-IN") + "/- ";
}else{
formattedTip = value + " ";
}
}

text = formattedTip + "Be on time with Expected Weight.";
}
else{
text = field.value || "";
}

// ===== STYLE =====
overlay.innerText = text;

overlay.style.position = "absolute";
overlay.style.top = (rect.top - parentRect.top + offsets.topOffset) + "px";
overlay.style.left = (rect.left - parentRect.left + offsets.leftOffset) + "px";
overlay.style.width = rect.width + "px";
overlay.style.height = rect.height + "px";
overlay.style.fontSize = f.fontSize + "px";
overlay.style.fontWeight = f.fontWeight;
overlay.style.textAlign = "center";
overlay.style.whiteSpace = f.multiline ? "pre-wrap" : "nowrap";
overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";

element.appendChild(overlay);
overlays.push(overlay);

});

// ===== Generate canvas & PDF =====
const canvas = await html2canvas(element, {scale:2, useCORS:true});
const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF("p","mm","a4");
pdf.addImage(imgData,"PNG",0,0,210,297);

// Get vehicle number
const vehicleNumberField = document.querySelector(".vehicle");
let vehicleNumber = vehicleNumberField ? vehicleNumberField.value.trim() : "Pine_Agri_Form";

// Replace spaces or special characters in filename
vehicleNumber = vehicleNumber.replace(/[^a-zA-Z0-9_-]/g, "_");

// Save PDF with vehicle number as filename
pdf.save(vehicleNumber + "_P3pineapple.pdf");

// ===== Cleanup overlays =====
overlays.forEach(o => element.removeChild(o));

// ===== Restore original inputs =====
allInputs.forEach(inp => inp.style.color = "");
allInputs.forEach(inp => inp.style.background = "");
}

/* ================= NAVIGATION ================= */

function goToSavedAddresses() {
window.location.href = "saved-addresses.html";
}




