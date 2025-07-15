// Unified UTM + Segment Tracking - Handles Both Homeowner and Agent Forms
// Place this in Webflow Custom Code > Head or Footer

(function () {
  "use strict";

  // 1. UTM Retrieval Function
  function getUtms() {
    const utms = {};
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_keyword",
      "utm_content",
    ].forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        utms[key] = value;
      }
    });
    return utms;
  }

  // 1.5. UTM Parameters for API Payloads
  function getUtmParams() {
    const utms = getUtms();
    return {
      source: utms.utm_source || "",
      medium: utms.utm_medium || "",
      keyword: utms.utm_keyword || "",
      content: utms.utm_content || "",
      campaign: utms.utm_campaign || "",
    };
  }

  // 2. UTM Capture and Storage (runs on every page load)
  function saveUtms() {
    const params = new URLSearchParams(window.location.search);

    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_keyword",
      "utm_content",
    ].forEach((key) => {
      const value = params.get(key);
      if (value) {
        localStorage.setItem(key, value);
      }
    });
  }

  // 3. Save address as user progresses (to capture address from early steps)
  function saveAddress() {
    // Save address if it exists
    const addressInput = document.querySelector('[data-input="address"]');
    if (addressInput && addressInput.value.trim()) {
      sessionStorage.setItem("saved_address", addressInput.value);
    }
  }

  // 4. Universal Segment Event Sender for Final Submissions
  function sendFinalSegmentEvent() {
    // Check if Segment analytics is available
    if (typeof analytics === "undefined") {
      console.warn("Segment analytics not loaded");
      return;
    }

    const utms = getUtms();

    // Get current form data
    const firstName =
      document.querySelector('[data-input="first-name"]')?.value || "";
    const lastName =
      document.querySelector('[data-input="last-name"]')?.value || "";
    const email = document.querySelector('[data-input="email"]')?.value || "";
    const phone = document.querySelector('[data-input="phone"]')?.value || "";
    const source =
      document.querySelector('[data-input="discovery-source"]')?.value || "";
    const brokerage =
      document.querySelector('[data-input="brokerage"]')?.value || "";

    // Get address from current page OR from saved session data
    let homeAddress =
      document.querySelector('[data-input="address"]')?.value || "";
    if (!homeAddress) {
      homeAddress = sessionStorage.getItem("saved_address") || "";
    }

    // Determine form type based on brokerage field existence
    const formType = brokerage ? "agent" : "homeowner";

    const segmentData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      source: source,
      brokerage: brokerage,
      home_address: homeAddress,
      form_type: formType,
      page_url: window.location.href,
      ...utms,
      event_id: "lead-" + Date.now(),
    };

    // Only log and send events on production
    if (
      window.location.hostname === "bonushomes.com" ||
      window.location.hostname === "www.bonushomes.com"
    ) {
      console.log(`✅ Sending Lead Submitted to Segment:`, segmentData);
      analytics.track("Lead Submitted", segmentData);

      if (typeof fbq === "function") {
        const fbPayload = {
          action_source: "website",
          event_name: "Lead",
          event_time: new Date().toISOString(),
          user_data: {
            email: segmentData.email,
            phone: segmentData.phone,
            firstName: segmentData.first_name,
            lastName: segmentData.last_name,
            client_user_agent: navigator.userAgent,
          },
          app_data_field: {
            home_address: segmentData.home_address,
            form_type: segmentData.form_type,
            source: segmentData.source,
            brokerage: segmentData.brokerage,
          },
          locale: navigator.language,
          deviceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          event_source_url: window.location.href,
          value: 0,
          currency: "USD",
        };
        console.log("FB Payload:", fbPayload);
        fbq("track", "Lead", fbPayload, { eventID: segmentData.event_id });
      } else {
        console.warn("Meta Pixel (fbq) not available");
      }
    }
  }

  // 5. Initialize UTM capture immediately
  saveUtms();

  // 6. Set up address saving on form interactions
  function setupAddressSaving() {
    // Save address when address validation button is clicked
    const addressValidationButton = document.querySelector(
      '[data-trigger="address-validation"]'
    );
    if (addressValidationButton) {
      addressValidationButton.addEventListener("click", function () {
        saveAddress();
      });
    }
  }

  // 7. Set up final submission tracking when DOM is ready
  function initSegmentTracking() {
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const currentStep = urlParams.get("step");

    // Set up address saving for all form pages
    if (currentPath.includes("/form")) {
      setupAddressSaving();
    }

    // Set up final submission tracking based on page
    if (currentPath === "/form-agent" || currentPath.includes("/form-agent")) {
      setupAgentFormFinalSubmit();
    } else if (
      currentPath === "/form" ||
      (currentPath.includes("/form") && !currentPath.includes("/form-agent"))
    ) {
      setupHomeownerFormFinalSubmit();
    } else if (
      currentPath === "/submit-not-in-zip" ||
      currentPath.includes("/submit-not-in-zip")
    ) {
      setupNotInAreaFinalSubmit();
    } else if (
      currentPath === "/submit-home-disqualified" ||
      currentPath.includes("/submit-home-disqualified")
    ) {
      setupDoesNotQualifyFinalSubmit();
    } else if (
      currentPath === "/submit-agent-fail-not-in-state" ||
      currentPath.includes("/submit-agent-fail-not-in-state")
    ) {
      setupAgentNotInAreaFinalSubmit();
    }
  }

  function setupHomeownerFormFinalSubmit() {
    const finalSubmitButton = document.querySelector('[data-alt="submit"]');

    if (finalSubmitButton) {
      finalSubmitButton.addEventListener("click", function (event) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentStep = urlParams.get("step");

        // Step 5: Final homeowner form submission
        if (currentStep === "5") {
          const isValid =
            typeof validateFormInput === "function"
              ? validateFormInput("5")
              : true;
          const legalCheckbox = document.querySelector("#legal-checkbox");
          const legalChecked = legalCheckbox && legalCheckbox.checked;

          if (isValid && legalChecked) {
            sendFinalSegmentEvent();
          }
        }
        // Step 6: Does not qualify agent pitch submission
        else if (currentStep === "6") {
          const legalCheckbox = document.querySelector("#legal-checkbox");
          const legalChecked = legalCheckbox ? legalCheckbox.checked : true;

          if (legalChecked) {
            sendFinalSegmentEvent();
          }
        }
      });
    }
  }

  function setupAgentFormFinalSubmit() {
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener("click", function (event) {
        const step2 = document.querySelector('[data-step="2"]');
        const step1 = document.querySelector('[data-step="1"]');

        const isOnStep2 =
          (step2 && window.getComputedStyle(step2).display !== "none") ||
          (step1 && window.getComputedStyle(step1).display === "none");

        if (isOnStep2) {
          const isValid =
            typeof validateFormInput === "function"
              ? validateFormInput("2")
              : true;
          const legalCheckbox = document.querySelector("#legal-checkbox");
          const legalChecked = legalCheckbox && legalCheckbox.checked;

          if (isValid && legalChecked) {
            sendFinalSegmentEvent();
          }
        }
      });
    }
  }

  function setupNotInAreaFinalSubmit() {
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener("click", function (event) {
        const isValid =
          typeof validateFormInput === "function" ? validateFormInput() : true;
        const legalCheckbox = document.querySelector("#legal-checkbox");
        const legalChecked = legalCheckbox && legalCheckbox.checked;

        if (isValid && legalChecked) {
          sendFinalSegmentEvent();
        }
      });
    }
  }

  function setupDoesNotQualifyFinalSubmit() {
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener("click", function (event) {
        const isValid =
          typeof validateFormInput === "function" ? validateFormInput() : true;
        const legalCheckbox = document.querySelector("#legal-checkbox");
        const legalChecked = legalCheckbox && legalCheckbox.checked;

        if (isValid && legalChecked) {
          sendFinalSegmentEvent();
        }
      });
    }
  }

  function setupAgentNotInAreaFinalSubmit() {
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener("click", function (event) {
        const isValid =
          typeof validateFormInput === "function" ? validateFormInput() : true;
        const legalCheckbox = document.querySelector("#legal-checkbox");
        const legalChecked = legalCheckbox ? legalCheckbox.checked : true;

        if (isValid && legalChecked) {
          sendFinalSegmentEvent();
        }
      });
    }
  }

  // 8. Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSegmentTracking);
  } else {
    initSegmentTracking();
  }

  // 9. Debug functions
  window.checkUtms = function () {
    console.log("Current UTMs:", getUtms());
    return getUtms();
  };

  window.getUtmParams = function () {
    return getUtmParams();
  };

  window.checkSavedAddress = function () {
    console.log("Saved address:", sessionStorage.getItem("saved_address"));
  };

  window.testSegmentTracking = function () {
    sendFinalSegmentEvent();
  };
})();
