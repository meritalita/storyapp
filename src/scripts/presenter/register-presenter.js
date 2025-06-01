import RegisterView from './register-view.js';
import StoryAPI from '../data/story-api.js';

class RegisterPresenter {
  async render() {
    const container = document.getElementById('app');
    RegisterView.mount(container);
    RegisterView.afterRender(this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { name, email, password } = RegisterView.getFormData();

    if (!name || !email || !password) {
      RegisterView.setMessage('Please fill in all fields.', 'error');
      return;
    }

    RegisterView.toggleButton(true);
    RegisterView.setMessage('Registering...');

    try {
      await StoryAPI.register(name, email, password);
      RegisterView.setMessage('Registration successful! Please login.', 'success');

      setTimeout(() => {
        RegisterView.redirectToLogin();
      }, 1500);
    } catch (error) {
      RegisterView.setMessage('Registration failed: ' + error.message, 'error');
    } finally {
      RegisterView.toggleButton(false);
    }
  }
};

export default RegisterPresenter;
