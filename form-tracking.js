
(function () {
  'use strict';

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Simple event push function
  function pushGTMEvent(eventName, data = {}) {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    };

    window.dataLayer.push(eventData);

    // Store for debugging
    window.sentGTMEvents = window.sentGTMEvents || [];
    window.sentGTMEvents.push(eventData);
  }

  // Debug functions - define them immediately
  window.testGTMEvent = function (eventName, data = {}) {
    pushGTMEvent(eventName, data);
  };

  window.checkGTMStatus = function () {
    return {
      gtm_loaded: typeof window.google_tag_manager !== 'undefined',
      dataLayer_exists: typeof window.dataLayer !== 'undefined',
      dataLayer_length: window.dataLayer ? window.dataLayer.length : 0,
      events_sent: window.sentGTMEvents ? window.sentGTMEvents.length : 0,
      current_url: window.location.pathname
    };
  };

  window.viewAllGTMEvents = function () {
    return window.sentGTMEvents || [];
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }

  function setupStep6SubmitTracking() {
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton && !submitButton.hasAttribute('data-gtm-step6-tracked')) {
      submitButton.setAttribute('data-gtm-step6-tracked', 'true');

      submitButton.addEventListener('click', function (event) {
        pushGTMEvent('HomeownerForm_DoesNotQualifyAgentPitch_Submit');
      });
    }
  }

  function setupAgentFormSubmitListener() {
    // AgentForm_Qualify_Submit - Track address validation button click on agent form
    const addressValidationButton = document.querySelector('[data-trigger="address-validation"]');

    if (addressValidationButton) {
      addressValidationButton.addEventListener('click', function (event) {
        // Only track if address input has value
        const addressInput = document.querySelector('[data-input="address"]');
        if (addressInput && addressInput.value.trim()) {
          const formData = {
            address_provided: true,
            has_structured_address: !!sessionStorage.getItem("struct_address")
          };

          pushGTMEvent('AgentForm_Qualify_Submit', formData);

          // Set up tracking for when step 2 becomes visible
          setTimeout(() => {
            setupAgentStep2Tracking();
          }, 1000); // Wait for step transition
        }
      });
    }
  }

  function setupAgentStep2Tracking() {
    // Check if step 2 is visible and set up tracking
    const step2 = document.querySelector('[data-step="2"]');
    if (step2 && window.getComputedStyle(step2).display !== 'none') {
      // Fire the init event for step 2
      pushGTMEvent('AgentForm_ContactInfo_Init');

      // Set up submit tracking for step 2
      const submitButton = document.querySelector('[data-alt="submit"]');
      if (submitButton && !submitButton.hasAttribute('data-gtm-tracked')) {
        // Mark as tracked to avoid duplicate listeners
        submitButton.setAttribute('data-gtm-tracked', 'true');

        submitButton.addEventListener('click', function (event) {
          // Just track the event without interfering with form submission
          const formData = {
            firstName: document.querySelector('[data-input="first-name"]')?.value || '',
            lastName: document.querySelector('[data-input="last-name"]')?.value || '',
            has_email: !!document.querySelector('[data-input="email"]')?.value,
            has_phone: !!document.querySelector('[data-input="phone"]')?.value,
            has_brokerage: !!document.querySelector('[data-input="brokerage"]')?.value
          };

          pushGTMEvent('AgentForm_ContactInfo_Submit', formData);
        });
      }
    }
  }

  function initTracking() {
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const currentStep = urlParams.get('step');

    if (currentPath === '/form-agent' || currentPath.includes('/form-agent')) {
      pushGTMEvent('AgentForm_Qualify_Init');
      setupAgentFormSubmitListener();
    } else if (currentPath === '/form' || (currentPath.includes('/form') && !currentPath.includes(
        '/form-agent'))) {
      if (currentStep === '2') {
        pushGTMEvent('HomeownerForm_HomeDetails_Init');
      } else {
        // Default to step 1 if no step parameter or step=1
        pushGTMEvent('HomeownerForm_Qualify_Init');
      }
      setupFormSubmitListener();
      setupStepTransitionTracking();
    } else if (currentPath === '/submit-not-in-zip' || currentPath.includes(
        '/submit-not-in-zip')) {
      pushGTMEvent('HomeownerForm_NotInArea_Init');
      setupNotInAreaSubmitListener();
    } else if (currentPath === '/submit-home-disqualified' || currentPath.includes(
        '/submit-home-disqualified')) {
      pushGTMEvent('HomeownerForm_DoesNotQualify_Init');
      setupDoesNotQualifySubmitListener();
    } else if (currentPath === '/submit-home-submitted' || currentPath.includes(
        '/submit-home-submitted')) {
      pushGTMEvent('HomeownerForm_LeadConfirmation_Init');
    } else if (currentPath === '/submit-agent-fail-not-in-state' || currentPath.includes(
        '/submit-agent-fail-not-in-state')) {
      pushGTMEvent('AgentForm_NotInArea_Init');
      setupAgentNotInAreaSubmitListener();
    } else if (currentPath === '/submit-agent-success' || currentPath.includes(
        '/submit-agent-success')) {
      pushGTMEvent('AgentForm_LeadConfirmation_Init');
    }
  }

  function setupStepTransitionTracking() {
    // Monitor URL changes for step transitions
    let currentStepTracked = new URLSearchParams(window.location.search).get('step') || '1';

    // Override the existing addStepToParams function to include tracking
    if (typeof window.addStepToParams === 'function') {
      const originalAddStepToParams = window.addStepToParams;
      window.addStepToParams = function (step) {
        // Call original function first
        originalAddStepToParams(step);

        // Track step initialization if it's different from current
        if (step && step !== currentStepTracked) {
          currentStepTracked = step;

          switch (step) {
          case '2':
            pushGTMEvent('HomeownerForm_HomeDetails_Init');
            break;
          case '3':
            pushGTMEvent('HomeownerForm_MoreDetails_Init');
            break;
          case '4':
            pushGTMEvent('HomeownerForm_MortgageDetails_Init');
            break;
          case '5':
            pushGTMEvent('HomeownerForm_ContactInfo_Init');
            break;
          case '6':
            pushGTMEvent('HomeownerForm_DoesNotQualifyAgentPitch_Init');
            // Set up step 6 submit tracking when we reach step 6
            setupStep6SubmitTracking();
            break;
          }
        }
      };
    }
  }

  function setupFormSubmitListener() {
    // HomeownerForm_Qualify_Submit - Track address validation button click on step 1
    const addressValidationButton = document.querySelector('[data-trigger="address-validation"]');

    if (addressValidationButton) {
      addressValidationButton.addEventListener('click', function (event) {
        // Only track if address input has value
        const addressInput = document.querySelector('[data-input="address"]');
        if (addressInput && addressInput.value.trim()) {
          const formData = {
            address_provided: true,
            has_structured_address: !!sessionStorage.getItem("struct_address")
          };

          pushGTMEvent('HomeownerForm_Qualify_Submit', formData);
        }
      });
    }

    // HomeownerForm_HomeDetails_Submit - Track home data validation button click on step 2
    const homeDataValidationButton = document.querySelector(
      '[data-trigger="home-data-validation"]');

    if (homeDataValidationButton) {
      homeDataValidationButton.addEventListener('click', function (event) {
        // Only track if form validation passes (using their checkInputsValidity function)
        const isValid = typeof checkInputsValidity === 'function' ? checkInputsValidity() :
          true;

        if (isValid) {
          const formData = {
            home_type: document.querySelector('[data-input="type-of-home"]')?.value || '',
            bedrooms: document.querySelector('[data-input="bedrooms"]')?.value || '',
            bathrooms: document.querySelector('[data-input="bathrooms"]')?.value || '',
            mortgage_type: document.querySelector('[data-input="mortgage-type"]')?.value ||
              '',
            square_footage: document.querySelector('[data-input="square-foot"]')?.value ||
              ''
          };

          pushGTMEvent('HomeownerForm_HomeDetails_Submit', formData);
        }
      });
    }

    // HomeownerForm_MoreDetails_Submit - Track step 3 submission button click
    const step3SubmitButton = document.querySelector('[data-trigger="home-data-step-3"]');

    if (step3SubmitButton) {
      step3SubmitButton.addEventListener('click', function (event) {
        // Only track if form validation passes (using their checkInputsValidity3 function)
        const isValid = typeof checkInputsValidity3 === 'function' ? checkInputsValidity3() :
          true;

        if (isValid) {
          // Get the selected values from step 3 form
          const homeConditionDiv = document.querySelector('[data-input="home-condition"]');
          const homeCondition = homeConditionDiv?.querySelector('[data-select].is-active div')
            ?.textContent || '';

          const solarDiv = document.querySelector('[data-input="solar"]');
          const solar = solarDiv?.querySelector('[data-select].is-active div')?.textContent ||
            '';

          const formData = {
            home_condition: homeCondition,
            solar: solar,
            garage: document.querySelector('[data-input="garage"]')?.value || '',
            pool: document.querySelector('[data-input="pool"]')?.value || '',
            time_to_move: document.querySelector('[data-input="months-to-move"]')?.value ||
              ''
          };

          pushGTMEvent('HomeownerForm_MoreDetails_Submit', formData);
        }
      });
    }

    // HomeownerForm_MortgageDetails_Submit - Track step 4 submission button click
    const step4SubmitButton = document.querySelector('[data-trigger="home-data-step-4"]');

    if (step4SubmitButton) {
      step4SubmitButton.addEventListener('click', function (event) {
        // Only track if form validation passes (using their step4Valid function)
        const isValid = typeof step4Valid === 'function' ? step4Valid() : true;

        if (isValid) {
          // Get mortgage and financial details from step 4
          const taxesInsDiv = document.querySelector(
            '[data-input="includes-taxes-insurance"]');
          const includesTaxesIns = taxesInsDiv?.querySelector('[data-select].w--current div')
            ?.textContent || '';

          const formData = {
            remaining_mortgage_balance: document.querySelector(
              '[data-input="remaining-mortgage-balance"]')?.value || '',
            monthly_mortgage_payment: document.querySelector(
              '[data-input="monthly-mortgage-payment"]')?.value || '',
            includes_taxes_insurance: includesTaxesIns,
            annual_property_taxes: document.querySelector(
              '[data-input="annual-property-taxes"]')?.value || '',
            homeowners_insurance: document.querySelector(
              '[data-input="homeowners-insurance"]')?.value || '',
            monthly_hoa: document.querySelector('[data-input="monthly-hoa"]')?.value || ''
          };

          pushGTMEvent('HomeownerForm_MortgageDetails_Submit', formData);
        }
      });
    }

    // HomeownerForm_ContactInfo_Submit - Track final step 5 submission
    const finalSubmitButton = document.querySelector('[data-alt="submit"]');

    if (finalSubmitButton) {
      finalSubmitButton.addEventListener('click', function (event) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentStep = urlParams.get('step');

        if (currentStep === '5') {
          // Only track if form validation passes and legal checkbox is checked
          const isValid = typeof validateFormInput === 'function' ? validateFormInput('5') :
            true;
          const legalCheckbox = document.querySelector('#legal-checkbox');
          const legalChecked = legalCheckbox && legalCheckbox.checked;

          if (isValid && legalChecked) {
            const formData = {
              discovery_source: document.querySelector('[data-input="discovery-source"]')
                ?.value || '',
              firstName: document.querySelector('[data-input="first-name"]')?.value || '',
              lastName: document.querySelector('[data-input="last-name"]')?.value || '',
              has_email: !!document.querySelector('[data-input="email"]')?.value,
              has_phone: !!document.querySelector('[data-input="phone"]')?.value,
              passes_step4_validation: !!sessionStorage.getItem("step4DataPass")
            };

            pushGTMEvent('HomeownerForm_ContactInfo_Submit', formData);
          }
        }
      });
    }
  }

  function setupNotInAreaSubmitListener() {
    // HomeownerForm_NotInArea_Submit - Track form submission on /submit-not-in-zip page
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener('click', function (event) {
        // Only track if form validation passes and checkbox is checked
        const isValid = validateFormInput && validateFormInput();
        const legalCheckbox = document.querySelector('#legal-checkbox');
        const legalChecked = legalCheckbox && legalCheckbox.checked;

        if (isValid && legalChecked) {
          const formData = {
            discovery_source: document.querySelector('[data-input="discovery-source"]')
              ?.value || '',
            has_session_data: !!sessionStorage.getItem("basePayload"),
            firstName: document.querySelector('[data-input="first-name"]')?.value || '',
            lastName: document.querySelector('[data-input="last-name"]')?.value || ''
          };

          pushGTMEvent('HomeownerForm_NotInArea_Submit', formData);
        }
      });
    }
  }

  function setupDoesNotQualifySubmitListener() {
    // HomeownerForm_DoesNotQualify_Submit - Track form submission on /submit-home-disqualified page
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener('click', function (event) {
        // Only track if form validation passes and checkbox is checked (matches their form logic)
        const isValid = typeof validateFormInput === 'function' ? validateFormInput() : true;
        const legalCheckbox = document.querySelector('#legal-checkbox');
        const legalChecked = legalCheckbox && legalCheckbox.checked;

        if (isValid && legalChecked) {
          const formData = {
            discovery_source: document.querySelector('[data-input="discovery-source"]')
              ?.value || '',
            has_session_data: !!sessionStorage.getItem("basePayload"),
            firstName: document.querySelector('[data-input="first-name"]')?.value || '',
            lastName: document.querySelector('[data-input="last-name"]')?.value || '',
            reason_unqualified: 'FailedFeaturesCheck'
          };

          pushGTMEvent('HomeownerForm_DoesNotQualify_Submit', formData);
        }
      });
    }
  }

  function setupAgentNotInAreaSubmitListener() {
    // AgentForm_NotInArea_Submit - Track form submission on /submit-agent-fail-not-in-state page
    const submitButton = document.querySelector('[data-alt="submit"]');

    if (submitButton) {
      submitButton.addEventListener('click', function (event) {
        // Make validation optional since this page may not have validateFormInput function
        const isValid = typeof validateFormInput === 'function' ? validateFormInput() : true;
        const legalCheckbox = document.querySelector('#legal-checkbox');
        const legalChecked = legalCheckbox ? legalCheckbox.checked : true;

        if (isValid && legalChecked) {
          const formData = {
            discovery_source: document.querySelector('[data-input="discovery-source"]')
              ?.value || '',
            has_session_data: !!sessionStorage.getItem("basePayload"),
            firstName: document.querySelector('[data-input="first-name"]')?.value || '',
            lastName: document.querySelector('[data-input="last-name"]')?.value || ''
          };
          pushGTMEvent('AgentForm_NotInArea_Submit', formData);

        }

      });
    }
  }

})();
