/*
  Form V2
  - 3-step, single-page flow
  - Step 1: Address + eligibility check (no redirect)
  - Step 2: Minimal home info (includes estimated-interest-rate)
  - Step 3: Contact info (includes agent-or-homeowner)
  - Final: Show [data-step="form-success"] or [data-step="address-fail"] based on zip eligibility
  - Send API calls and GTM events throughout
  - NEW: Skip step 1 if address is provided via URL parameters
*/

(function formV2Bootstrap() {
  const SELECTORS = {
    step: "[data-step]".trim(),
    step1: '[data-step="1"]',
    step2: '[data-step="2"]',
    step3: '[data-step="3"]',
    stepSuccess: '[data-step="form-success"]',
    stepFail: '[data-step="address-fail"]',
    stepLoading: '[data-step="loading"]',
    addressInput: '[data-input="address"]',
    addressNextBtn: '[data-trigger="address-validation"]',
    step2NextBtn: '[data-trigger="home-data-validation"]',
    backBtn: '[data-alt="back"]',
    submitBtn: '[data-alt="submit"]',
    displayAddress: '[data-tag="display-address"]',
    // Step 2 fields
    homeValueEst: '[data-input="home-value-est"]',
    estimatedInterestRate: '[data-input="estimated-interest-rate"]',
    monthsToMove: '[data-input="months-to-move"]',
    unknownInterest: '[data-input="unknown-interest"]',
    // Step 3 fields
    firstName: '[data-input="first-name"]',
    lastName: '[data-input="last-name"]',
    email: '[data-input="email"]',
    phone: '[data-input="phone"]',
    agentOrHomeowner: '[data-input="agent-or-homeowner"]',
    discoverySource: '[data-input="discovery-source"]',
    legalConsent: '[data-input="legal-consent"]',
    brokerage: '[data-input="brokerage"]',
  };

  const ENDPOINTS = {
    validateProperty:
      "https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty",
    submitLead:
      "https://vj421enzlj.execute-api.us-west-1.amazonaws.com/prod/submitWebsiteLead",
  };

  const STORAGE_KEYS = {
    structAddress: "struct_address",
    propertyResponse: "api_response_data_address_v2",
    zipEligible: "zip_eligible_v2",
    basePayload: "basePayload_v2",
  };

  const dataLayerPush = (eventName, payload = {}) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...payload });
    } catch (_) {}
  };

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }
  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function setDisplayAddressText(text) {
    qsa(SELECTORS.displayAddress).forEach((el) => {
      el.textContent = text || "";
    });
  }

  function showOnlyStep(stepSelector) {
    const steps = qsa(SELECTORS.step);
    steps.forEach((step) => {
      const isTarget = step.matches(stepSelector);
      step.style.display = isTarget ? "block" : "none";
      if (isTarget) {
        step.style.opacity = "1";
      }
    });
  }

  function showLoading(fromStepSelector) {
    const from = qs(fromStepSelector);
    const loading = qs(SELECTORS.stepLoading);
    if (from && loading) {
      from.style.display = "none";
      loading.style.display = "block";
    }
  }

  function hideLoadingTo(stepSelector) {
    const loading = qs(SELECTORS.stepLoading);
    const to = qs(stepSelector);
    if (loading && to) {
      loading.style.display = "none";
      to.style.display = "block";
      to.style.opacity = "1";
    }
  }

  function getStructAddressFromSession() {
    try {
      const raw =
        sessionStorage.getItem(STORAGE_KEYS.structAddress) ||
        sessionStorage.getItem("struct_address");
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function parseAddressFromInput(formattedAddress) {
    // Fallback parser when session struct address is missing
    if (!formattedAddress || typeof formattedAddress !== "string") {
      return null;
    }
    const cleaned = formattedAddress.replace(", USA", "").trim();
    const parts = cleaned.split(",").map((p) => p.trim());
    if (parts.length < 2) return null;
    const streetAddress = parts[0];
    const last = parts[parts.length - 1];
    const m = last.match(/([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    const state = m ? m[1] : "";
    const zip = m ? m[2] : "";
    const city = parts.slice(1, parts.length - 1).join(", ");
    return { streetAddress, city, state, zipCode: zip };
  }

  function normalizeInterestRate(value) {
    if (!value) return "";
    const numeric = String(value).replace(/[^0-9.]/g, "");
    if (!numeric) return "";
    const n = parseFloat(numeric);
    if (isNaN(n) || n <= 0) return "";
    return n.toString();
  }

  function transformStateToAbbrev(stateName) {
    const map = {
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
      District: "DC",
      "District of Columbia": "DC",
    };
    return map[stateName] || stateName || "";
  }

  function prefillStep2FromPropertyResponse(property) {
    try {
      // Do not prefill estimated home value range; keep default placeholder selected
      const homeValueSelect = qs(SELECTORS.homeValueEst);
      if (homeValueSelect) homeValueSelect.selectedIndex = 0;

      // Do not prefill estimated interest rate; keep it empty for user input
      const estRateEl = qs(SELECTORS.estimatedInterestRate);
      if (estRateEl) estRateEl.value = "";
    } catch (_) {}
  }

  function resetStep2Defaults() {
    const hv = qs(SELECTORS.homeValueEst);
    const rate = qs(SELECTORS.estimatedInterestRate);
    const unknown = qs(SELECTORS.unknownInterest);
    if (hv) {
      hv.selectedIndex = 0;
      hv.classList.remove("is-valid", "is-invalid");
    }
    if (rate) {
      if (!unknown?.checked) {
        rate.value = "";
      }
      rate.classList.remove("is-valid", "is-invalid");
    }
  }

  function buildBasePayload() {
    return {
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      userType: "Homeowner",
      contactInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        bonusDiscoverySource: "",
        homeownerCommunicationConsent: true,
      },
      isQualified: false,
      locationProfile: {
        isInPreferredZipCode: false,
        isInOperatedMSA: false,
        isInOperatedState: false,
        eligibilityCheck: "Failed",
      },
      homeProfile: [
        { id: "ESTIMATED_VALUE", value: "", eligibilityCheck: "Ignored" },
        {
          id: "MORTGAGE_INTEREST_RATE",
          value: "",
          eligibilityCheck: "Ignored",
        },
        { id: "TIME_TO_MOVE", value: "", eligibilityCheck: "Ignored" },
      ],
      reasonUnqualified: "",
    };
  }

  function setHomeProfileValue(basePayload, id, value) {
    const item = basePayload.homeProfile.find((x) => x.id === id);
    if (item) item.value = value || "";
  }

  async function validateAddressAndPrefill() {
    const addressEl = qs(SELECTORS.addressInput);
    if (!addressEl) return { ok: false, reason: "no_address_input" };

    const rawAddress = addressEl.value.trim();
    if (!rawAddress) return { ok: false, reason: "empty_address" };
    if (addressEl.dataset.selected !== "true") {
      return { ok: false, reason: "not_selected_from_autocomplete" };
    }

    // Build address payload
    let payload = null;
    const struct = getStructAddressFromSession();
    if (struct?.components) {
      payload = {
        streetAddress: `${struct.components.streetNumber || ""} ${
          struct.components.street || ""
        }`.trim(),
        city: struct.components.city || "",
        state: transformStateToAbbrev(struct.components.state || ""),
        zipCode: struct.components.zip || "",
      };
    } else {
      payload = parseAddressFromInput(rawAddress);
    }

    if (!payload || !payload.state || !payload.zipCode) {
      return { ok: false, reason: "failed_to_parse_address" };
    }

    // Persist display address
    setDisplayAddressText(rawAddress);

    showLoading(SELECTORS.step1);
    // Generic naming: user clicked address validation (step 1 submit)
    dataLayerPush("Address_Submit", { address_present: true });
    try {
      const res = await fetch(ENDPOINTS.validateProperty, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      sessionStorage.setItem(
        STORAGE_KEYS.propertyResponse,
        JSON.stringify(json)
      );

      let eligible = false;
      let property = null;
      if (json?.data?.property) {
        property = json.data.property;
      }
      const lp =
        json?.data?.property?.locationProfile ||
        json?.errors?.[0]?.extensions?.locationProfile ||
        json?.locationProfile;
      if (lp) {
        // Per PRD: only zip should determine eligibility
        eligible = lp.isInPreferredZipCode === true;
      }

      sessionStorage.setItem(
        STORAGE_KEYS.zipEligible,
        JSON.stringify(!!eligible)
      );

      // Prefill step 2 if possible
      if (property) prefillStep2FromPropertyResponse(property);

      hideLoadingTo(SELECTORS.step2);
      // Force defaults after step becomes visible to avoid other scripts/auto-fill
      resetStep2Defaults();
      return { ok: true, eligible: !!eligible, property };
    } catch (err) {
      console.error("Address validation error", err);
      hideLoadingTo(SELECTORS.step2); // still allow user to continue
      return { ok: true, eligible: false, property: null };
    }
  }

  function validateStep2Inputs() {
    const hv = qs(SELECTORS.homeValueEst);
    const rate = qs(SELECTORS.estimatedInterestRate);
    const unknown = qs(SELECTORS.unknownInterest);
    const move = qs(SELECTORS.monthsToMove);

    let valid = true;
    if (hv) {
      const ok = !!hv.value && !/Select/i.test(hv.value);
      hv.classList.toggle("is-invalid", !ok);
      hv.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (move) {
      const ok = !!move.value && !/Select/i.test(move.value);
      move.classList.toggle("is-invalid", !ok);
      move.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (rate) {
      const normalized = normalizeInterestRate(rate.value);
      const isUnknown = !!unknown?.checked;
      const ok = isUnknown || !!normalized;
      rate.classList.toggle("is-invalid", !ok);
      rate.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    return valid;
  }

  function validateStep3Inputs() {
    const first = qs(SELECTORS.firstName);
    const last = qs(SELECTORS.lastName);
    const email = qs(SELECTORS.email);
    const phone = qs(SELECTORS.phone);
    const who = qs(SELECTORS.agentOrHomeowner);
    const source = qs(SELECTORS.discoverySource);
    const consent = qs(SELECTORS.legalConsent);
    const brokerage = qs(SELECTORS.brokerage);

    let valid = true;
    if (first) {
      const ok = !!first.value.trim();
      first.classList.toggle("is-invalid", !ok);
      first.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (last) {
      const ok = !!last.value.trim();
      last.classList.toggle("is-invalid", !ok);
      last.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (email) {
      const ok =
        !!email.value.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      email.classList.toggle("is-invalid", !ok);
      email.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (phone) {
      const ok = !!phone.value && phone.value.replace(/\D/g, "").length === 10;
      phone.classList.toggle("is-invalid", !ok);
      phone.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (who) {
      const ok = !!who.value && !/Select/i.test(who.value);
      who.classList.toggle("is-invalid", !ok);
      who.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    // Conditional: brokerage required when Agent selected
    const isAgent = who && /agent/i.test(String(who.value || ""));
    if (isAgent && brokerage) {
      const ok = !!brokerage.value.trim();
      brokerage.classList.toggle("is-invalid", !ok);
      brokerage.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    } else if (brokerage) {
      // Not required when not Agent; remove invalid marker if present
      brokerage.classList.remove("is-invalid");
    }
    if (source) {
      const ok = !!source.value && !/Select/i.test(source.value);
      source.classList.toggle("is-invalid", !ok);
      source.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    if (consent) {
      const ok = !!consent.checked;
      consent.classList.toggle("is-invalid", !ok);
      consent.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    }
    return valid;
  }

  function mapUserType(value) {
    const v = String(value || "").toLowerCase();
    if (v.includes("agent")) return "Agent";
    return "Homeowner";
  }

  // NEW: Map discovery source display values to API enum values
  function mapDiscoverySource(displayValue) {
    if (!displayValue || displayValue === "Select one...") return "";

    const mapping = {
      Blog: "Blog",
      Facebook: "Facebook",
      "Friend/Family": "FriendFamily",
      Instagram: "Instagram",
      "Loan Officer": "LoanOfficer",
      "Online Search": "OnlineSearch",
      Podcast: "Podcast",
      "Postcard/Letter": "PostcardLetter",
      News: "News",
      "Real Estate Agent": "RealEstateAgent",
      Reddit: "Reddit",
      "Tik Tok": "TikTok",
      YouTube: "Youtube",
      Other: "Other",
    };

    return mapping[displayValue] || displayValue;
  }

  // Phone formatting logic (match legacy behavior)
  function formatPhoneNumber(phone) {
    const cleaned = String(phone || "").replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return cleaned;
  }

  function handlePhoneInputFormat(phoneInputField) {
    const numericPhone = (phoneInputField.value || "").replace(/\D/g, "");
    if (numericPhone.length > 10) {
      phoneInputField.value = formatPhoneNumber(numericPhone.slice(0, 10));
    } else if (numericPhone.length === 10) {
      phoneInputField.value = formatPhoneNumber(numericPhone);
    } else {
      phoneInputField.value = numericPhone;
    }
  }

  function getStoredUtms() {
    try {
      const keys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_keyword",
        "utm_content",
        "utm_term",
      ];
      const out = {};
      keys.forEach((k) => {
        const v = localStorage.getItem(k);
        if (v) out[k] = v;
      });
      return out;
    } catch (_) {
      return {};
    }
  }

  function sendSegmentLeadEvent(payload) {
    try {
      if (typeof analytics === "undefined") return;
      const utms = getStoredUtms();
      const addressEl = qs(SELECTORS.addressInput);
      const homeAddress =
        addressEl?.value || sessionStorage.getItem("saved_address") || "";
      const data = {
        first_name: payload.contactInfo.firstName,
        last_name: payload.contactInfo.lastName,
        email: payload.contactInfo.email,
        phone: payload.contactInfo.phoneNumber,
        source: payload.contactInfo.bonusDiscoverySource,
        home_address: homeAddress,
        form_type:
          payload.userType?.toLowerCase() === "agent" ? "agent" : "homeowner",
        page_url: window.location.href,
        ...utms,
        event_id: "lead-" + Date.now(),
      };
      // Only send on production domains, mirroring existing behavior
      if (
        window.location.hostname === "bonushomes.com" ||
        window.location.hostname === "www.bonushomes.com"
      ) {
        analytics.track("Lead Submitted", data);
        if (typeof fbq === "function") {
          fbq("track", "Lead", {}, { eventID: data.event_id });
        }
      }
    } catch (_) {}
  }

  function getStoredLocationProfile() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.propertyResponse);
      if (!raw) return null;
      const json = JSON.parse(raw);
      const lp =
        json?.data?.property?.locationProfile ||
        json?.errors?.[0]?.extensions?.locationProfile ||
        json?.locationProfile ||
        null;
      return lp || null; // Preserve as returned by API
    } catch (_) {
      return null;
    }
  }

  async function submitFinal() {
    if (!validateStep3Inputs()) {
      // Do not fire a Submit event when blocked; just return
      return;
    }

    const addressEl = qs(SELECTORS.addressInput);
    const rawAddress = addressEl?.value?.trim() || "";
    setDisplayAddressText(rawAddress);

    // Build payload
    const payload = buildBasePayload();

    // Get UTM parameters (matching old form behavior)
    const utmParams =
      typeof window.getUtmParams === "function"
        ? window.getUtmParams()
        : {
            source: "",
            medium: "",
            keyword: "",
            content: "",
            campaign: "",
            term: "",
          };

    // Add UTM parameters to payload (matching old form behavior)
    const payloadWithUtm = {
      ...payload,
      utmParams,
    };

    // Address fields
    const struct = getStructAddressFromSession();
    if (struct?.components) {
      payload.streetAddress = `${struct.components.streetNumber || ""} ${
        struct.components.street || ""
      }`.trim();
      payload.city = struct.components.city || "";
      payload.state = transformStateToAbbrev(struct.components.state || "");
      payload.zipCode = struct.components.zip || "";
    } else {
      const parsed = parseAddressFromInput(rawAddress);
      if (parsed) {
        payload.streetAddress = parsed.streetAddress;
        payload.city = parsed.city;
        payload.state = parsed.state;
        payload.zipCode = parsed.zipCode;
      }
    }

    // Step 2 data
    const hv = qs(SELECTORS.homeValueEst)?.value || "";
    const rate = normalizeInterestRate(
      qs(SELECTORS.estimatedInterestRate)?.value
    );
    const isUnknownRate = !!qs(SELECTORS.unknownInterest)?.checked;
    const move = qs(SELECTORS.monthsToMove)?.value || "";
    setHomeProfileValue(payload, "ESTIMATED_VALUE", hv || "");
    setHomeProfileValue(
      payload,
      "MORTGAGE_INTEREST_RATE",
      isUnknownRate ? "I don't know" : rate || ""
    );
    setHomeProfileValue(payload, "TIME_TO_MOVE", move || "");

    // Step 3 data
    payload.userType = mapUserType(qs(SELECTORS.agentOrHomeowner)?.value);
    payload.contactInfo.firstName =
      qs(SELECTORS.firstName)?.value?.trim() || "";
    payload.contactInfo.lastName = qs(SELECTORS.lastName)?.value?.trim() || "";
    payload.contactInfo.email = qs(SELECTORS.email)?.value?.trim() || "";
    payload.contactInfo.phoneNumber = (
      qs(SELECTORS.phone)?.value || ""
    ).replace(/\D/g, "");
    payload.contactInfo.bonusDiscoverySource = mapDiscoverySource(
      qs(SELECTORS.discoverySource)?.value || ""
    );
    payload.contactInfo.homeownerCommunicationConsent = !!qs(
      SELECTORS.legalConsent
    )?.checked;
    // Agent-only field
    if (payload.userType === "Agent") {
      payload.contactInfo.agentBrokerage =
        qs(SELECTORS.brokerage)?.value?.trim() || "";
    }

    // Mirror locationProfile from first API call
    const storedLP = getStoredLocationProfile();
    let eligible = false;
    if (storedLP) {
      const lpPreferred = !!storedLP.isInPreferredZipCode;
      const lpMSA = !!storedLP.isInOperatedMSA;
      const lpState = !!storedLP.isInOperatedState;

      // Mirror stored location profile exactly (do not modify booleans)
      payload.locationProfile = {
        isInPreferredZipCode: lpPreferred,
        isInOperatedMSA: lpMSA,
        isInOperatedState: lpState,
        // Ensure eligibilityCheck is always present
        eligibilityCheck: storedLP.eligibilityCheck,
      };

      // Eligibility per matrix
      if (payload.userType === "Agent") {
        eligible = lpPreferred || lpMSA || lpState;
      } else {
        // Homeowner
        eligible = lpPreferred || lpMSA;
      }

      // If API didn't provide eligibilityCheck, derive from matrix so field is always present
      if (typeof payload.locationProfile.eligibilityCheck === "undefined") {
        payload.locationProfile.eligibilityCheck = eligible
          ? "Passed"
          : "Failed";
      }

      // Keep API's eligibilityCheck untouched; matrix only affects isQualified
    } else {
      // Fallback to zipEligible flag
      try {
        eligible = JSON.parse(
          sessionStorage.getItem(STORAGE_KEYS.zipEligible) || "false"
        );
      } catch (_) {}
      payload.locationProfile.eligibilityCheck = eligible ? "Passed" : "Failed";
      payload.locationProfile.isInPreferredZipCode = !!eligible;
      if (eligible) {
        payload.locationProfile.isInOperatedMSA = true;
        payload.locationProfile.isInOperatedState = true;
      }
    }
    payload.isQualified = !!eligible;
    if (!eligible) {
      payload.reasonUnqualified = "FailedLocationCheck";
    }

    sessionStorage.setItem(STORAGE_KEYS.basePayload, JSON.stringify(payload));

    showLoading(SELECTORS.step3);
    // Normalize payload shape per endpoint requirements
    if (!payload.reasonUnqualified) {
      delete payload.reasonUnqualified;
    }
    if (payload.userType === "Agent") {
      // Agent endpoint expects agentCommunicationConsent and agentBrokerage
      payload.contactInfo.agentCommunicationConsent =
        !!payload.contactInfo.homeownerCommunicationConsent;
      delete payload.contactInfo.homeownerCommunicationConsent;
      if (typeof payload.contactInfo.agentBrokerage === "undefined") {
        payload.contactInfo.agentBrokerage = "";
      }
    }

    // Final submit (generic)
    dataLayerPush("Contact_Info_Submit");
    try {
      // Log final payload for debugging
      try {
        console.log(
          "Final Payload being sent to the API:",
          JSON.stringify(payload, null, 2)
        );
      } catch (_) {}
      const endpoint = ENDPOINTS.submitLead;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadWithUtm),
      });
      const json = await res.json();
      sessionStorage.setItem("responseData_v2", JSON.stringify(json));
      // Fire Segment Lead event (production gated)
      sendSegmentLeadEvent(payload);

      // Show success or fail
      if (eligible) {
        hideLoadingTo(SELECTORS.stepSuccess);
        // Success confirmation init (generic)
        dataLayerPush("Thank_You_Complete");
      } else {
        hideLoadingTo(SELECTORS.stepFail);
        dataLayerPush("Out_Of_Area_Complete");
      }
    } catch (err) {
      console.error("Submit lead error", err);
      // On error, still route based on eligibility to give user a result page
      if (eligible) hideLoadingTo(SELECTORS.stepSuccess);
      else hideLoadingTo(SELECTORS.stepFail);
    }
  }

  function wireBackButtons() {
    qsa(SELECTORS.backBtn).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentStep = btn.closest(SELECTORS.step);
        if (!currentStep) return;
        if (currentStep.matches(SELECTORS.step2)) {
          // NEW: If we came from homepage with address, go back to homepage
          if (shouldSkipStep1()) {
            window.history.back();
            return;
          }
          showOnlyStep(SELECTORS.step1);
          dataLayerPush("form_v2_nav_back_step1");
        } else if (currentStep.matches(SELECTORS.step3)) {
          showOnlyStep(SELECTORS.step2);
          dataLayerPush("form_v2_nav_back_step2");
        }
      });
    });
  }

  function wireStep1() {
    const btn = qs(SELECTORS.addressNextBtn);
    if (!btn) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const addressEl = qs(SELECTORS.addressInput);
      if (!addressEl) return;
      if (addressEl.dataset.selected !== "true") {
        alert("Please select an address from the dropdown suggestions.");
        addressEl.focus();
        return;
      }
      // Address validation & transition
      await validateAddressAndPrefill();
      // Step 2 initialization (generic)
      dataLayerPush("Home_Info_Init");
    });
  }

  function wireStep2() {
    const btn = qs(SELECTORS.step2NextBtn);
    if (!btn) return;
    // Unknown interest toggling
    const unknown = qs(SELECTORS.unknownInterest);
    const rate = qs(SELECTORS.estimatedInterestRate);
    const hv = qs(SELECTORS.homeValueEst);
    const move = qs(SELECTORS.monthsToMove);
    function applyUnknownState() {
      const isUnknown = !!unknown?.checked;
      if (rate) {
        if (isUnknown) {
          rate.disabled = true;
          rate.setAttribute("disabled", "");
          rate.classList.add("disabled");
          rate.value = "";
          rate.classList.remove("is-invalid");
        } else {
          rate.disabled = false;
          rate.removeAttribute("disabled");
          rate.classList.remove("disabled");
        }
      }
    }
    if (unknown) {
      unknown.addEventListener("change", applyUnknownState);
      applyUnknownState();
    }
    // Auto-format percent during editing (no % while typing)
    // Rules:
    // - digits only; ignore non-digits
    // - length 1 => D
    // - length 2 => D.D
    // - length >=3 => D.DD (truncate extra)
    // - cap < 10; mark invalid if >= 10
    // - Append trailing % only on blur
    function formatRateInput(showPercentOnOutput = false) {
      if (!rate || rate.disabled) return;
      const isUnknown = !!unknown?.checked;
      const digits = String(rate.value || "")
        .replace(/%/g, "")
        .replace(/\D/g, "")
        .slice(0, 3);
      let display = "";
      if (digits.length === 1) {
        display = digits;
      } else if (digits.length === 2) {
        display = `${digits[0]}.${digits[1]}`;
      } else if (digits.length >= 3) {
        display = `${digits[0]}.${digits.slice(1, 3)}`;
      } else {
        display = "";
      }
      const num = display ? parseFloat(display) : NaN;
      const ok = !isUnknown && display !== "" && !Number.isNaN(num) && num < 10;
      rate.classList.toggle("is-invalid", !ok && !isUnknown && display !== "");
      rate.classList.toggle("is-valid", ok);
      rate.value = display
        ? showPercentOnOutput
          ? `${display}%`
          : display
        : "";
    }
    if (rate) {
      // hint percent via placeholder when empty
      try {
        rate.placeholder = "%";
      } catch (_) {}
      rate.addEventListener("focus", () => {
        if (/%$/.test(String(rate.value || ""))) {
          rate.value = rate.value.replace(/%$/, "");
        }
      });
      rate.addEventListener("input", () => {
        formatRateInput(false);
        // Only adjust this field's invalid marker
        const isUnknown = !!unknown?.checked;
        const val = String(rate.value || "").replace(/%/g, "");
        const ok =
          isUnknown ||
          (!!val && !Number.isNaN(parseFloat(val)) && parseFloat(val) < 10);
        rate.classList.toggle("is-invalid", !ok && !isUnknown && val !== "");
        rate.classList.toggle("is-valid", ok && !isUnknown);
      });
      rate.addEventListener("blur", () => formatRateInput(true));
      rate.addEventListener("paste", () =>
        setTimeout(() => formatRateInput(false), 0)
      );
    }
    if (hv) {
      hv.addEventListener("change", () => {
        const ok = !!hv.value && !/Select/i.test(hv.value);
        if (ok) {
          hv.classList.remove("is-invalid");
          hv.classList.add("is-valid");
        }
      });
    }
    if (move) {
      move.addEventListener("change", () => {
        const ok = !!move.value && !/Select/i.test(move.value);
        if (ok) {
          move.classList.remove("is-invalid");
          move.classList.add("is-valid");
        }
      });
    }
    if (unknown) {
      unknown.addEventListener("change", () => {
        applyUnknownState();
        if (unknown.checked && rate) {
          rate.classList.remove("is-invalid");
          rate.classList.remove("is-valid");
        }
      });
    }
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!validateStep2Inputs()) {
        return;
      }
      // Step 2 submit (generic)
      dataLayerPush("Home_Info_Submit");
      showOnlyStep(SELECTORS.step3);
      // Step 3 init (generic)
      dataLayerPush("Contact_Info_Init");
    });
  }

  function wireStep3() {
    const btn = qs(SELECTORS.submitBtn);
    if (!btn) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await submitFinal();
    });
  }

  function wireStep3Validation() {
    const first = qs(SELECTORS.firstName);
    const last = qs(SELECTORS.lastName);
    const email = qs(SELECTORS.email);
    const phone = qs(SELECTORS.phone);
    const who = qs(SELECTORS.agentOrHomeowner);
    const source = qs(SELECTORS.discoverySource);
    const consent = qs(SELECTORS.legalConsent);
    const brokerage = qs(SELECTORS.brokerage);

    if (first) {
      const fn = () => {
        const ok = !!first.value.trim();
        if (ok) {
          first.classList.remove("is-invalid");
          first.classList.add("is-valid");
        }
      };
      first.addEventListener("input", fn);
      first.addEventListener("blur", fn);
    }
    if (last) {
      const fn = () => {
        const ok = !!last.value.trim();
        if (ok) {
          last.classList.remove("is-invalid");
          last.classList.add("is-valid");
        }
      };
      last.addEventListener("input", fn);
      last.addEventListener("blur", fn);
    }
    if (email) {
      const fn = () => {
        const ok =
          !!email.value.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        if (ok) {
          email.classList.remove("is-invalid");
          email.classList.add("is-valid");
        }
      };
      email.addEventListener("input", fn);
      email.addEventListener("blur", fn);
    }
    if (phone) {
      const fn = () => {
        const ok =
          !!phone.value && phone.value.replace(/\D/g, "").length === 10;
        if (ok) {
          phone.classList.remove("is-invalid");
          phone.classList.add("is-valid");
        }
      };
      phone.addEventListener("input", fn);
      phone.addEventListener("blur", fn);
    }
    if (who) {
      const fn = () => {
        const ok = !!who.value && !/Select/i.test(who.value);
        if (ok) {
          who.classList.remove("is-invalid");
          who.classList.add("is-valid");
        }
        // recheck brokerage when switching agent/homeowner
        if (brokerage) {
          const isAgent = /agent/i.test(String(who.value || ""));
          const okB = !isAgent || !!brokerage.value.trim();
          brokerage.classList.toggle("is-invalid", !okB);
          if (okB && isAgent) brokerage.classList.add("is-valid");
        }
      };
      who.addEventListener("change", fn);
    }
    if (brokerage) {
      const fn = () => {
        const isAgent = who && /agent/i.test(String(who.value || ""));
        if (!isAgent) {
          brokerage.classList.remove("is-invalid");
          brokerage.classList.remove("is-valid");
          return;
        }
        const ok = !!brokerage.value.trim();
        brokerage.classList.toggle("is-invalid", !ok);
        if (ok) brokerage.classList.add("is-valid");
      };
      brokerage.addEventListener("input", fn);
      brokerage.addEventListener("blur", fn);
    }
    if (source) {
      const fn = () => {
        const ok = !!source.value && !/Select/i.test(source.value);
        if (ok) {
          source.classList.remove("is-invalid");
          source.classList.add("is-valid");
        }
      };
      source.addEventListener("change", fn);
    }
    if (consent) {
      const fn = () => {
        const ok = !!consent.checked;
        consent.classList.toggle("is-invalid", !ok);
        consent.classList.toggle("is-valid", ok);
      };
      consent.addEventListener("change", fn);
    }
  }

  function wireAgentOrHomeownerTracking() {
    const sel = qs(SELECTORS.agentOrHomeowner);
    if (!sel) return;
    let firedFor = null; // Keep for possible future needs
    sel.addEventListener("change", (e) => {
      // Generic contact step init (already fired when entering step 3, but harmless to repeat once)
      dataLayerPush("Contact_Info_Init");
      // Toggle agent-only fields
      toggleAgentConditional(e.target.value);
    });
    // Initialize on load: start hidden then reveal if Agent selected
    (function hideInitially() {
      const agentEls = qsa(
        '.show-if-agent, #show-if-agent, [data-show-if="agent"]'
      );
      agentEls.forEach((node) => {
        node.setAttribute("hidden", "");
        node.style.display = "none";
        if (!node.classList.contains("hide")) node.classList.add("hide");
      });
    })();
    toggleAgentConditional(sel.value);
  }

  function toggleAgentConditional(selectionValue) {
    const isAgent = String(selectionValue || "")
      .toLowerCase()
      .includes("agent");
    // Support multiple conventions: class, id, or data-attr
    const agentEls = qsa(
      '.show-if-agent, #show-if-agent, [data-show-if="agent"]'
    );

    const hideClasses = [
      "hide",
      "hide-tablet",
      "hide-mobile",
      "hide-mobile-landscape",
      "w-condition-invisible",
    ];

    function unhideNode(node) {
      node.removeAttribute("hidden");
      node.style.display = "";
      hideClasses.forEach((c) => node.classList.remove(c));
    }

    function hideNode(node) {
      node.setAttribute("hidden", "");
      node.style.display = "none";
      if (!node.classList.contains("hide")) node.classList.add("hide");
    }

    function unhideAncestors(node) {
      let cur = node.parentElement;
      // Stop at step root
      while (cur && !cur.matches("[data-step]")) {
        unhideNode(cur);
        cur = cur.parentElement;
      }
    }

    agentEls.forEach((el) => {
      if (isAgent) {
        unhideNode(el);
        unhideAncestors(el);
      } else {
        hideNode(el);
      }
    });
  }

  function wirePhoneFormatting() {
    const phoneInput = qs(SELECTORS.phone);
    if (!phoneInput) return;
    // Mark as touched on focus (optional styling handlers can use this)
    phoneInput.addEventListener("focus", () => {
      phoneInput.dataset.touched = "true";
    });
    // Format on input
    phoneInput.addEventListener("input", () => {
      handlePhoneInputFormat(phoneInput);
      // live validity toggle for phone only
      const ok = phoneInput.value.replace(/\D/g, "").length === 10;
      if (ok) {
        phoneInput.classList.remove("is-invalid");
        phoneInput.classList.add("is-valid");
      }
    });
    // Restrict max 10 digits
    phoneInput.addEventListener("keydown", (event) => {
      const numericLength = (event.target.value || "").replace(
        /\D/g,
        ""
      ).length;
      const allowKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
      if (numericLength >= 10 && !allowKeys.includes(event.key)) {
        // Block additional typing beyond 10 digits
        const keyIsNumber = /\d/.test(event.key);
        if (keyIsNumber) event.preventDefault();
      }
    });
  }

  function initializeVisibility() {
    // Check if we should skip step 1 due to address in URL
    if (shouldSkipStep1()) {
      // Don't show any step yet - handleAddressFromUrl will handle this
      return;
    }

    // Show step 1 by default; keep others hidden
    showOnlyStep(SELECTORS.step1);
    const addrEl = qs(SELECTORS.addressInput);
    if (addrEl && addrEl.value) setDisplayAddressText(addrEl.value);
    // Step 1 init (generic)
    dataLayerPush("Address_Init");
  }

  // NEW: Function to get address from URL parameters
  function getAddressFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const address = urlParams.get("address");
      return address ? decodeURIComponent(address) : null;
    } catch (_) {
      return null;
    }
  }

  // NEW: Function to check if we should skip step 1
  function shouldSkipStep1() {
    const addressFromUrl = getAddressFromUrl();
    return !!addressFromUrl;
  }

  // NEW: Function to pre-populate address from URL and validate
  async function handleAddressFromUrl() {
    const addressFromUrl = getAddressFromUrl();
    if (!addressFromUrl) return false;

    const addressEl = qs(SELECTORS.addressInput);
    if (!addressEl) return false;

    // Pre-populate the address field
    addressEl.value = addressFromUrl;
    addressEl.dataset.selected = "true"; // Mark as selected to bypass validation

    // Set display address
    setDisplayAddressText(addressFromUrl);

    // Validate the address automatically
    const result = await validateAddressAndPrefill();

    if (result.ok) {
      // Skip to step 2
      showOnlyStep(SELECTORS.step2);
      dataLayerPush("Home_Info_Init");
      return true;
    } else {
      // If validation fails, stay on step 1 but show the address
      showOnlyStep(SELECTORS.step1);
      dataLayerPush("Address_Init");
      return false;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      initializeVisibility();
      wireStep1();
      wireStep2();
      wireStep3();
      wireStep3Validation();
      wireAgentOrHomeownerTracking();
      wirePhoneFormatting();
      wireBackButtons();
      // NEW: Check for address in URL and handle it
      if (shouldSkipStep1()) {
        await handleAddressFromUrl();
      }
    } catch (err) {
      console.error("form-v2 init error", err);
    }
  });
})();
