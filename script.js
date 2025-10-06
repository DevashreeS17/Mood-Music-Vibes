const buttons = document.querySelectorAll(".moods button");
const trackName = document.getElementById("track-name");
const playerWrap = document.getElementById("spotify-player");
const loading = document.getElementById("loading");
const equalizer = document.getElementById("equalizer");
const searchInput = document.getElementById("spotify-search");
const playBtn = document.getElementById("play-btn");
const metaAuthor = document.getElementById("meta-author");
const metaThumb = document.getElementById("meta-thumb");

const playlists = {
    happy: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC",
    sad: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVV27DiNWxkR",
    calm: "https://open.spotify.com/embed/playlist/37i9dQZF1DWU0ScTcjJBdj",
    energetic: "https://open.spotify.com/embed/playlist/37i9dQZF1DX70RN3TfWWJh"
};

const backgrounds = {
    happy: "linear-gradient(to right, #ffcc70, #ff9966)",
    sad: "linear-gradient(to right, #667db6, #0082c8)",
    calm: "linear-gradient(to right, #a8edea, #fed6e3)",
    energetic: "linear-gradient(to right, #f7971e, #ffd200)"
};

function setNowPlayingText(text) {
    trackName.textContent = text;
}

function createIframe(src) {
    playerWrap.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = "300";
    iframe.height = "380";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.style.borderRadius = "12px";
    iframe.setAttribute("title", "Spotify preview");
    playerWrap.appendChild(iframe);
}

function showLoading(show = true) {
    loading.style.display = show ? "block" : "none";
}

function showEqualizer(show = true) {
    equalizer.style.display = show ? "flex" : "none";
}

function buildSpotifyEmbedUrl(input) {
    if (!input || typeof input !== "string") return null;
    input = input.trim();

    if (input.startsWith("spotify:")) {
        const parts = input.split(":");
        if (parts.length >= 3) {
            const type = parts[1];
            const id = parts[2];
            return `https://open.spotify.com/embed/${type}/${id}`;
        }
        return null;
    }

    try {
        if (!/^https?:\/\//i.test(input)) input = "https://" + input;
        const url = new URL(input);
        if (!url.hostname.includes("spotify.com")) return null;

        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length < 2) return null;

        const type = segments[0];
        const id = segments[1].split("?")[0];
        const allowed = ["track", "playlist", "album", "artist", "show", "episode"];
        if (!allowed.includes(type)) return null;

        return `https://open.spotify.com/embed/${type}/${id}`;
    } catch {
        return null;
    }
}

async function fetchOEmbed(originalUrl) {
    try {
        const lookup = originalUrl.replace("/embed", "");
        const oembedUrl = "https://open.spotify.com/oembed?url=" + encodeURIComponent(lookup);
        const resp = await fetch(oembedUrl);
        if (!resp.ok) return null;
        const data = await resp.json();
        return {
            title: data.title || "",
            author: data.author_name || "",
            thumbnail: data.thumbnail_url || ""
        };
    } catch {
        return null;
    }
}

// Mood button behavior
buttons.forEach(button => {
    button.addEventListener("click", async () => {
        const mood = button.dataset.mood;
        if (!mood || !playlists[mood]) return;

        buttons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        if (!document.body.classList.contains("dark")) {
            document.body.style.background = backgrounds[mood];
        }

        setNowPlayingText(`Now Playing: ${mood} playlist`);
        showLoading(true);
        showEqualizer(false);

        setTimeout(async () => {
            createIframe(playlists[mood]);
            const meta = await fetchOEmbed(playlists[mood]);
            if (meta) {
                setNowPlayingText(meta.title || `Now Playing: ${mood} playlist`);
                metaAuthor.textContent = meta.author || "";
                if (meta.thumbnail) {
                    metaThumb.src = meta.thumbnail;
                    metaThumb.alt = `${meta.title} cover`;
                    metaThumb.style.display = "block";
                } else {
                    metaThumb.style.display = "none";
                }
            }
            showLoading(false);
            showEqualizer(true);
        }, 700);
    });
});

// Custom link playback
playBtn.addEventListener("click", async () => {
    const raw = searchInput.value.trim();
    if (!raw) {
        alert("Please paste a Spotify song or playlist link!");
        return;
    }

    const embedUrl = buildSpotifyEmbedUrl(raw);
    if (!embedUrl) {
        alert("Invalid Spotify link. Please paste a full track, playlist, or album URL.");
        return;
    }

    setNowPlayingText("Now Playing: Custom Spotify Track");
    showLoading(true);
    showEqualizer(false);
    createIframe(embedUrl);

    const openUrl = embedUrl.replace("/embed", "");
    const meta = await fetchOEmbed(openUrl);
    if (meta) {
        setNowPlayingText(meta.title || "Now Playing: Custom Spotify Track");
        metaAuthor.textContent = meta.author || "";
        if (meta.thumbnail) {
            metaThumb.src = meta.thumbnail;
            metaThumb.alt = `${meta.title} cover`;
            metaThumb.style.display = "block";
        } else {
            metaThumb.style.display = "none";
        }
    }

    showLoading(false);
    showEqualizer(true);
});

// Floating background shapes
const shapesContainer = document.getElementById("shapes-container");
for (let i = 0; i < 15; i++) {
    const shape = document.createElement("div");
    shape.classList.add("shape");
    shape.style.left = Math.random() * 100 + "vw";
    shape.style.width = 12 + Math.random() * 36 + "px";
    shape.style.height = shape.style.width;
    shape.style.animationDuration = 6 + Math.random() * 8 + "s";
    shapesContainer.appendChild(shape);
}

// Toggle buttons
const compactToggle = document.getElementById("compact-toggle");
const themeToggle = document.getElementById("theme-toggle");
const motionToggle = document.getElementById("motion-toggle");
const contrastToggle = document.getElementById("contrast-toggle");
const BODY = document.body;

const THEME_KEY = "moodMusic:theme";
const COMPACT_KEY = "moodMusic:compact";
const MOTION_KEY = "moodMusic:reducedMotion";
const CONTRAST_KEY = "moodMusic:highContrast";

function load(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function save(key, value) {
    try { localStorage.setItem(key, value); } catch { }
}

function applySavedPreferences() {
    if (load(THEME_KEY) === "dark") {
        BODY.classList.add("dark");
        themeToggle.setAttribute("aria-pressed", "true");
        BODY.style.background = "linear-gradient(to right, #1e1e1e, #2c2c2c)";
    }
    if (load(COMPACT_KEY) === "on") {
        BODY.classList.add("compact");
        compactToggle.setAttribute("aria-pressed", "true");
    }
    if (load(MOTION_KEY) === "on") {
        BODY.classList.add("reduce-motion");
        motionToggle.setAttribute("aria-pressed", "true");
    }
    if (load(CONTRAST_KEY) === "on") {
        BODY.classList.add("high-contrast");
        contrastToggle.setAttribute("aria-pressed", "true");
    }
}

themeToggle.addEventListener("click", () => {
    const isDark = BODY.classList.toggle("dark");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    save(THEME_KEY, isDark ? "dark" : "light");
    BODY.style.background = isDark
        ? "linear-gradient(to right, #1e1e1e, #2c2c2c)"
        : backgrounds[document.querySelector(".moods button.active")?.dataset.mood || "happy"];
});

compactToggle.addEventListener("click", () => {
    const isCompact = BODY.classList.toggle("compact");
    compactToggle.setAttribute("aria-pressed", isCompact ? "true" : "false");

    compactToggle.setAttribute("aria-pressed", isCompact ? "true" : "false");
    save(COMPACT_KEY, isCompact ? "on" : "off");
});

motionToggle.addEventListener("click", () => {
    const isReduced = BODY.classList.toggle("reduce-motion");
    motionToggle.setAttribute("aria-pressed", isReduced ? "true" : "false");
    save(MOTION_KEY, isReduced ? "on" : "off");
});

contrastToggle.addEventListener("click", () => {
    const isHighContrast = BODY.classList.toggle("high-contrast");
    contrastToggle.setAttribute("aria-pressed", isHighContrast ? "true" : "false");
    save(CONTRAST_KEY, isHighContrast ? "on" : "off");
});

// Apply preferences on page load
applySavedPreferences();

