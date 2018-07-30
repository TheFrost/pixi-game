// hack reload to parceljs
if (module.hot) module.hot.dispose(() => window.location.reload());

// -------------------------
import App from './js/app';

const container = document.querySelector('.game-wrap');
const app = new App(container);
app.init();