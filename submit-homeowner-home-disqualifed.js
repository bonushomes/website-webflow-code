document.addEventListener("DOMContentLoaded", function () {
  // Hide all steps except the first one
  var steps = document.querySelectorAll("[data-step]");
  steps.forEach(function (step) {
    if (step.getAttribute("data-step") !== "form") {
      step.style.display = "none";
    } else {
      step.style.opacity = "1";
    }
  });
});

console.log("homeowner home disqualifed script loaded");

// Find all elements with the data-step attribute
const steps = Array.from(document.querySelectorAll("[data-step]"));

// Filter visible elements that are not display: none
const visibleSteps = steps.filter((step) => {
  const style = window.getComputedStyle(step);
  return style.display !== "none";
});

// Check if more than one visible step exists
if (visibleSteps.length > 1) {
  console.log(
    "🚨🚨🚨 ADD hide-at-start class to ALL STEPS except for the first visible step"
  );
}

function showLoadingStep() {
  const formStep = document.querySelector('[data-step="form"]');
  const loadingStep = document.querySelector('[data-step="loading"]');
  formStep.style.display = "none";
  loadingStep.style.display = "block";
}

function removeLoadingStep() {
  const loadingStep = document.querySelector('[data-step="loading"]');
  loadingStep.style.display = "none";
}

function showSubmitSuccess() {
  // Hide the form step
  const formStep = document.querySelector('[data-step="form"]');
  formStep.style.display = "none";

  // If you’re not using the loading step, you can remove this
  removeLoadingStep();

  // Show the success step
  const successStep = document.querySelector('[data-step="submit-success"]');
  successStep.style.display = "block";
}

const legalConsent = document.querySelector('[data-input="legal-consent"]');
if (legalConsent && !legalConsent.dataset.listenerAttached) {
  legalConsent.addEventListener("change", () => {
    // Mark as touched once the user interacts
    legalConsent.dataset.touched = "true";
    legalConsent.classList.toggle("is-valid", legalConsent.checked);
    legalConsent.classList.toggle("is-invalid", !legalConsent.checked);
  });
  legalConsent.dataset.listenerAttached = "true";
}

function validateFormInput() {
  const stepDiv = document.querySelector(`[data-step="form"]`);
  console.log(stepDiv);
  if (!stepDiv) return false; // Ensure the stepdiv exists

  const inputs = stepDiv.querySelectorAll("[data-input]");
  console.log(inputs);
  let allFilled = true;

  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      allFilled = false;
    } else {
      input.classList.add("is-valid");
      input.classList.remove("is-invalid");
    }
    if (input.type === "checkbox") {
      // For a checkbox, validity might be simply whether it's checked.
      if (input.checked) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      } else {
        // If touched, mark as invalid.
        if (input.dataset.touched) {
          input.classList.add("is-invalid");
        } else {
          input.classList.remove("is-invalid");
          input.classList.remove("is-valid");
        }
        allFilled = false;
      }
    }

    // Only apply the placeholder check to select elements.
    if (input.tagName.toLowerCase() === "select") {
      if (input.value === "Select one...") {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        allFilled = false;
      }
      // Do not add an else clause here to override earlier classes.
    }
    if (input.dataset.input === "phone") {
      const numericPhone = input.value.replace(/\D/g, "");
      console.log(
        "Phone input value:",
        input.value,
        "Numeric value:",
        numericPhone
      );
      if (numericPhone.length === 10) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        allFilled = false;
      }
      return; // Skip generic processing for phone
    }

    // If this is the email input, handle it exclusively
    if (input.dataset.input === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(input.value.trim())) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        allFilled = false;
      }

      // Skip further generic processing for email
      return;
    }
  });

  return allFilled;
}

document.addEventListener("DOMContentLoaded", function () {
  // Get all form elements
  const inputs = document.querySelectorAll(
    '[data-input="first-name"], [data-input="last-name"]'
  );
  const emailInput = document.querySelector('[data-input="email"]');
  const phoneInput = document.querySelector('[data-input="phone"]');
  const discoverySourceInput = document.querySelector(
    '[data-input="discovery-source"]'
  );
  const legalCheckbox = document.querySelector("#legal-checkbox");
  const submitButton = document.querySelector('[data-alt="submit"]');
  // Explicitly disable the submit button on page load
  // submitButton.setAttribute("disabled", "disabled");

  // Validation helper functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return cleaned;
  }
  // Add touch state and input listeners for email and phone
  emailInput.addEventListener("focus", () => {
    emailInput.dataset.touched = true;
  });

  emailInput.addEventListener("input", () => {
    validateEmail(emailInput.value);
    validateInputs();
  });

  phoneInput.addEventListener("focus", () => {
    phoneInput.dataset.touched = true;
  });

  // Add touch state and input listener for discovery source
  discoverySourceInput.addEventListener("focus", () => {
    discoverySourceInput.dataset.touched = true;
  });

  discoverySourceInput.addEventListener("input", validateInputs);
  discoverySourceInput.addEventListener("change", validateInputs);

  function validateInputs() {
    let allValid = true;

    // Validate name inputs
    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.remove("is-valid");
        if (input.dataset.touched) {
          input.classList.add("is-invalid");
        }
        allValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    });

    // Validate discovery source
    if (
      !discoverySourceInput.value ||
      discoverySourceInput.value.trim() === "" ||
      discoverySourceInput.value === "Select one..."
    ) {
      discoverySourceInput.classList.remove("is-valid");
      if (discoverySourceInput.dataset.touched) {
        discoverySourceInput.classList.add("is-invalid");
      }
      allValid = false;
    } else {
      discoverySourceInput.classList.remove("is-invalid");
      discoverySourceInput.classList.add("is-valid");
    }

    // // Validate email
    // function validateEmail(email) {
    //   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   const isValid = re.test(String(email).toLowerCase());

    //   if (!isValid) {
    //     emailInput.classList.remove("is-valid");
    //     if (emailInput.dataset.touched) {
    //       emailInput.classList.add("is-invalid");
    //     }
    //   } else {
    //     emailInput.classList.remove("is-invalid");
    //     emailInput.classList.add("is-valid");
    //   }

    //   return isValid;
    // }
    if (!validateEmail(emailInput.value)) {
      // Note the ! here
      emailInput.classList.remove("is-valid");
      if (emailInput.dataset.touched) {
        emailInput.classList.add("is-invalid");
      }
      allValid = false; // Mark the overall form as invalid
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    }

    // Validate phone
    const phoneValue = phoneInput.value.replace(/\D/g, "");
    if (phoneValue.length !== 10) {
      phoneInput.classList.remove("is-valid");
      if (phoneInput.dataset.touched) {
        phoneInput.classList.add("is-invalid");
      }
      allValid = false;
    } else {
      phoneInput.classList.remove("is-invalid");
      phoneInput.classList.add("is-valid");
    }

    // Validate checkbox
    if (!legalCheckbox.checked) {
      allValid = false;
    }

    // // Update submit button state
    // if (allValid) {
    //   submitButton.removeAttribute("disabled");
    // } else {
    //   submitButton.setAttribute("disabled", "disabled");
    // }

    return allValid;
  }

  emailInput.addEventListener("input", validateInputs); // Just call validateInputs

  // Add event listeners for touch states
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.dataset.touched = true;
    });

    input.addEventListener("input", validateInputs);
  });

  // Special handling for phone input
  phoneInput.addEventListener("input", (event) => {
    const numericPhone = event.target.value.replace(/\D/g, "");
    if (numericPhone.length > 10) {
      event.target.value = formatPhoneNumber(numericPhone.slice(0, 10));
    } else if (numericPhone.length === 10) {
      event.target.value = formatPhoneNumber(numericPhone);
    } else {
      event.target.value = numericPhone;
    }
    validateInputs();
  });

  phoneInput.addEventListener("keydown", (event) => {
    const numericLength = event.target.value.replace(/\D/g, "").length;
    if (
      numericLength >= 10 &&
      event.key !== "Backspace" &&
      event.key !== "Delete" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Tab"
    ) {
      event.preventDefault();
    }
  });

  legalCheckbox.addEventListener("change", validateInputs);
  // submit
  submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    // Check if we've already successfully submitted
    if (sessionStorage.getItem("formSubmitted") === "true") {
      console.log("Form already submitted successfully, ignoring click");
      return;
    }

    if (!validateFormInput()) {
      return;
    }
    if (!legalCheckbox.checked) {
      console.log("Checkbox is not checked.");
      return;
    }

    // Set flag IMMEDIATELY to prevent race conditions and duplicate submissions
    sessionStorage.setItem("formSubmitted", "true");
    console.log("Form submission started, preventing future submissions");

    // showLoadingStep();
    showSubmitSuccess();

    // Get the formatted phone number
    const formattedPhone = document.querySelector('[data-input="phone"]').value;
    // Strip all non-numeric characters for the payload
    const unformattedPhone = formattedPhone.replace(/\D/g, "");

    const userData = {
      firstName: document.querySelector('[data-input="first-name"]').value,
      lastName: document.querySelector('[data-input="last-name"]').value,
      email: document.querySelector('[data-input="email"]').value,
      phone: unformattedPhone,
      bonusDiscoverySource: document.querySelector(
        '[data-input="discovery-source"]'
      ).value,
    };

    // get session data
    const basePayload = sessionStorage.getItem("basePayload");

    let homeDataObject = basePayload;

    if (basePayload) {
      // Parse the string back into an object
      homeDataObject = JSON.parse(basePayload);
      console.log("session data", homeDataObject);
    }
    console.log("session data", homeDataObject);
    console.log("userData", userData);

    submitDataToAPI(homeDataObject, userData)
      .then((res) => {
        console.log("Form submitted successfully, keeping submission flag set");
        const url = new URL(window.location);
        url.searchParams.set("submit-success", "true");
        window.history.replaceState({}, "", url);
      })
      .catch((err) => {
        // Reset flag on error so user can retry
        sessionStorage.removeItem("formSubmitted");
        console.log("Error submitting lead:", err);
        console.log("Form submission failed, allowing retry");
      });
  });
});

//////////////////////////////////////////////
// Submission / API-related logic
//////////////////////////////////////////////

// Function to handle the submission of data to the API using a standard JSON payload
async function submitDataToAPI(data, userData) {
  // Final safeguard: check if already submitted
  if (sessionStorage.getItem("formSubmitted") === "true") {
    console.log("Form already submitted, blocking API call");
    throw new Error("Form already submitted successfully");
  }

  console.log("basePayload", data);
  console.log("submitDataToAPI called with:", { data, userData });

  if (!data || !data.contactInfo) {
    throw new Error("Invalid data: 'contactInfo' is missing.");
  }

  // Build a simple JSON payload, no GraphQL wrapper
  console.log("basePayload", data);

  const sanitizedDiscovery = userData.bonusDiscoverySource.replace(
    /[^a-zA-Z]/g,
    ""
  );

  // Get UTM parameters
  const utmParams =
    typeof window.getUtmParams === "function"
      ? window.getUtmParams()
      : {
          source: "",
          medium: "",
          keyword: "",
          content: "",
          campaign: "",
        };

  const finalPayload = {
    ...data,
    contactInfo: {
      ...data.contactInfo,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phone,
      bonusDiscoverySource: sanitizedDiscovery,
    },
    reasonUnqualified: "FailedFeaturesCheck",
    utmParams,
  };

  try {
    // Log what we're sending (for debugging/inspection)
    console.log(
      "Final Payload being sent to the API:",
      JSON.stringify(finalPayload, null, 2)
    );

    console.log("Starting API submission...");

    const response = await fetch(
      "https://vpqqjszp06.execute-api.us-west-1.amazonaws.com/prod/submitHomeownerWebsiteLead",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(finalPayload),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("API Response:", result);
    return result;
  } catch (error) {
    console.error("Submission error:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
