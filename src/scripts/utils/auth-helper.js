const AuthHelper = {
  getToken() {
    return localStorage.getItem('token');
  },
  setToken(token) {
    localStorage.setItem('token', token);
  },
  clearToken() {
    localStorage.removeItem('token');
  }
};

export default AuthHelper;
