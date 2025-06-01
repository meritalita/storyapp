import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import LoginPage from '../pages/login/login-page.js';  // Untuk Mengimport halaman login
import AddPage from '../pages/add/add-page.js';
import RegisterPresenter from '../presenter/register-presenter.js';
import LogoutPage from '../pages/logout/logout-page.js';
import BookmarkPage from '../pages/bookmark-page.js';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/add': new AddPage(),  // Untuk #add Agar diketahui
  '/register': new RegisterPresenter(),
  '/logout': new LogoutPage(),
  '/bookmark': new BookmarkPage(), 
}
export default routes;

