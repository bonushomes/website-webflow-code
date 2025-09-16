/*
  Global Segment Events
  - CTA_GetOffer_Click: User clicks "Get my offer" CTA
  - Preform_Address_Init: User focuses address field on pre-form
  - Preform_Address_Submit: User submits pre-form address
*/

(function globalSegmentEvents() {
  // Prevent re-initialization if this script is executed multiple times
  if (window.__globalSegmentEventsInitialized) {
    return;
  }
  window.__globalSegmentEventsInitialized = true;
  // Simple UUID v4 generator
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Ensure we use the same sessionId across preform and form pages
  function getOrCreateSessionId() {
    try {
      let id = sessionStorage.getItem("form_v2_session_id");
      if (!id) {
        id = uuidv4();
        sessionStorage.setItem("form_v2_session_id", id);
      }
      return id;
    } catch (_) {
      return uuidv4();
    }
  }

  // Parse address to city, state format (e.g., "Corona, CA")
  function parseAddressToCityState(fullAddress) {
    if (!fullAddress || typeof fullAddress !== "string") return "";

    // Remove "USA" if present
    const cleaned = fullAddress.replace(/, USA$/, "").trim();
    const parts = cleaned.split(",").map((p) => p.trim());

    if (parts.length < 2) return "";

    // Get last two parts (city, state)
    const city = parts[parts.length - 2];
    const state = parts[parts.length - 1];

    return `${city}, ${state}`;
  }

  // CTA_GetOffer_Click - User clicks "Get my offer" CTA
  // Debounce duplicate clicks within a short window
  let lastCtaTrackedAt = 0;
  function trackCTA_GetOffer_Click(ctaLocation = "header") {
    try {
      if (typeof analytics !== "undefined") {
        const now = Date.now();
        if (now - lastCtaTrackedAt < 750) {
          // Prevent rapid double-click duplicates
          return;
        }
        lastCtaTrackedAt = now;

        analytics.track("CTA_GetOffer_Click", {
          ctaLocation: ctaLocation,
          eventId: uuidv4(),
        });
      }
    } catch (error) {
      console.error("Error tracking CTA_GetOffer_Click:", error);
    }
  }

  // Preform_Address_Init - User focuses address field on pre-form
  function trackPreform_Address_Init() {
    try {
      if (typeof analytics !== "undefined") {
        const sessionId = getOrCreateSessionId();
        let utms = {};
        try {
          utms =
            typeof window.getUtmParams === "function"
              ? window.getUtmParams()
              : {};
        } catch (_) {}
        analytics.track("Preform_Address_Init", {
          ...utms,
          sessionId,
          eventId: uuidv4(),
        });
      }
    } catch (error) {
      console.error("Error tracking Preform_Address_Init:", error);
    }
  }

  // Preform_Address_Submit - User submits pre-form address
  function trackPreform_Address_Submit(address) {
    try {
      if (typeof analytics !== "undefined") {
        const fullAddress = (address || "").trim();

        // Reuse sessionId for continuity into the form
        const sessionId = getOrCreateSessionId();

        // Save address into the same session context used by the form page
        try {
          const key = "form_v2_context";
          const cur = JSON.parse(sessionStorage.getItem(key) || "{}");
          const next = { ...cur, address: fullAddress };
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch (_) {}

        // Include UTMs when available
        let utms = {};
        try {
          utms =
            typeof window.getUtmParams === "function"
              ? window.getUtmParams()
              : {};
        } catch (_) {}

        analytics.track("Preform_Address_Submit", {
          ...utms,
          sessionId,
          address: fullAddress,
          eventId: uuidv4(),
        });
      }
    } catch (error) {
      console.error("Error tracking Preform_Address_Submit:", error);
    }
  }

  // Wire up event listeners when DOM is ready
  function initializeGlobalEvents() {
    // CTA_GetOffer_Click - Look for various CTA button selectors
    const ctaSelectors = [
      "#get-my-offer",
      '[data-trigger="get-offer"]',
      '[data-cta="get-offer"]',
      ".get-offer-btn",
      ".cta-get-offer",
      // Fallback generic selectors; filtered by text content below
      "button",
      "a",
    ];

    function isGetOfferElement(element) {
      const text = (element.innerText || element.textContent || "")
        .trim()
        .toLowerCase();
      return text.includes("get my offer") || text.includes("get offer");
    }

    ctaSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (
          (selector === "button" || selector === "a") &&
          !isGetOfferElement(element)
        ) {
          return;
        }
        // Use a data-flag to ensure we bind only once per element
        if (element.dataset.ctaOfferBound === "true") return;
        element.dataset.ctaOfferBound = "true";

        element.addEventListener(
          "click",
          () => {
            const location = element.dataset.location || "header";
            trackCTA_GetOffer_Click(location);
          },
          { once: false }
        );
      });
    });

    // Preform_Address_Init - Focus on address input (fire only once per page view)
    const addressInputs = document.querySelectorAll('[data-input="address"]');
    let preformInitFired = false;
    addressInputs.forEach((input) => {
      input.addEventListener(
        "focus",
        () => {
          if (preformInitFired) return;
          preformInitFired = true;
          trackPreform_Address_Init();
        },
        { once: false }
      );
    });

    // Preform_Address_Submit - Submit on address form
    const addressSubmitBtns = document.querySelectorAll(
      '[data-submit="home-address"]'
    );
    addressSubmitBtns.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Find the associated address input
        // 1) Prefer the closest homepage container, 2) fallback to form, 3) fallback to document
        const container =
          button.closest('[data-tag="home-page-input"]') ||
          button.closest("form") ||
          document;

        const addressInput = container.querySelector('[data-input="address"]');
        const address = addressInput ? addressInput.value : "";

        // Flag that we came from preform so the form page can suppress Address_Submit once
        try {
          sessionStorage.setItem("preform_submitted", "true");
        } catch (err) {}

        trackPreform_Address_Submit(address);
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeGlobalEvents);
  } else {
    initializeGlobalEvents();
  }

  // Export functions for manual triggering if needed
  window.trackCTA_GetOffer_Click = trackCTA_GetOffer_Click;
  window.trackPreform_Address_Init = trackPreform_Address_Init;
  window.trackPreform_Address_Submit = trackPreform_Address_Submit;
})();
