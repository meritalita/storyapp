import L from '../utils/leaflet-init.js';

export class AddView {
  constructor() {
    this.stream = null;
    this.photoDataUrl = '';
    this.onSubmit = null; // callback dari AddPage
    this.cleanupHandler = this.cleanup.bind(this);

    // Inisialisasi currentStreams jika belum ada
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
    }
  }

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
    } else {
      window.currentStreams.push(stream);
    }
  }

  static stopAllStreams() {
    if (Array.isArray(window.currentStreams)) {
      window.currentStreams.forEach(stream => {
        if (stream.active) stream.getTracks().forEach(track => track.stop());
      });
      window.currentStreams = [];
    }
  }

  render() {
  return `
  <section class="add-story container" role="region" aria-labelledby="form-title">
      <h2 class="add-story-title">Tambah story</h2>
      <form id="storyForm" class="form-add-story">
        
        <label for="description">Deskripsi:</label>
        <textarea id="description" name="description" placeholder="Masukkan deskripsi story" required></textarea>

        <label for="fileInput">Foto (pilih dari galeri):</label>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button type="button" id="openCameraBtn" class="btn-primary" aria-label="Ambil foto dari kamera">Ambil Foto Kamera</button>
          <input type="file" id="fileInput" accept="image/*" style="display:none;" />
          <button type="button" id="openGalleryBtn" class="btn-primary" aria-label="Pilih foto dari galeri">Pilih dari Galeri</button>
        </div>

        <video id="video" autoplay playsinline style="display:none; width: 100%; max-height: 300px; margin-top: 10px; border-radius: 8px; border: 1px solid #ccc;"></video>
        <button type="button" id="captureBtn" class="btn-primary" style="display:none; margin-top: 10px;" aria-label="Ambil foto dari video">Ambil Foto</button>
        <img id="preview" alt="Preview gambar" class="image-preview" style="display:none;" />

        <label for="map">Lokasi (klik pada peta):</label>
        <div id="map" class="map-container" aria-label="Peta lokasi"></div>

        <label for="lat">Latitude:</label>
        <input type="text" id="lat" name="lat" readonly />

        <label for="lng">Longitude:</label>
        <input type="text" id="lng" name="lng" readonly />

        <button type="submit" class="btn-primary" style="margin-top: 1rem;">Tambah</button>
      </form>
    </section>
  `;
}

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    alert(message);
  }

  navigateToHome() {
    location.hash = '#/';
  }

  async afterRender() {
    // Setup peta dengan Leaflet
    const map = L.map('map').setView([-6.2, 106.8], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Lokasi pengguna (dengan fallback)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup('Lokasi Anda saat ini')
            .openPopup();
          document.getElementById('lat').value = latitude;
          document.getElementById('lng').value = longitude;
        },
        (error) => {
          console.warn('Gagal mendapatkan lokasi:', error.message);
          alert('Gagal mendapatkan lokasi. Lokasi default Jakarta akan digunakan.\nIzinkan akses lokasi jika ingin melihat posisi Anda.');
          const defaultLatLng = [-6.2, 106.8];
          map.setView(defaultLatLng, 11);
          L.marker(defaultLatLng)
            .addTo(map)
            .bindPopup('Lokasi Default (Jakarta)')
            .openPopup();
          document.getElementById('lat').value = defaultLatLng[0];
          document.getElementById('lng').value = defaultLatLng[1];
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

  let marker;
  map.on('click', e => {
    const { lat, lng } = e.latlng;
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(map);
  });

  // Setup kamera dan galeri
  const openCameraBtn = document.getElementById('openCameraBtn');
  const openGalleryBtn = document.getElementById('openGalleryBtn');
  const fileInput = document.getElementById('fileInput');
  const video = document.getElementById('video');
  const captureBtn = document.getElementById('captureBtn');
  const preview = document.getElementById('preview');

  this.stream = null;
  this.photoDataUrl = '';

    // **Start kamera otomatis saat halaman dimuat**
  try {
    this.stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' 
      } 
    });
    AddView.addNewStream(this.stream);
    video.srcObject = this.stream;
    video.style.display = 'block';
    captureBtn.style.display = 'inline-block';
    openCameraBtn.style.display = 'none';
    preview.style.display = 'none';
  } catch (err) {
    this.showError('Gagal mengakses kamera: ' + err.message);
  }

  openCameraBtn.addEventListener('click', async () => {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        }
        });
      AddView.addNewStream(this.stream);
      video.srcObject = this.stream;
      video.style.display = 'block';
      captureBtn.style.display = 'inline-block';
      openCameraBtn.style.display = 'none';
      preview.style.display = 'none';
    } catch (err) {
      this.showError('Gagal mengakses kamera: ' + err.message);
    }
  });

  captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this.photoDataUrl = canvas.toDataURL('image/png');

    preview.src = this.photoDataUrl;
    preview.style.display = 'block';
    video.style.display = 'none'; 
    captureBtn.style.display = 'none';
    openCameraBtn.style.display = 'inline-block'; 
  });

  openGalleryBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.photoDataUrl = e.target.result;
        preview.src = this.photoDataUrl;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(fileInput.files[0]);
      AddView.stopAllStreams();
    }
  });

  // Handler form submit menggunakan callback onSubmit
  const form = document.getElementById('storyForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!this.photoDataUrl) {
      this.showError('Silakan ambil foto terlebih dahulu!');
      return;
    }
    const story = {
      description: form.description.value,
      photoUrl: this.photoDataUrl,
      lat: parseFloat(form.lat.value),
      lon: parseFloat(form.lng.value),
    };
    if (typeof this.onSubmit === 'function') {
      this.onSubmit(story);
    }
  });

  window.addEventListener('hashchange', this.cleanupHandler);
}

cleanup() {
  AddView.stopAllStreams();
  window.removeEventListener('hashchange', this.cleanupHandler);
}
}
