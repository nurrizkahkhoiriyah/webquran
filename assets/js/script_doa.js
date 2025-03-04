    let doaData = [];
    let filteredData = [];
    let currentPage = 1;
    const perPage = 10;
    const doaContainer = document.getElementById('doa-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const searchSelect = document.getElementById('search-select');

    async function loadDoa() {
      try {
        const response = await fetch('https://api.myquran.com/v2/doa/semua');
        const result = await response.json();
        doaData = result.data;
        // Set filteredData menjadi semua doa secara default
        filteredData = doaData;
        // Isi dropdown dengan daftar judul doa
        populateDropdown();
        renderPage(currentPage);
      } catch (error) {
        console.error('Terjadi kesalahan saat mengambil data:', error);
      }
    }

    function populateDropdown() {
      // Bersihkan opsi kecuali opsi pertama ("Semua Doa")
      searchSelect.innerHTML = `<option value="">Semua Doa</option>`;
      doaData.forEach(doa => {
        const option = document.createElement('option');
        option.value = doa.judul;
        option.textContent = doa.judul;
        searchSelect.appendChild(option);
      });
    }

    function renderPage(page) {
      doaContainer.innerHTML = '';
      const startIndex = (page - 1) * perPage;
      const endIndex = page * perPage;
      const currentDoa = filteredData.slice(startIndex, endIndex);

      currentDoa.forEach((doa) => {
        const doaDiv = document.createElement('div');
        doaDiv.classList.add('doa');
        doaDiv.innerHTML = `
          <h2>${doa.judul}</h2>
          <p class="arab">${doa.arab}</p>
          <p class="terjemah"><strong>Terjemahan:</strong> ${doa.indo}</p>
          <p class="info"><strong>Sumber:</strong> ${doa.source}</p>
          <button class="copy-btn"><i class="fas fa-copy"></i></button>
        `;

        // Fitur copy dengan icon
        const copyBtn = doaDiv.querySelector('.copy-btn');
        const copyText = `${doa.judul}\n${doa.arab}\nTerjemahan: ${doa.indo}\nSumber: ${doa.source}`;
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(copyText)
            .then(() => {
              // Ganti ikon copy menjadi centang
              copyBtn.innerHTML = '<i class="fas fa-check"></i>';
              setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
              }, 2000);
            })
            .catch((err) => {
              console.error('Gagal menyalin teks: ', err);
            });
        });

        doaContainer.appendChild(doaDiv);
      });

      // Update tombol pagination
      prevBtn.disabled = (page === 1);
      nextBtn.disabled = (endIndex >= filteredData.length);
    }

    // Fungsi untuk filter data berdasarkan pilihan dropdown
    function filterBySelection() {
      const selectedJudul = searchSelect.value;
      if (selectedJudul === "") {
        filteredData = doaData;
      } else {
        filteredData = doaData.filter(doa => doa.judul === selectedJudul);
      }
      currentPage = 1;
      renderPage(currentPage);
    }

    searchSelect.addEventListener('change', filterBySelection);

    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentPage * perPage < filteredData.length) {
        currentPage++;
        renderPage(currentPage);
      }
    });

    loadDoa();
  