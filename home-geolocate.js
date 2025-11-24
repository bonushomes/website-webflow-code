$(document).ready(function () {
  const cityImages = {
    "birmingham, alabama":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb2d99dccd3ddfa49a55_Bonus-Homes-Birmingham.png",
    "charleston, south carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb37b1dde4d865189efd_Bonus-Homes-Charleston.png",
    "charlotte, north carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb40cb9b13f94f69d17b_Bonus-Homes-charlotte.png",
    "cincinnati, ohio":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb4859b8b3c343f8e487_Bonus-Homes-Cinncinatti.png",
    "cleveland, ohio":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb538576ccbe7499cfec_Bonus-Homes-Cleveland.png",
    "colorado springs, colorado":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb5c1c00b2be71b14bd2_Bonus-Homes-CO-springs.png",
    "columbia, south carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb6cbdcd5442127ed7bc_Bonus-Homes-Columbia-SC.png",
    "columbus, ohio":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb768b9694879436e32b_Bonus-Homes-Columbus-OH.png",
    "dallas, texas":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb7f3d51adfc910366a2_Bonus-Homes-Dallas.png",
    "durham, north carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb873f56042ca49579a4_Bonus-Homes-Durham.png",
    "greensboro, north carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb90a8b3d1af5e194e7f_Bonus-Homes-Greensboro.png",
    "houston, texas":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cb98e145910c6f678e17_Bonus-Homes-Houston.png",
    "indianapolis, indiana":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbaac16bf5bbbf7066f4_Bonus-Homes-Indiana.png",
    "kansas city, missouri":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbb381c731a580c2ee19_Bonus-Homes-Kansas-City.-MO.png",
    "kansas city, kansas":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbbd3f56042ca4958d26_Bonus-Homes-Kansas.png",
    "las vegas, nevada":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbcd8bc3cf7afd1039ed_Bonus-Homes-Vegas.png",
    "memphis, tennessee":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbd785117fec80774627_Bonus-Homes-Memphis.png",
    "minneapolis, minnesota":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbde81c731a580c2fa1f_Bonus-Homes-Minniapollis.png",
    "nashville, tennessee":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbe74c6b2613b31bcd15_Bonus-Homes-Nashville.png",
    "phoenix, arizona":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbf168615b04b5f995b6_Bonus-Homes-Phoenix.png",
    "raleigh, north carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cbfb4c6b2613b31bd213_Bonus-Homes-_Raleigh.png",
    "reno, nevada":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cc0646802f357828a423_Bonus-Homes-Reno.png",
    "salt lake city, utah":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cc0ebed3c419bd523aa4_Bonus-Homes-Salt-lake-city.png",
    "st. louis, missouri":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cc1782b9a9683471cddf_Bonus-Homes-St-Louis.png",
    "tucson, arizona":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cc209d5456309f010c47_Bonus-Homes-Tucson.png",
    "winston-salem, north carolina":
      "https://cdn.prod.website-files.com/6750b4595d26a3eb735dc780/6865cc2d59e43940b865762d_Bonus-Homes-Winston-Salem.png",
  };

  const HERO_FADE_DURATION = 400;
  let currentHeroUrl = "";

  // Also add single-state mappings for broader fallback
  Object.keys(cityImages).forEach((key) => {
    const state = key.split(", ")[1];
    if (state && !cityImages[state]) {
      cityImages[state] = cityImages[key];
    }
  });

  const $heroImage = $(".home_hero-header_image");
  if (!$heroImage.length) {
    console.warn("[home-geolocate] Hero image element not found");
    return;
  }
  if ($heroImage.is("picture")) {
    $heroImage.find("img").css("opacity", 0);
  } else {
    $heroImage.css("opacity", 0);
  }

  const backgroundImage = $heroImage.css("background-image");
  let defaultImage = "";

  if (backgroundImage && backgroundImage !== "none") {
    defaultImage = backgroundImage.replace(/url\(|\)|"|'/g, "");
    console.log("[home-geolocate] Found background image fallback", {
      defaultImage,
    });
  } else if ($heroImage.is("img")) {
    defaultImage = $heroImage.attr("src") || "";
    console.log("[home-geolocate] Found <img> src fallback", { defaultImage });
  } else {
    defaultImage = $heroImage.find("img").attr("src") || "";
    console.log("[home-geolocate] Found nested <img> src fallback", {
      defaultImage,
    });
  }

  if (!defaultImage) {
    console.warn("[home-geolocate] No default hero image detected");
  } else {
    currentHeroUrl = defaultImage;
  }

  // Use cached location if available
  const cached = sessionStorage.getItem("userCityState");
  if (cached) {
    console.log("[home-geolocate] Using cached location", { cached });
    const [city, state] = cached.split("|");
    setHeroImage(city, state);
  } else {
    console.log("[home-geolocate] Requesting IP location from ipapi");
    $.get("https://ipapi.co/json/", function (data) {
      console.log("[home-geolocate] Received ipapi response", { data });
      const city = data.city || "";
      const region = data.region || "";
      sessionStorage.setItem("userCityState", `${city}|${region}`);
      setHeroImage(city, region);
    }).fail(function () {
      console.error(
        "[home-geolocate] ipapi request failed, reverting to default image"
      );
      setHeroImage("", "");
    });
  }

  function setHeroImage(city, region) {
    const cityKey = `${city.toLowerCase()}, ${region.toLowerCase()}`;
    const stateKey = region.toLowerCase();
    const imageUrl =
      cityImages[cityKey] || cityImages[stateKey] || defaultImage;
    const $hero = $heroImage;
    const $imgTarget = $hero.is("picture")
      ? $hero.find("img").first()
      : $hero;
    const $sources = $hero.is("picture") ? $hero.find("source") : $();

    console.log("[home-geolocate] setHeroImage invoked", {
      city,
      region,
      cityKey,
      stateKey,
      imageUrl,
      heroIsPicture: $hero.is("picture"),
    });

    if (!imageUrl) {
      console.warn("[home-geolocate] No matching image found, keeping current");
      return;
    }

    if (!$imgTarget.length) {
      console.warn("[home-geolocate] Hero image element not found");
      return;
    }

    if (currentHeroUrl === imageUrl) {
      console.log("[home-geolocate] Hero already showing requested image");
      ensureHeroVisible($imgTarget);
      return;
    }

    swapHeroImage($imgTarget, $sources, imageUrl);
  }

  function swapHeroImage($img, $sources, url) {
    const fadeOutAndSwap = () => {
      $img.stop(true, true).fadeTo(HERO_FADE_DURATION, 0, () => {
        applyImageAttributes($img, $sources, url);
        $img.fadeTo(HERO_FADE_DURATION, 1);
      });
    };

    console.log("[home-geolocate] Starting hero swap animation", { url });

    const preload = new Image();
    preload.onload = function () {
      console.log("[home-geolocate] Preloaded hero image", { url });
      fadeOutAndSwap();
    };
    preload.onerror = function () {
      console.warn(
        "[home-geolocate] Failed to preload hero image, swapping anyway",
        { url }
      );
      fadeOutAndSwap();
    };

    // Start preload after ensuring opacity is zero so the final image fades in smoothly
    if (!$img.data("homeGeolocateVisible")) {
      $img.css("opacity", 0);
    }

    preload.src = url;
  }

  function applyImageAttributes($img, $sources, url) {
    $img.attr("src", url);
    if ($img.attr("srcset")) {
      $img.attr("srcset", url);
    }
    if ($img.attr("data-srcset")) {
      $img.attr("data-srcset", url);
    }
    if ($img.attr("data-src")) {
      $img.attr("data-src", url);
    }

    $sources.each(function (index, sourceEl) {
      const $source = $(sourceEl);
      if ($source.attr("srcset")) {
        $source.attr("srcset", url);
      }
      if ($source.attr("data-srcset")) {
        $source.attr("data-srcset", url);
      }
      if ($source.attr("data-src")) {
        $source.attr("data-src", url);
      }
      console.log("[home-geolocate] Updated <source> attributes", { index });
    });

    currentHeroUrl = url;
    $img.data("homeGeolocateVisible", true);
  }

  function ensureHeroVisible($img) {
    if (!$img.length || $img.data("homeGeolocateVisible")) {
      return;
    }

    console.log("[home-geolocate] Revealing hero image without swap");
    $img.stop(true, true).fadeTo(HERO_FADE_DURATION, 1, () => {
      $img.data("homeGeolocateVisible", true);
    });
  }
});
