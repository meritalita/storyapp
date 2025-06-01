export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showReportsListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  // Method gabungan render daftar + map
  async initialRenderWithMap() {
    this.#view.showLoading();

    try {
      const bookmarks = await this.#model.getBookmarks();

      if (bookmarks.length === 0) {
        this.#view.showEmpty();
      } else {
        this.#view.showBookmarks(bookmarks);
      }
      await this.showReportsListMap(); // Inisialisasi peta sekaligus
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async initialRender() {
    // Bisa pakai ini jika hanya ingin render daftar tanpa map
    this.#view.showLoading();

    try {
      const bookmarks = await this.#model.getBookmarks();

      if (bookmarks.length === 0) {
        this.#view.showEmpty();
      } else {
        this.#view.showBookmarks(bookmarks);
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async deleteBookmark(id) {
    const confirmDelete = confirm('Yakin ingin menghapus bookmark ini?');
    if (!confirmDelete) return;

    try {
      await this.#model.deleteBookmark(id);
      alert("Bookmark dihapus!");
      // Beri tahu halaman lain bookmark dihapus
      window.dispatchEvent(
        new CustomEvent("bookmarkChanged", {
          detail: { storyId: id, isBookmarked: false },
        })
      );
      await this.initialRender();
    } catch (error) {
      alert("Gagal menghapus bookmark");
      console.error(error);
    }
  }
}
