import { StorySource } from '../data/story-source';

class HomePresenter {
  async getCombinedStories(token) {
    const source = new StorySource(token);
    const apiStories = await source.getRemoteStories();
    const localStories = await StorySource.getStory();

    // Ambil semua bookmark
    const bookmarks = await StorySource.getBookmarks();
    const bookmarkedIds = bookmarks.map((b) => b.id);

    // Gabungkan dan tandai mana yang sudah di-bookmark
    const combined = [...localStories, ...apiStories].map((story) => ({
      ...story,
      isBookmarked: bookmarkedIds.includes(story.id),
    }));

    return combined;
}

async toggleBookmark(storyId, allStories) {
    const story = allStories.find((s) => s.id === storyId);
    if (!story) throw new Error('Story not found');

    const isBookmarked = await StorySource.getBookmarkById(storyId);
    if (isBookmarked) {
      await StorySource.deleteBookmark(storyId);
      return false; // sekarang tidak di-bookmark
    } else {
      // Format data agar sesuai BookmarkPage
    await StorySource.saveBookmark({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      lat: story.lat,
      lon: story.lon, 
    });
    return true; 
  }
}
};

export default HomePresenter;
