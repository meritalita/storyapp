const RegisterView = {
  render() {
    return `
      <section class="auth-container register">
        <h2>Register</h2>
        <form id="registerForm">
          <label for="name" class="sr-only">Name</label>
          <input type="text" id="name" placeholder="Name" required />

          <label for="email" class="sr-only">Email</label>
          <input type="email" id="email" placeholder="Email" required />

          <label for="password" class="sr-only">Password</label>
          <input type="password" id="password" placeholder="Password" required />

          <button type="submit">Register</button>
          <p id="message"></p>
        </form>
      </section>
    `;
  },

  mount(container) {
    container.innerHTML = this.render();
  },

  afterRender(onSubmit) {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', onSubmit);
  },

  getFormData() {
    return {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };
  },

  setMessage(text, type = '') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = '';
    if (type) message.classList.add(type);
  },

  toggleButton(disabled) {
    const button = document.querySelector('#registerForm button');
    button.disabled = disabled;
  },

  redirectToLogin() {
    window.location.hash = '#/login';
  }
};

export default RegisterView;
