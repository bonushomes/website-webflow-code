/*
  Global Segment Events
  - CTA_GetOffer_Click: User clicks "Get my offer" CTA
  - Preform_Address_Init: User focuses address field on pre-form
  - Preform_Address_Submit: User submits pre-form address
*/

(function globalSegmentEvents() {
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
  function trackCTA_GetOffer_Click(ctaLocation = "header") {
    try {
      if (typeof analytics !== "undefined") {
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
        analytics.track("Preform_Address_Init", {
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
        const cityState = parseAddressToCityState(address);
        analytics.track("Preform_Address_Submit", {
          address: cityState,
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
      'button:contains("Get my offer")',
      'a:contains("Get my offer")',
    ];

    ctaSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.addEventListener("click", () => {
          const location = element.dataset.location || "header";
          trackCTA_GetOffer_Click(location);
        });
      });
    });

    // Preform_Address_Init - Focus on address input
    const addressInputs = document.querySelectorAll('[data-input="address"]');
    addressInputs.forEach((input) => {
      input.addEventListener("focus", trackPreform_Address_Init);
    });

    // Preform_Address_Submit - Submit on address form
    const addressSubmitBtns = document.querySelectorAll(
      '[data-submit="home-address"]'
    );
    addressSubmitBtns.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Find the associated address input
        const form = button.closest("form");
        const addressInput = form
          ? form.querySelector('[data-input="address"]')
          : null;
        const address = addressInput ? addressInput.value : "";

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
