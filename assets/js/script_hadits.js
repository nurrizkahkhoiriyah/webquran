function showSection(sectionName) {
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('arbainSection').style.display = 'none';
  document.getElementById('perawiSection').style.display = 'none';
  if (sectionName === 'main') {
    document.getElementById('mainPage').style.display = 'flex';
  } else if (sectionName === 'arbain') {
    document.getElementById('arbainSection').style.display = 'block';
  } else if (sectionName === 'perawi') {
    document.getElementById('perawiSection').style.display = 'block';
  }
}
showSection('main');

// Navigasi Halaman Utama
document.getElementById('cardArbain').addEventListener('click', () => { showSection('arbain'); });
document.getElementById('cardPerawi').addEventListener('click', () => { showSection('perawi'); });

/* --- Hadits Arbain --- */
function showHadithDetail(hadith) {
  document.getElementById('arbainGrid').style.display = 'none';
  document.getElementById('haditsDetail').style.display = 'block';
  document.getElementById('detailContent').innerHTML = `
    <h2>Hadits Nomor ${hadith.no || ''}</h2>
    <div class="arabic">${hadith.arab || 'Tidak ada teks Arab'}</div>
    <div class="translation">${hadith.indo || 'Tidak ada terjemahan'}</div>
  `;
  const existingCopy = document.getElementById('copyHaditsBtn');
  if(existingCopy) existingCopy.remove();
  let copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.id = 'copyHaditsBtn';
  copyBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M10 1.5v1H6v-1h4z"/>
      <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3.5A1.5 1.5 0 0 0 11.5 2h-7zM4 3.5C4 2.67 4.67 2 5.5 2h5C11.33 2 12 2.67 12 3.5V14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5z"/>
    </svg>`;
  copyBtn.addEventListener('click', () => {
    let textToCopy = document.getElementById('detailContent').innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Hadits disalin ke clipboard!');
    });
  });
  document.getElementById('haditsDetail').appendChild(copyBtn);
}
function showArbainGrid() {
  document.getElementById('haditsDetail').style.display = 'none';
  document.getElementById('arbainGrid').style.display = 'grid';
}
fetch('https://api.myquran.com/v2/hadits/arbain/semua')
  .then(response => response.json())
  .then(data => {
    let hadiths = Array.isArray(data.data) ? data.data : data;
    const arbainGrid = document.getElementById('arbainGrid');
    arbainGrid.innerHTML = '';
    hadiths.forEach(hadith => {
      const card = document.createElement('div');
      card.className = 'arbain-card';
      card.innerHTML = `<h3>Hadits ${hadith.no || ''}</h3>`;
      card.addEventListener('click', () => {
        showHadithDetail(hadith);
      });
      arbainGrid.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Error fetching Hadits Arbain:', error);
    document.getElementById('arbainGrid').textContent = 'Gagal memuat daftar hadits Arbain.';
  });

/* --- Hadits 9 Perawi --- */
function showPerawiCards() {
  document.getElementById('perawiDetail').style.display = 'none';
  document.getElementById('perawiCards').style.display = 'grid';
}
function loadPerawiHadits(perawi) {
  document.getElementById('perawiCards').style.display = 'none';
  document.getElementById('perawiDetail').style.display = 'block';
  document.getElementById('perawiContent').innerHTML = `
    <h2>Hadits dari ${perawi.nama || perawi.name || perawi.slug} (tersedia ${perawi.total || 'N/A'} hadits)</h2>
    <div id="perawiSearchBox" style="margin-bottom: 20px; text-align: center;">
      <input type="number" id="perawiSearchInput" placeholder="Cari hadits berdasarkan nomor" min="1" style="padding: 8px; width: 200px; border: 1px solid #ccc; border-radius: 4px;">
      <button id="perawiSearchBtn" style="padding: 8px 16px; margin-left: 10px; background: var(--primary); color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cari</button>
    </div>
    <div id="perawiHadithContainer">Memuat hadits...</div>
  `;
  document.getElementById('pageCounter').textContent = '';
  let currentPage = 1;
  const perPage = 50;
  const totalHadits = parseInt(perawi.total) || 0;
  const totalPages = Math.ceil(totalHadits / perPage);

  function loadHadithPage(page, scrollToHadith) {
    const container = document.getElementById('perawiHadithContainer');
    container.innerHTML = 'Memuat hadits...';
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, totalHadits);
    const hadithNumbers = [];
    for (let i = start; i <= end; i++) {
      hadithNumbers.push(i);
    }
    const fetchPromises = hadithNumbers.map(number => {
      return fetch(`https://api.myquran.com/v2/hadits/${perawi.slug}/${number}`)
        .then(response => {
          if (!response.ok) throw new Error(`Hadits ${number} tidak ditemukan.`);
          return response.json();
        })
        .then(data => ({ number, data: data.data || data }))
        .catch(error => ({ number, error: error.message }));
    });
    Promise.all(fetchPromises).then(results => {
      let html = '';
      results.forEach(result => {
        if (result.data) {
          html += `<div class="hadits-card" id="hadits-card-${result.number}">
            <h3>Hadits Nomor ${result.number}</h3>
            <div class="arabic">${result.data.arab || 'Tidak ada teks Arab'}</div>
            <div class="translation">${result.data.indo || result.data.id || 'Tidak ada terjemahan'}</div>
            <button class="copy-btn" onclick="copyHaditsCard(${result.number})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10 1.5v1H6v-1h4z"/>
                <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3.5A1.5 1.5 0 0 0 11.5 2h-7zM4 3.5C4 2.67 4.67 2 5.5 2h5C11.33 2 12 2.67 12 3.5V14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5z"/>
              </svg>
            </button>
          </div>`;
        } else {
          html += `<div class="hadits-card">
            <h3>Hadits Nomor ${result.number}</h3>
            <p>Error: ${result.error}</p>
          </div>`;
        }
      });
      container.innerHTML = `<div class="hadits-list-container">${html}</div>`;
      document.getElementById('pageCounter').textContent = `Halaman ${page} dari ${totalPages}`;
      if (scrollToHadith) {
        const card = document.getElementById('hadits-card-' + scrollToHadith);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }).catch(err => {
      container.innerHTML = `<p>${err.message}</p>`;
    });
  }

  loadHadithPage(currentPage);

  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadHadithPage(currentPage);
    }
  });
  document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadHadithPage(currentPage);
    }
  });

  document.getElementById('perawiSearchBtn').addEventListener('click', () => {
    const searchValue = parseInt(document.getElementById('perawiSearchInput').value);
    if (isNaN(searchValue) || searchValue < 1 || searchValue > totalHadits) {
      alert('Masukkan nomor hadits yang valid!');
      return;
    }
    currentPage = Math.ceil(searchValue / perPage);
    loadHadithPage(currentPage, searchValue);
  });
}

function copyHaditsCard(cardId) {
  const card = document.getElementById('hadits-card-' + cardId);
  if (card) {
    const arabicText = card.querySelector('.arabic') ? card.querySelector('.arabic').textContent : '';
    const translationText = card.querySelector('.translation') ? card.querySelector('.translation').textContent : '';
    const textToCopy = arabicText + "\n" + translationText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Hadits disalin ke clipboard!');
    });
  }
}

fetch('https://api.myquran.com/v2/hadits/perawi/')
  .then(response => response.json())
  .then(data => {
    const perawis = data.data || data;
    const perawiCards = document.getElementById('perawiCards');
    perawiCards.innerHTML = '';
    perawis.forEach(perawi => {
      const card = document.createElement('div');
      card.className = 'perawi-card';
      card.innerHTML = `
        <h3>${perawi.nama || perawi.name || perawi.slug}</h3>
        <p>Tersedia ${perawi.total || 'N/A'} hadits</p>
      `;
      card.addEventListener('click', () => {
        loadPerawiHadits(perawi);
      });
      perawiCards.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Error fetching daftar perawi:', error);
    document.getElementById('perawiCards').textContent = 'Gagal memuat daftar perawi.';
  });