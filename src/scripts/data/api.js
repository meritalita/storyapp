import CONFIG from '../config';

const ENDPOINTS = {
  ENDPOINT: `${CONFIG.BASE_URL}/stories`,
};

export async function getData() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  const fetchResponse = await fetch(ENDPOINTS.ENDPOINT, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!fetchResponse.ok) {
    throw new Error('FAILED_TO_GET_STORIES');
  }

  const result = await fetchResponse.json();
  return result.listStory;
}

function encodeKey(key) {
  return btoa(String.fromCharCode(...new Uint8Array(key)));
}

export async function subscribePushNotification(subscription) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');

  if (!p256dh || !auth) {
    console.error('SUBSCRIPTION.getKey() gagal:', subscription);
    throw new Error('SUBSCRIPTION_KEYS_NOT_FOUND');
  }

  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: encodeKey(p256dh),
      auth: encodeKey(auth),
    },
  };

  console.log('PAYLOAD YANG DIKIRIM KE BACKEND:', payload);

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error('Gagal mendaftarkan subscription ke server');
  }

  return await response.json();
}

export async function unsubscribePushNotification(subscription) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  const payload = {
    endpoint: subscription.endpoint,
  };

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error('Gagal menghapus subscription di server');
  }

  return await response.json();
}

