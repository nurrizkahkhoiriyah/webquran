  // Variabel Global
let allSurat = [];
let currentSurahIndex = -1;
let isPlayingAllAudio = false;
let currentAudio = null;
let currentIndividualAudio = null;
let currentIndividualKey = null;
let filterFavorites = false; // Status filter favorit

// Fungsi konversi nomor ke angka Arab
function toArabicNumerals(num) {
  const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return num.toString().split('').map(digit => arabicDigits[digit]).join('');
}

function stopAllAudio() {
  isPlayingAllAudio = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function stopIndividualAudio() {
  if (currentIndividualAudio) {
    currentIndividualAudio.pause();
    currentIndividualAudio.currentTime = 0;
    document.querySelectorAll('button[title="Putar Audio Individual"]').forEach(btn => {
      if (btn.getAttribute('data-key') === currentIndividualKey) {
        btn.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
      }
    });
    currentIndividualAudio = null;
    currentIndividualKey = null;
  }
}

function playSequentialAudio(urls, index = 0) {
  if (!isPlayingAllAudio) return;
  if (index >= urls.length) {
    isPlayingAllAudio = false;
    return;
  }
  currentAudio = new Audio(urls[index]);
  currentAudio.play();
  currentAudio.addEventListener('ended', function() {
    if (isPlayingAllAudio) {
      playSequentialAudio(urls, index + 1);
    }
  });
}

function playAudioIndividual(url, btn, key) {
  stopAllAudio();
  if (currentIndividualKey === key && currentIndividualAudio) {
    stopIndividualAudio();
    btn.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
  } else {
    stopIndividualAudio();
    currentIndividualAudio = new Audio(url);
    currentIndividualKey = key;
    currentIndividualAudio.play();
    btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    currentIndividualAudio.addEventListener('ended', function() {
      btn.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
      currentIndividualAudio = null;
      currentIndividualKey = null;
    });
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text)
    .then(() => { alert("Teks berhasil disalin!"); })
    .catch(err => { console.error("Gagal menyalin teks: ", err); });
}

// Favorit Surah: get & set dari localStorage
function getFavoriteSurahs() {
  return JSON.parse(localStorage.getItem('favoriteSurahs') || '[]');
}
function setFavoriteSurahs(favArray) {
  localStorage.setItem('favoriteSurahs', JSON.stringify(favArray));
}
// Toggle favorit surah (berdasarkan nomor surah)
function toggleFavoriteSurah(surahNum, btn) {
  let favs = getFavoriteSurahs();
  if (favs.includes(surahNum.toString())) {
    favs = favs.filter(item => item !== surahNum.toString());
    btn.innerHTML = '<i class="fa-regular fa-star"></i>';
  } else {
    favs.push(surahNum.toString());
    btn.innerHTML = '<i class="fa-solid fa-star"></i>';
  }
  setFavoriteSurahs(favs);
  renderSuratList(allSurat);
}

function setBookmark(key, btn) {
  const currentBookmark = localStorage.getItem('lastReadAyat');
  if (currentBookmark === key) {
    localStorage.removeItem('lastReadAyat');
    localStorage.removeItem('lastReadSurah');
    btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
  } else {
    localStorage.setItem('lastReadAyat', key);
    const surahName = btn.getAttribute('data-surah');
    localStorage.setItem('lastReadSurah', surahName);
    btn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
  }
  updateGlobalBookmarkBoth();
}

// Update tombol global bookmark (di halaman depan & detail)
function updateGlobalBookmarkBoth() {
  const bookmarkKey = localStorage.getItem('lastReadAyat');
  const surahName = localStorage.getItem('lastReadSurah');
  const frontBtn = document.getElementById('globalBookmarkFrontBtn');
  if (frontBtn) {
    if (bookmarkKey && surahName) {
      frontBtn.disabled = false;
      frontBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> ' + surahName;
    } else {
      frontBtn.disabled = true;
      frontBtn.textContent = 'No Bookmark';
    }
  }
  const detailBtn = document.getElementById('goToBookmarkBtn');
  if (detailBtn) {
    if (bookmarkKey && surahName) {
      detailBtn.disabled = false;
      detailBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> ' + surahName;
    } else {
      detailBtn.disabled = true;
      detailBtn.textContent = 'No Bookmark';
    }
  }
}

// Event listener tombol global bookmark
document.getElementById('globalBookmarkFrontBtn').addEventListener('click', function() {
  goToBookmark();
});
document.getElementById('goToBookmarkBtn').addEventListener('click', function() {
  goToBookmark();
});

function goToBookmark() {
  const bookmarkKey = localStorage.getItem('lastReadAyat');
  if (!bookmarkKey) {
    alert("Tidak ada bookmark.");
    return;
  }
  let targetElement = document.getElementById(bookmarkKey);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    const parts = bookmarkKey.split('_');
    const targetSurahNumber = Number(parts[0]);
    const targetSurah = allSurat.find(s => Number(s.nomor) === targetSurahNumber);
    if (targetSurah) {
      loadSurah(targetSurah, allSurat.indexOf(targetSurah));
      setTimeout(() => {
        let newTarget = document.getElementById(bookmarkKey);
        if (newTarget) {
          newTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          alert("Bookmark tidak ditemukan setelah memuat surah.");
        }
      }, 1000);
    } else {
      alert("Surah untuk bookmark tidak ditemukan.");
    }
  }
}

// Fungsi untuk memuat detail surah (ayat)
function loadSurah(surah, index) {
  stopAllAudio();
  stopIndividualAudio();
  currentSurahIndex = index;
  document.getElementById('surahListView').style.display = 'none';
  document.getElementById('surahDetailView').style.display = 'block';

  const ayatContainer = document.getElementById('ayatContainer');
  ayatContainer.innerHTML = `<h2 class="nama-surah">${surah.namaLatin} (<span class="namaArab">${surah.nama || ''}</span>) - ${surah.arti}</h2>`;
  if (Number(surah.nomor) !== 1 && Number(surah.nomor) !== 9) {
    ayatContainer.innerHTML += `<p class="bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>`;
  }
  const audioUrls = [];
  fetch(`https://equran.id/api/v2/surat/${surah.nomor}`)
    .then(response => response.json())
    .then(detailData => {
      if (detailData.data && detailData.data.ayat) {
        detailData.data.ayat.forEach(ayat => {
          if (ayat.audio && ayat.audio["01"]) {
            audioUrls.push(ayat.audio["01"]);
          }
        });
        if (audioUrls.length > 0) {
          const playAllBtn = document.createElement('button');
          playAllBtn.classList.add('play-all-btn');
          playAllBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play All Audio';
          playAllBtn.addEventListener('click', function() {
            if (isPlayingAllAudio) {
              stopAllAudio();
              playAllBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play All Audio';
            } else {
              stopIndividualAudio();
              isPlayingAllAudio = true;
              playAllBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Audio';
              playSequentialAudio(audioUrls);
            }
          });
          ayatContainer.appendChild(playAllBtn);
        }
        detailData.data.ayat.forEach(ayat => {
          const ayatDiv = document.createElement('div');
          ayatDiv.classList.add('ayat');
          const uniqueKey = surah.nomor + '_' + ayat.nomorAyat;
          ayatDiv.id = uniqueKey;
          ayatDiv.innerHTML = `
            <p class="arabic">
              ${ayat.teksArab}
              <span class="arabic-number-badge">${toArabicNumerals(ayat.nomorAyat)}</span>
            </p><br>
            <p class="teksLatin"><em>${ayat.teksLatin}</em></p>
            ${ayat.teksIndonesia ? `<p>${ayat.teksIndonesia}</p> <br>` : ''}
            <div class="icons">
              <button title="Putar Audio Individual" data-key="${uniqueKey}" onclick="playAudioIndividual('${ayat.audio["01"]}', this, '${uniqueKey}')">
                <i class="fa-solid fa-volume-up"></i>
              </button>
              <button title="Salin Teks" onclick="copyText('${(ayat.teksArab + ' ' + ayat.teksLatin + (ayat.teksIndonesia ? ' ' + ayat.teksIndonesia : '')).replace(/'/g, '\\\'')}')">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button title="Bookmark (terakhir dibaca)" data-key="${uniqueKey}" data-surah="${surah.namaLatin}" onclick="setBookmark('${uniqueKey}', this)">
                ${localStorage.getItem('lastReadAyat') === uniqueKey ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>'}
              </button>
            </div>
          `;
          ayatContainer.appendChild(ayatDiv);
        });
        updateGlobalBookmarkBoth();
      } else {
        ayatContainer.innerHTML += `<p>Data ayat tidak tersedia.</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching ayat:', error);
      ayatContainer.innerHTML += `<p>Terjadi kesalahan saat mengambil data ayat.</p>`;
    });
}

// Render daftar surat (dengan fitur favorit di setiap card)
function renderSuratList(suratArray) {
  // Jika filter favorit aktif, hanya tampilkan surah yang difavoritkan
  if (filterFavorites) {
    const favs = getFavoriteSurahs();
    suratArray = suratArray.filter(s => favs.includes(s.nomor.toString()));
  }
  const suratList = document.getElementById('suratList');
  suratList.innerHTML = '';
  suratArray.forEach((surah, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-icon">${surah.nomor}</div>
      <div class="card-content">
        <div class="card-headerr">
          <h2>${surah.namaLatin} (<span class="namaArab">${surah.nama || ''}</span>)</h2>
          <button class="favorite-surah-btn" data-id="${surah.nomor}" title="Favorit" onclick="event.stopPropagation(); toggleFavoriteSurah('${surah.nomor}', this)">
            ${ getFavoriteSurahs().includes(surah.nomor.toString()) ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>' }
          </button>
        </div>
        <p class="jumlahAyat">${surah.jumlahAyat} | ${surah.tempatTurun}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      loadSurah(surah, index);
    });
    suratList.appendChild(card);
  });
}

// Ambil data surat dari API
fetch('https://equran.id/api/v2/surat')
  .then(response => response.json())
  .then(data => {
    allSurat = data.data;
    renderSuratList(allSurat);
    updateGlobalBookmarkBoth();
  })
  .catch(error => console.error('Error fetching data surat:', error));

// Event listener pencarian
document.getElementById('searchSurah').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  let filteredSurat = allSurat.filter(surat =>
    surat.namaLatin.toLowerCase().includes(query) ||
    surat.arti.toLowerCase().includes(query)
  );
  renderSuratList(filteredSurat);
});

// Event listener tombol filter favorit di samping pencarian
document.getElementById('filterFavoritesBtn').addEventListener('click', function() {
  filterFavorites = !filterFavorites;
  this.innerHTML = filterFavorites ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
  renderSuratList(allSurat);
});

// Navigasi di halaman detail surah
document.getElementById('prevSurahBtn').addEventListener('click', function() {
  if (currentSurahIndex > 0) {
    loadSurah(allSurat[currentSurahIndex - 1], currentSurahIndex - 1);
  } else {
    alert("Surah sebelumnya tidak tersedia.");
  }
});
document.getElementById('nextSurahBtn').addEventListener('click', function() {
  if (currentSurahIndex < allSurat.length - 1) {
    loadSurah(allSurat[currentSurahIndex + 1], currentSurahIndex + 1);
  } else {
    alert("Surah berikutnya tidak tersedia.");
  }
});
document.getElementById('backBtn').addEventListener('click', function() {
  stopAllAudio();
  stopIndividualAudio();
  document.getElementById('ayatContainer').innerHTML = '<p>Pilih salah satu surat untuk menampilkan ayatnya.</p>';
  document.getElementById('surahListView').style.display = 'block';
  document.getElementById('surahDetailView').style.display = 'none';
  updateGlobalBookmarkBoth();
});