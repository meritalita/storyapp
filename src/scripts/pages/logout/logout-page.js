export default class LogoutPage {
  async render() {
    // Halaman logout kosong, karena hanya proses logout di afterRender
    return '';
  }

  async afterRender() {
    const confirmed = window.confirm('Apakah Anda yakin ingin logout?');
    if (confirmed) {
      AuthHelper.clearToken(); 
      // Coba tutup tab/jendela browser
      window.open('', '_self');
      window.close();

      // Jika tutup tab gagal, arahkan ke halaman login setelah 0.5 detik
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 500);
    } else {
      // Jika batal logout, kembali ke halaman home
      window.location.hash = '#/';
    }
  }
}
