import { AddView } from '../../view/add-view.js';
import { AddPresenter } from '../../presenter/add-presenter.js';
import { StorySource } from '../../data/story-source.js';
import AuthHelper from '../../utils/auth-helper.js';

export default class AddPage {
  constructor() {
    this.addView = new AddView();

    // Ambil token dari localStorage lalu buat model & presenter
    const token = AuthHelper.getToken();
    const model = new StorySource(token);
    this.presenter = new AddPresenter(this.addView, model);

    // Hubungkan event submit dari view ke presenter
    this.addView.onSubmit = (story) => this.presenter.submitStory(story);
  }

  async render() {
    return this.addView.render();
  }

  async afterRender() {
    await this.addView.afterRender();
  }

  cleanup() {
    this.addView.cleanup?.();
  }
}
