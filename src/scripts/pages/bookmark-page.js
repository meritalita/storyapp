import { StorySource } from '../data/story-source.js';
import BookmarkPresenter from '../presenter/bookmark-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

export default class BookmarkPage {
  #presenter;
  map = null;
  markerGroup = null;

  async render() {
    return `
      <section class="container">
        <h1>Bookmark Saya</h1>
        <div id="loading" style="display:none;">Loading...</div>
        <div id="error" style="display:none; color:red;"></div>
        <div id="empty" style="display:none;">Belum ada story yang di-bookmark.</div>
        <div id="bookmarks"></div>
        <div id="map" style="height:400px; margin-top:1rem;"></div> 
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: StorySource,
    });

     // Inisialisasi peta dulu sebelum render bookmark supaya markerGroup sudah siap
    await this.initialMap();

    await this.#presenter.initialRender();
    await this.#presenter.showReportsListMap(); // baru inisialisasi peta
  
   // Dengarkan event bookmarkChanged untuk refresh daftar bookmark
  window.addEventListener('bookmarkChanged', async () => {
    await this.#presenter.initialRender();
    await this.#presenter.showReportsListMap();

  });
}
async initialMap() {
    if (!this.map) {
      this.map = L.map('map').setView([-6.200000, 106.816666], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.markerGroup = L.layerGroup().addTo(this.map);
    }
  }
  showLoading() {
    document.getElementById('loading').style.display = 'block';
    this._hideAllMessages();
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

    showMapLoading() {
    // Opsional: bisa pakai indikator loading khusus untuk peta
    console.log('Loading peta...');
  }

  hideMapLoading() {
    console.log('Peta selesai dimuat.');
  }

  showError(message) {
    this._hideAllMessages();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  showEmpty() {
    this._hideAllMessages();
    document.getElementById('empty').style.display = 'block';
  }

  showBookmarks(bookmarks) {
    this._hideAllMessages();
    const container = document.getElementById('bookmarks');
    container.innerHTML = bookmarks
      .map(
        (story) => `
      <article class="bookmark-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Foto oleh ${story.name}">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <p><small>Lokasi: ${story.lat}, ${story.lon}</small></p>
        <button class="delete-btn" data-id="${story.id}">Hapus Bookmark</button>
      </article>`
      )
      .join('');

    // Pasang event listener tombol hapus
    container.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await this.#presenter.deleteBookmark(id);
      });
    });
   // Update marker di peta
    this.markerGroup.clearLayers();
    const validMarkers = bookmarks.filter(b => b.lat && b.lon);

    validMarkers.forEach((bookmark) => {
      L.marker([bookmark.lat, bookmark.lon])
        .addTo(this.markerGroup)
        .bindPopup(`<b>${bookmark.name}</b><br>${bookmark.description || ''}`);
    });

    if (validMarkers.length > 0) {
      const latLngs = validMarkers.map(b => [b.lat, b.lon]);
      const bounds = L.latLngBounds(latLngs);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  _hideAllMessages() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('empty').style.display = 'none';
    document.getElementById('bookmarks').innerHTML = '';
  }
  clearMapMarkers() {
    this.markerGroup.clearLayers();
  }

  addMarker(lat, lng, popupText) {
    const marker = L.marker([lat, lng]);
    marker.bindPopup(popupText);
    this.markerGroup.addLayer(marker);
  }
}
