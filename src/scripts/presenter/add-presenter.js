export class AddPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async submitStory(story) {
    try {
      // Kirim story ke API
      const result = await this.model.addStory(story);

      this.view.cleanup();
      if (result.isLocal) {
        this.view.showSuccess('Story disimpan secara lokal (offline).');
      } else {
        this.view.showSuccess('Story berhasil ditambahkan ke server!');
      }
      this.view.navigateToHome();
    } catch (error) {
      console.error('Error saat menyimpan story:', error);
      this.view.showError('Terjadi kesalahan saat menyimpan.');
      this.view.navigateToHome();
    }
  }
}