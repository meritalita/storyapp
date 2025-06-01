import LoginPresenter from "../../presenter/login-presenter";

export default class LoginPage {
  async render() {
    return `
      <section class="auth-container login">
        <h1>Login</h1>
        <form id="loginForm">
          <label for="email" class="sr-only">Email</label>
          <input type="email" id="email" placeholder="Email" required />

          <label for="password" class="sr-only">Password</label>
          <input type="password" id="password" placeholder="Password" required />

          <button type="submit">Login</button>
          <p id="message"></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('message');
    const button = form.querySelector('button');

    const loginPresenter = new LoginPresenter();
     
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      message.textContent = '';
      message.className = '';

      if (!email || !password) {
        message.textContent = 'Please enter email and password.';
        message.classList.add('error');
        return;
      }

      button.disabled = true;
      message.textContent = 'Logging in...';

      try {
        const token = await loginPresenter.login(email, password);
        message.textContent = 'Login berhasil!';
        message.classList.add('success');

        if (window.appInstance) {
          window.appInstance.renderNavigationDrawer();
        }

        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } catch {
        message.textContent = 'Login gagal. Coba lagi.';
        message.classList.add('error');
      } finally {
        button.disabled = false;
      }
    });
  }
}
