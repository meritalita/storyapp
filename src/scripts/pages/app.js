import routes from "../routes/routes"; 
import { getActiveRoute } from "../routes/url-parser";
import { subscribe, unsubscribe, isSubscribed } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #activePage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupPushNotificationButton();
    this._setupBookmarkButton(); 
  }
  _setupBookmarkButton() {
  const bookmarkBtn = document.getElementById('bookmark-button');
  if (!bookmarkBtn) return;

  bookmarkBtn.addEventListener('click', () => {
    window.location.hash = '#/bookmark';  // Ganti sesuai path bookmark di routes
  });
}


  _setupPushNotificationButton() {
    const subscribeBtn = document.getElementById('push-subscribe-btn');
    if (!subscribeBtn) return;

    // Atur status tombol saat init
    this._updateSubscribeButton(subscribeBtn);

    // Event klik tombol subscribe/unsubscribe
    subscribeBtn.addEventListener('click', async () => {
      const subscribed = await isSubscribed();
      if (subscribed) {
        // Jika sudah subscribe, maka unsubscribe
        await unsubscribe();
      } else {
        // Jika belum, subscribe
        await subscribe();
      }
      // Update status tombol setelah aksi
      this._updateSubscribeButton(subscribeBtn);
    });
  }

  async _updateSubscribeButton(button) {
    const subscribed = await isSubscribed();
    if (subscribed) {
      button.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
      button.classList.add('unsubscribe-button');
      button.classList.remove('subscribe-button');
    } else {
      button.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
      button.classList.add('subscribe-button');
      button.classList.remove('unsubscribe-button');
    }
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  renderNavigationDrawer() {
    const navList = this.#navigationDrawer.querySelector("#nav-list");
    const token = localStorage.getItem("token");

    if (!token) {
      navList.innerHTML = `
        <li><a href="#/"><i class="fas fa-book"></i> Beranda</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
      `;
    } else {
      navList.innerHTML = `
        <li><a href="#/"><i class="fas fa-book"></i> Beranda</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="#/add"><i class="fas fa-plus-circle"></i> Add Story</a></li>
        <li><a href="#/logout" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `;

      const logoutLink = this.#navigationDrawer.querySelector("#logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("token");

          if (document.startViewTransition) {
            document
              .startViewTransition(() => {
                this.renderNavigationDrawer();
                this.#content.innerHTML = "";
              })
              .finished.then(() => {
                window.location.hash = "#/login";
              });
          } else {
            this.renderNavigationDrawer();
            window.location.hash = "#/login";
          }
        });
      }
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          this.renderNavigationDrawer();
          this.#content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
        });
      } else {
        this.renderNavigationDrawer();
        this.#content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
      }
      return;
    }

    if (this.#activePage?.cleanup) {
      this.#activePage.cleanup();
    }

    const newContent = await page.render();

    if (document.startViewTransition) {
      document
        .startViewTransition(() => {
          this.renderNavigationDrawer();
          this.#content.innerHTML = newContent;
        })
        .finished.then(async () => {
          await page.afterRender();
        });
    } else {
      this.renderNavigationDrawer();
      this.#content.innerHTML = newContent;
      await page.afterRender();
    }

    this.#activePage = page;
  }
}

export default App;
