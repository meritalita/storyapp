import CONFIG from '../config.js';
import AuthHelper from '../utils/auth-helper.js';

class StoryAPI {
  static async getStories() {
    const token = AuthHelper.getToken();
    if (!token) throw new Error('TOKEN_NOT_FOUND');

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('FAILED_TO_GET_STORIES');
    }

    const result = await response.json();
    return result.listStory;
  }

  static async postStory(story) {
    const token = AuthHelper.getToken();
    if (!token) throw new Error('TOKEN_NOT_FOUND');

    // Ubah photoUrl (base64) jadi Blob
    const blob = await fetch(story.photoUrl).then(res => res.blob());
    const file = new File([blob], 'photo.png', { type: blob.type });

    const formData = new FormData();
    formData.append('description', story.description);
    formData.append('photo', file);
    if (story.lat !== undefined && story.lon !== undefined) {
      formData.append('lat', story.lat);
      formData.append('lon', story.lon);
    }

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('FAILED_TO_POST_STORY');
    }

    const result = await response.json();
    return result;
  }

  static async login(email, password) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();  // ambil pesan error dari server
    console.log('Login response:', result);
    
    if (!response.ok) {
      throw new Error('LOGIN_FAILED');
    }
    return result.loginResult.token;
  }

  static async register(name, email, password) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Register API error:', result);
      throw new Error(result.message || 'REGISTER_FAILED');
    }
    return result;
  }
}

export default StoryAPI;
