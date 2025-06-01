import HomePresenter from "../../presenter/home-presenter";
import AuthHelper from "../../utils/auth-helper";
import L from "../../utils/leaflet-init";

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Story</h1>
        <div id="map" class="map-container" style="height: 300px; margin-bottom: 1rem;"></div>
        <div id="stories">Loading...</div>
      </section>
    `;
  }

  async afterRender() {
    const token = AuthHelper.getToken();
    if (!token) {
      document.getElementById("stories").innerHTML = "<p>Silakan login terlebih dahulu.</p>";
      window.location.hash = '#/login';
      return;
    }

    try {
      const presenter = new HomePresenter();
      const allStories = await presenter.getCombinedStories(token);

      const container = document.getElementById("stories");
      container.innerHTML = allStories
        .map(
          (story) => `
          <article class="story-card" style="position: relative;">
            <button class="bookmark-btn ${
              story.isBookmarked ? "active" : ""
            }" data-id="${story.id}">
              <i class="fa${story.isBookmarked ? "s" : "r"} fa-bookmark"></i>
            </button>
            <img src="${story.photoUrl}" alt="Foto oleh ${story.name}">
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <p><small>Lokasi: ${story.lat}, ${story.lon}</small></p>
          </article>
        `
        )
        .join("");

      // Pasang event listener klik bookmark
      document.querySelectorAll(".bookmark-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const storyId = button.dataset.id;
          try {
            const isBookmarked = await presenter.toggleBookmark(storyId, allStories);
            const story = allStories.find((s) => s.id === storyId);
            if (story) story.isBookmarked = isBookmarked;

            if (isBookmarked) {
              button.classList.add("active");
              button.querySelector("i").classList.replace("far", "fas");
            } else {
              button.classList.remove("active");
              button.querySelector("i").classList.replace("fas", "far");
            }

            window.dispatchEvent(
              new CustomEvent("bookmarkChanged", {
                detail: { storyId, isBookmarked },
              })
            );
          } catch (error) {
            console.error("Error toggle bookmark:", error);
          }
        });
      });

      // Pasang listener event bookmarkChanged sekali saja
      if (!this.bookmarkListenerAdded) {
        window.addEventListener("bookmarkChanged", (event) => {
          const { storyId, isBookmarked } = event.detail;

          const story = allStories.find((s) => s.id === storyId);
          if (story) {
            story.isBookmarked = isBookmarked;
          }

          const button = document.querySelector(
            `.bookmark-btn[data-id="${storyId}"]`
          );
          if (button) {
            if (isBookmarked) {
              button.classList.add("active");
              button.querySelector("i").classList.replace("far", "fas");
            } else {
              button.classList.remove("active");
              button.querySelector("i").classList.replace("fas", "far");
            }
          }
        });
        this.bookmarkListenerAdded = true;
      }
      // Inisialisasi peta Leaflet
      const map = L.map("map").setView([-6.2, 106.8], 5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      const markers = [];

      allStories.forEach((story) => {
        if (story.lat != null && story.lon != null) {
          const marker = L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(
              `<strong>${story.name}</strong><br>${story.description}`
            );
          markers.push(marker);
        }
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
      }
    } catch (error) {
      console.error("Error saat memuat story:", error);
      document.getElementById("stories").innerHTML =
        "<p>Gagal memuat data.</p>";
    }
  }
}
