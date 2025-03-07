const hijriMonths = [
"Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
"Jumadil Awal", "Jumadil Akhir", "Rajab", "Syaban",
"Ramadhan", "Syawal", "Zulkaidah", "Dzulhijjah"
];

// Array global untuk menyimpan semua kartu (month-card)
let monthCards = [];

let currentHijriyahYear;

document.addEventListener("DOMContentLoaded", () => {
const today = new Date();
currentHijriyahYear = Math.floor((today.getFullYear() - 622) * 33 / 32);

renderYearCalendar(currentHijriyahYear);

document.getElementById("prevYear").addEventListener("click", () => {
currentHijriyahYear--;
renderYearCalendar(currentHijriyahYear);
scrollToToday();
});
document.getElementById("nextYear").addEventListener("click", () => {
currentHijriyahYear++;
renderYearCalendar(currentHijriyahYear);
scrollToToday();
});

scrollToToday();
});

function scrollToToday() {
setTimeout(() => {
const todayEl = document.querySelector('.today');
if (todayEl) {
  const monthCard = todayEl.closest('.month-card');
  if (monthCard) {
    const cardTop = monthCard.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: cardTop, behavior: 'smooth' });
  }
}
}, 100);
}

function renderYearCalendar(hYear) {
document.getElementById("yearDisplay").textContent = "Tahun Hijriyah: " + hYear + " H";
const container = document.getElementById("calendarContainer");
container.innerHTML = "";

// Kosongkan array monthCards setiap kali render
monthCards = [];

for (let m = 1; m <= 12; m++) {
const card = document.createElement("div");
card.className = "month-card";

// Simpan index bulan (m-1) ke attribute data
card.dataset.monthIndex = m - 1;

// Klik card => buka modal
card.addEventListener("click", () => {
  openModal(m - 1);
});

// Hitung rentang
const startGreg = hijriToGregorian(hYear, m, 1);
const nextGreg = (m < 12)
  ? hijriToGregorian(hYear, m + 1, 1)
  : hijriToGregorian(hYear + 1, 1, 1);
const daysInMonth = dateDiffInDays(startGreg, nextGreg);
const endGreg = addDays(startGreg, daysInMonth - 1);
const gregYear = endGreg.getFullYear();
const dateRangeStr = `< ${startGreg.getDate()} ${getGregMonthName(startGreg.getMonth() + 1)}
                      – ${endGreg.getDate()} ${getGregMonthName(endGreg.getMonth() + 1)} >`;

// Header
const headerDiv = document.createElement("div");
headerDiv.className = "month-card-header";

const monthName = document.createElement("h2");
monthName.className = "month-name";
monthName.textContent = hijriMonths[m - 1];
headerDiv.appendChild(monthName);

const infoDiv = document.createElement("div");
infoDiv.className = "month-info";

const yearRange = document.createElement("p");
yearRange.className = "year-range";
yearRange.textContent = hYear + " H / " + gregYear;
infoDiv.appendChild(yearRange);

const dateRange = document.createElement("p");
dateRange.className = "date-range";
dateRange.innerHTML = dateRangeStr;
infoDiv.appendChild(dateRange);

headerDiv.appendChild(infoDiv);
card.appendChild(headerDiv);

// Table
const table = document.createElement("table");
const thead = document.createElement("thead");
const trHead = document.createElement("tr");
const dayNames = ["Ahd", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
dayNames.forEach(day => {
  const th = document.createElement("th");
  th.textContent = day;
  trHead.appendChild(th);
});
thead.appendChild(trHead);
table.appendChild(thead);

// Body
const tbody = document.createElement("tbody");
renderMonthTable(hYear, m, tbody);
table.appendChild(tbody);

card.appendChild(table);

// Footnotes
const footnotesDiv = document.createElement("div");
footnotesDiv.className = "month-footer";

// Keterangan di footer (sesuai bulan)
if (m === 1) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color new-year"></span>
        1 Muharram – Tahun Baru Islam
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #d1f7d1;"></span>
        Senin-Kamis
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: rgba(179, 229, 252, 0.3);"></span>
        Ayyamul Bidh (13-15)
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #fff0b3;"></span>
        Tasu'a/Asyura (9-10)
      </li>
    </ul>
  `;
} else if (m === 3) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color maulid-nabi"></span>
        12 Rabiul Awal – Maulid Nabi Muhammad saw
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #d1f7d1;"></span>
        Senin-Kamis
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: rgba(179, 229, 252, 0.3);"></span>
        Ayyamul Bidh (13-15)
      </li>
    </ul>
  `;
} else if (m === 7) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #b19cd9;"></span>
        Isra Miraj (27 Rajab)
      </li>
    </ul>
  `;
} else if (m === 8) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #add8e6;"></span>
        Nishfu Syaban (15 Syaban)
      </li>
    </ul>
  `;
} else if (m === 9) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="border: 2px dashed #ffa200; display:inline-block;"></span>
        Puasa Ramadhan (1-30 Ramadhan)
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="border: 2px solid #daa520; display:inline-block;"></span>
        Nuzulul Qur'an (17 Ramadhan)
      </li>
    </ul>
  `;
} else if (m === 10) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #98fb98;"></span>
        Idul Fitri (1-2 Syawal)
      </li>
    </ul>
  `;
} else if (m === 12) {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #ffcccb;"></span>
        Puasa Arafah (9 Dzulhijjah)
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #ff7f7f;"></span>
        Idul Adha (10 Dzulhijjah)
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #ffff99;"></span>
        Hari Tasyriq (11-13 Dzulhijjah)
      </li>
    </ul>
  `;
} else {
  footnotesDiv.innerHTML = `
    <ul class="footnote-list">
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: #d1f7d1;"></span>
        Senin-Kamis
      </li>
      <li class="footnote-item">
        <span class="footnote-color" style="background-color: rgba(179, 229, 252, 0.3);"></span>
        Ayyamul Bidh (13-15)
      </li>
    </ul>
  `;
}

card.appendChild(footnotesDiv);
container.appendChild(card);

// Masukkan card ke array monthCards
monthCards.push(card);
}
}

function renderMonthTable(hYear, hMonth, tbodyEl) {
tbodyEl.innerHTML = "";
const startGreg = hijriToGregorian(hYear, hMonth, 1);
const nextGreg = (hMonth < 12)
? hijriToGregorian(hYear, hMonth + 1, 1)
: hijriToGregorian(hYear + 1, 1, 1);
const daysInMonth = dateDiffInDays(startGreg, nextGreg);
const startingWeekday = startGreg.getDay();

let tr = document.createElement("tr");
for (let i = 0; i < startingWeekday; i++) {
const emptyTd = document.createElement("td");
emptyTd.innerHTML = "&nbsp;";
tr.appendChild(emptyTd);
}

const today = new Date();
for (let d = 1; d <= daysInMonth; d++) {
if (tr.children.length === 7) {
  tbodyEl.appendChild(tr);
  tr = document.createElement("tr");
}
const td = document.createElement("td");
td.className = "calendar-cell";
const currentGreg = addDays(startGreg, d - 1);
const dayOfWeek = currentGreg.getDay();

// Penanda khusus
if (hMonth === 1 && d === 1) {
  td.classList.add("new-year");
}
if (hMonth === 3 && d === 12) {
  td.classList.add("maulid-nabi");
}

// Penanda puasa/hari besar
if (dayOfWeek === 1 || dayOfWeek === 4) td.classList.add("puasa-senin-kamis");
if (d === 13 || d === 14 || d === 15) td.classList.add("puasa-ayyamul-bidh");
if (hMonth === 1 && (d === 9 || d === 10)) td.classList.add("tasua-asyura");
if (hMonth === 7 && d === 27) td.classList.add("isra-miraj");
if (hMonth === 8 && d === 15) td.classList.add("nishfu-syaban");
if (hMonth === 9) {
  td.classList.add("puasa-ramadan");
  if (d === 17) td.classList.add("nuzul-quran");
}
if (hMonth === 10 && (d === 1 || d === 2)) td.classList.add("idul-fitri");
if (hMonth === 12 && d === 9) td.classList.add("puasa-arafah");
if (hMonth === 12 && d === 10) td.classList.add("idul-adha");
if (hMonth === 12 && d >= 11 && d <= 13) td.classList.add("hari-tasyriq");

// Tandai hari ini
if (
  currentGreg.getDate() === today.getDate() &&
  currentGreg.getMonth() === today.getMonth() &&
  currentGreg.getFullYear() === today.getFullYear()
) {
  td.classList.add("today");
}
td.innerHTML = `
  <div class="cell-content">
    <div class="hijri-date">${d}</div>
    <div class="greg-date">
      ${currentGreg.getDate()} ${getGregMonthName(currentGreg.getMonth() + 1)}
    </div>
  </div>
`;
tr.appendChild(td);
}

while (tr.children.length < 7) {
const emptyTd = document.createElement("td");
emptyTd.innerHTML = "&nbsp;";
tr.appendChild(emptyTd);
}
tbodyEl.appendChild(tr);
}

// Hijriyah -> Gregorian
function hijriToGregorian(hYear, hMonth, hDay) {
// Contoh override untuk tahun 1446
if (hYear === 1446 && hMonth === 1) {
const baseDate = new Date(2024, 6, 7);
return addDays(baseDate, hDay - 1);
}
if (hYear === 1446 && hMonth === 2) {
const baseDate = new Date(2024, 7, 6);
return addDays(baseDate, hDay - 1);
}
const jd = Math.floor((11 * hYear + 3) / 30)
        + 354 * hYear
        + 30 * hMonth
        - Math.floor((hMonth - 1) / 2)
        + hDay + 1948440 - 385;
let l = jd + 68569;
const n = Math.floor((4 * l) / 146097);
l = l - Math.floor((146097 * n + 3) / 4);
const i = Math.floor((4000 * (l + 1)) / 1461001);
l = l - Math.floor((1461 * i) / 4) + 31;
const j = Math.floor((80 * l) / 2447);
const day = l - Math.floor((2447 * j) / 80);
l = Math.floor(j / 11);
const month = j + 2 - 12 * l;
const year = 100 * (n - 49) + i + l;
return new Date(year, month - 1, day);
}
function addDays(date, days) {
const result = new Date(date);
result.setDate(result.getDate() + days);
return result;
}
function dateDiffInDays(a, b) {
const MS_PER_DAY = 1000 * 60 * 60 * 24;
return Math.round((b - a) / MS_PER_DAY);
}
function getGregMonthName(m) {
const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
return names[m - 1];
}

/* ==== Modal ==== */
function openModal(monthIndex) {
const modal = document.getElementById("modal");
modal.innerHTML = ''; // kosongkan konten modal

// Tombol close
const closeBtn = document.createElement("span");
closeBtn.className = "close-btn";
closeBtn.innerHTML = "&times;";
closeBtn.addEventListener("click", closeModal);
modal.appendChild(closeBtn);

// Klon isi kartu
const clonedCard = monthCards[monthIndex].cloneNode(true);
clonedCard.classList.add("month-card-larger");
modal.appendChild(clonedCard);

// Tombol Prev (ditaruh di modal, di luar card)
if (monthIndex > 0) {
const prevBtn = document.createElement("div");
prevBtn.className = "modal-nav-btn modal-prev";
prevBtn.textContent = "<";
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // mencegah event modal tertutup
  openModal(monthIndex - 1);
});
// Append ke modal, bukan ke clonedCard
modal.appendChild(prevBtn);
}

// Tombol Next (ditaruh di modal, di luar card)
if (monthIndex < 11) {
const nextBtn = document.createElement("div");
nextBtn.className = "modal-nav-btn modal-next";
nextBtn.textContent = ">";
nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openModal(monthIndex + 1);
});
modal.appendChild(nextBtn);
}

modal.style.display = "flex";
}

function closeModal() {
document.getElementById("modal").style.display = "none";
}