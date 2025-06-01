import StoryAPI from '../services/story-api.js';
import Database from '../database.js';

export class StorySource {
  constructor(token) {
    this.token = token;
  }

  async addStory(story) {
    try {
      const result = await StoryAPI.postStory(story, this.token);
      return result; // Berhasil kirim ke server
    } catch (error) {
      console.warn('Gagal kirim ke API, simpan lokal:', error);
      this.addStoryLocally(story);
      return { isLocal: true }; // Tandai kalau simpan lokal
    }
  }

  addStoryLocally(story) {
    try {
      const data = JSON.parse(localStorage.getItem('localStory')) || [];

      if (data.length >= 20) {
        data.shift(); // hapus cerita paling lama
      }
      if (!story.id) {
        story.id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }

      data.push(story);
      localStorage.setItem('localStory', JSON.stringify(data));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage penuh, hapus beberapa data dulu!');
        localStorage.removeItem('localStory');
        localStorage.setItem('localStory', JSON.stringify([story]));
      } else {
        throw error;
      }
    }
  }

  static async getStory() {
    const data = JSON.parse(localStorage.getItem('localStory')) || [];
    return data;
  }

  static async saveBookmark(story) {
    try {
      await Database.saveBookmark(story);
    } catch (error) {
      console.error('Gagal menyimpan bookmark:', error);
    }
  }

  static async getBookmarks() {
    try {
      return await Database.getBookmarks();
    } catch (error) {
      console.error('Gagal mengambil bookmark:', error);
      return [];
    }
  }

  static async deleteBookmark(id) {
    try {
      await Database.deleteBookmark(id);
    } catch (error) {
      console.error('Gagal menghapus bookmark:', error);
    }
  }

  async getRemoteStories() {
    try {
      const stories = await StoryAPI.getStories(this.token);
      // Sesuaikan dengan return API-mu, biasanya listStory atau stories
      return stories || [];
    } catch (error) {
      console.error('Gagal ambil story dari API:', error);
      return [];
    }
  }

   async getCombinedStories() {
    try {
      const remoteStories = await this.getRemoteStories();
      const localStories = await StorySource.getStory();
      return [...remoteStories, ...localStories];
    } catch (error) {
      console.error('Error saat gabung story:', error);
      return [];
    }
  }

  static async isBookmarked(id) {
    try {
      return await Database.isBookmarked(id);
    } catch {
      return false;
    }
  }

static async getBookmarkById(id) {
  try {
    return await Database.getBookmarkById(id);
  } catch (error) {
    console.error('Gagal mengambil bookmark berdasarkan ID:', error);
    return null;
  }
}
}
