import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';



export async function isSubscribed() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription !== null;
}

export async function unsubscribe() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    try {
      await subscription.unsubscribe();
      await unsubscribePushNotification(subscription);
      alert('Berhasil berhenti berlangganan notifikasi!');
    } catch (error) {
      alert('Gagal membatalkan subscription.');
      console.error(error);
    }
  } else {
    alert('Tidak ada subscription aktif.');
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Browser tidak mendukung notifikasi!');
    return false;
  }

  const status = await Notification.requestPermission();
  return status === 'granted';
}

export async function subscribe() {
  const permission = await requestNotificationPermission();
  if (!permission) {
    alert('Izin notifikasi tidak diberikan');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log('SUBSCRIPTION:', subscription);
  console.log('SUBSCRIPTION KEYS:', subscription.keys);

  try {
    await subscribePushNotification(subscription);
    alert('Berhasil berlangganan notifikasi!');
  } catch (error) {
    alert('Gagal berlangganan push notification.');
    console.error(error);
  }
}