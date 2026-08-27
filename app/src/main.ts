import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/** Fades out the boot loader from index.html, then takes it out of the DOM. */
function dismissBootLoader() {
  const el = document.getElementById('awd-boot');
  if (!el) {
    return;
  }
  if (el.hidden) {
    el.remove();
    return;
  }
  // A boot that beat the fade-in delay never reaches opacity 1, so there is no
  // transition to wait on - a timer covers both cases. Keep it >= the 0.45s fade.
  el.style.pointerEvents = 'none';
  el.classList.remove('in');
  setTimeout(() => el.remove(), 500);
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err))
  .finally(dismissBootLoader);
