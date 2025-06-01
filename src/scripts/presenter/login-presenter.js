import StoryAPI from '../services/story-api';
import AuthHelper from '../utils/auth-helper';

class LoginPresenter {
  async login(email, password) {
    const token = await StoryAPI.login(email, password);
    AuthHelper.setToken(token);
    return token;
  }
};

export default LoginPresenter;
