import { deepFreeze } from '../../utils';

class Share {
  constructor() {
    this.supported = 'share' in navigator;
  }

  async shareContent(title, text, url = window.location.href) {
    if (this.supported) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        console.log('Sharing successful');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      console.log('Web Share API is not supported in this browser.');
    }
  }
}
export const share = deepFreeze(new Share());
