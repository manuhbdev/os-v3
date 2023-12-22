export async function get_battery() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return battery;
    } catch (error) {
      console.warn('Battery API, Error', error);
    }
  } else {
    console.warn('Battery API not available');
  }
}
