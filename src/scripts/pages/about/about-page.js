export default class AboutPage {
  async render() {
    return `
      <section class="container about-page">
        <h1>Tentang Aplikasi Katalog Story </h1>
        <p>
          Selamat datang di aplikasi <strong>Catalog Story</strong> ini! Di sini kamu bisa:
          <ul>
            <li>Menambahkan Story favorit lengkap dengan foto dan lokasi </li>
            <li>Menjelajahi dan menikmati Story yang ditambahkan oleh kamu dan pengguna lain </li>
            <li>Mengeksplorasi lokasi dengan peta interaktif menggunakan Leaflet </li>
          </ul>
        </p>
        <p class="italic">
          Aplikasi ini dibuat dengan sepenuh hati menggunakan JavaScript, Leaflet.js, dan API dari Dicoding.
        </p>
        <footer>
          &copy; 2025 MERITA
        </footer>
      </section>
    `;
  }

  async afterRender() {
  }
}
