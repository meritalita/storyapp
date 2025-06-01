import { openDB } from 'idb';
 
const DATABASE_NAME = 'story-app';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';
 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

// Simpan atau update story
export default class Database {
  static async saveBookmark(story) {
    const db = await dbPromise;
    return db.put(OBJECT_STORE_NAME, story);
  }

// Hapus story berdasarkan id
static async deleteBookmark(id) {
  const db = await dbPromise;
  return db.delete(OBJECT_STORE_NAME, id);
}

// Mengambil semua bookmark
static async getBookmarks() {
  const db = await dbPromise;
  return db.getAll(OBJECT_STORE_NAME);
}

// Mengecek apakah sudah ada bookmark
static async isBookmarked(id) {
  const db = await dbPromise;
  const story = await db.get(OBJECT_STORE_NAME, id);
  return !!story;
}

// Tambahkan ini di bawah method getBookmarks()
static async getBookmarkById(id) {
  const db = await dbPromise;
  return db.get(OBJECT_STORE_NAME, id);
}
}