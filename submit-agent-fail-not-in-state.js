////////////////////////////////////////////
// Global State and Utility Functions
//////////////////////////////////////////////

// A global state object to hold user and property data.
const appState = {
  propertyData: null, // Will be set from sessionStorage (or elsewhere)
  userData: null, // Will be set after the user form is filled
};

// Simple helper to show/hide screens
function showLoadingStep() {
  const formStep = document.querySelector('[data-step="form"]');
  const loadingStep = document.querySelector('[data-step="loading"]');
  if (formStep) formStep.style.display = "none";
  if (loadingStep) loadingStep.style.display = "block";
}

function removeLoadingStep() {
  const loadingStep = document.querySelector('[data-step="loading"]');
  if (loadingStep) loadingStep.style.display = "none";
}

function showSubmitSuccess() {
  const successStep = document.querySelector('[data-step="submit-success"]');
  removeLoadingStep();
  if (successStep) successStep.style.display = "block";
}

// Example code for how you might hide all steps except the form
document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll("[data-step]");
  steps.forEach((step) => {
    // Show only the form step initially; hide others
    if (step.getAttribute("data-step") !== "form") {
      step.style.display = "none";
    } else {
      step.style.opacity = "1";
    }
  });

  setupUserFormValidation();
});

// function validateFormInput(dataStep) {
//   const stepDiv = document.querySelector(`[data-step="${dataStep}"]`);
//   console.log("Validating step:", stepDiv);
//   if (!stepDiv) return false; // Ensure the step exists

//   const inputs = stepDiv.querySelectorAll("[data-input]");
//   console.log("Found inputs:", inputs);
//   let allFilled = true;

//   inputs.forEach((input) => {
//     // Basic check for emptiness
//     if (input.value.trim() === "") {
//       input.classList.add("is-invalid");
//       input.classList.remove("is-valid");
//       allFilled = false;
//     } else {
//       input.classList.add("is-valid");
//       input.classList.remove("is-invalid");
//     }
//     // Special check for email
//     if (input.type === "email") {
//       if (input.value.includes("@")) {
//         input.classList.add("is-valid");
//         input.classList.remove("is-invalid");
//       } else {
//         input.classList.add("is-invalid");
//         input.classList.remove("is-valid");
//       }
//     }
//     // For phone, apply formatting and check
//     if (input.type === "phone") {
//       handlePhoneInputFormat(input);
//     }
//   });

//   return allFilled;
// }

function validateFormInput(dataStep) {
  const stepDiv = document.querySelector(`[data-step="${dataStep}"]`);
  // console.log("Validating step:", stepDiv);
  if (!stepDiv) return false; // Ensure the step exists

  const inputs = stepDiv.querySelectorAll("[data-input]");
  // console.log("Found inputs:", inputs);
  let allFilled = true;

  inputs.forEach((input) => {
    // Only mark invalid if the field has been touched.
    if (input.value.trim() === "") {
      // Only add "is-invalid" if the user has already interacted with the field.
      if (input.dataset.touched) {
        input.classList.add("is-invalid");
      } else {
        // If not touched, remove any existing validation classes.
        input.classList.remove("is-invalid");
        input.classList.remove("is-valid");
      }
      allFilled = false;
    } else {
      // If there is a value, mark the field as valid.
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
      // Skip further validation for this input.
      return;
    }

    // Special check for email fields.
    if (input.type === "email") {
      if (input.value.includes("@")) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      } else {
        // Again, only mark as invalid if touched.
        if (input.dataset.touched) {
          input.classList.add("is-invalid");
        } else {
          input.classList.remove("is-invalid");
          input.classList.remove("is-valid");
        }
        allFilled = false;
      }
    }

    // For phone fields, call your formatting function.
    // if (input.type === "phone") {
    //   handlePhoneInputFormat(input);
    // }

    if (input.type === "phone") {
      // Format the phone input value.
      handlePhoneInputFormat(input);

      // Remove all non-digits from the formatted phone value.
      const numericPhone = input.value.replace(/\D/g, "");

      // Check if the phone number has exactly 10 digits.
      if (numericPhone.length !== 10) {
        // If the field has been touched, mark it as invalid.
        if (input.dataset.touched) {
          input.classList.add("is-invalid");
        }
        input.classList.remove("is-valid");
        allFilled = false;
      } else {
        // Otherwise, mark it as valid.
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      }
    }
  });

  return allFilled;
}

function handlePhoneInputFormat(input) {
  const numericPhone = input.value.replace(/\D/g, "");
  if (numericPhone.length === 10) {
    input.value = `(${numericPhone.slice(0, 3)}) ${numericPhone.slice(
      3,
      6
    )}-${numericPhone.slice(6, 10)}`;
  } else {
    // Optionally, leave it unformatted if it isn’t exactly 10 digits.
    input.value = numericPhone;
  }
}

////////////////////////////////////////////
// Step 2 (User info) Validation & Submit
////////////////////////////////////////////

function setupUserFormValidation() {
  const submitButton = document.querySelector('[data-alt="submit"]');

  const firstNameInput = document.querySelector('[data-input="first-name"]');
  const lastNameInput = document.querySelector('[data-input="last-name"]');
  const emailInput = document.querySelector('[data-input="email"]');
  const phoneInput = document.querySelector('[data-input="phone"]');
  const brokerageInput = document.querySelector('[data-input="brokerage"]');
  const legalCheckbox = document.querySelector("#legal-checkbox");

  // Disable the Submit initially
  // if (submitButton) submitButton.disabled = true;

  // --- Utility Functions for Validation ---
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

  // --- Phone Input: Format & Restrict to 10 digits ---
  if (phoneInput) {
    phoneInput.addEventListener("focus", () => {
      phoneInput.dataset.touched = true;
    });

    phoneInput.addEventListener("input", (event) => {
      const numericPhone = event.target.value.replace(/\D/g, "");
      if (numericPhone.length > 10) {
        event.target.value = formatPhoneNumber(numericPhone.slice(0, 10));
      } else if (numericPhone.length === 10) {
        event.target.value = formatPhoneNumber(numericPhone);
      } else {
        event.target.value = numericPhone;
      }
      validateAllInputs();
    });

    phoneInput.addEventListener("blur", () => {
      validateAllInputs();
    });

    phoneInput.addEventListener("keydown", (event) => {
      const numericLength = event.target.value.replace(/\D/g, "").length;
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
      if (numericLength >= 10 && !allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    });
  }

  // --- Mark input as touched on focus, re-validate on input ---
  // [firstNameInput, lastNameInput, emailInput, brokerageInput].forEach(
  //   (input) => {
  //     if (!input) return;
  //     input.addEventListener("focus", () => {
  //       input.dataset.touched = true;
  //     });
  //     input.addEventListener("input", () => {
  //       validateAllInputs();
  //     });
  //   }
  // );

  [firstNameInput, lastNameInput, emailInput, brokerageInput].forEach(
    (input) => {
      if (!input) return;
      // When an input is focused, mark it as touched.
      input.addEventListener("focus", () => {
        input.dataset.touched = true;
      });
      // When the input changes, re-validate all inputs.
      input.addEventListener("input", () => {
        validateAllInputs();
      });
      // When the input loses focus, re-validate all inputs immediately.
      input.addEventListener("blur", () => {
        validateAllInputs();
      });
    }
  );

  // if (legalCheckbox) {
  //   legalCheckbox.addEventListener("change", validateAllInputs);
  // }

  if (legalCheckbox) {
    legalCheckbox.addEventListener("change", () => {
      if (legalCheckbox.checked) {
        legalCheckbox.classList.remove("is-invalid");
        legalCheckbox.classList.add("is-valid");
      } else {
        legalCheckbox.classList.remove("is-valid");
        legalCheckbox.classList.add("is-invalid");
      }
      validateAllInputs(); // Optionally, re-run overall validation.
    });
  }

  // --- Main validation logic ---
  // function validateAllInputs() {
  //   let allValid = true;

  //   // 1) First/Last name
  //   [firstNameInput, lastNameInput].forEach((input) => {
  //     if (!input) return;
  //     if (input.value.trim() === "") {
  //       markInvalid(input);
  //       allValid = false;
  //     } else {
  //       markValid(input);
  //     }
  //   });

  //   // 2) Email
  //   if (emailInput) {
  //     if (!validateEmail(emailInput.value)) {
  //       markInvalid(emailInput);
  //       allValid = false;
  //     } else {
  //       markValid(emailInput);
  //     }
  //   }

  //   // 3) Phone
  //   if (phoneInput) {
  //     const phoneValue = phoneInput.value.replace(/\D/g, "");
  //     if (phoneValue.length !== 10) {
  //       markInvalid(phoneInput);
  //       allValid = false;
  //     } else {
  //       markValid(phoneInput);
  //     }
  //   }

  //   // 4) Brokerage
  //   if (brokerageInput) {
  //     if (brokerageInput.value.trim() === "") {
  //       markInvalid(brokerageInput);
  //       allValid = false;
  //     } else {
  //       markValid(brokerageInput);
  //     }
  //   }

  //   // 5) Checkbox
  //   if (legalCheckbox && !legalCheckbox.checked) {
  //     allValid = false;
  //   }

  //   // Toggle the Submit button
  //   if (submitButton) submitButton.disabled = !allValid;
  // }
  function validateAllInputs() {
    // Call our common validation function for the form step:
    const isValid = validateFormInput("form");

    // Enable or disable the submit button based on whether all fields are valid.
    // if (submitButton) {
    //   submitButton.disabled = !isValid;
    // }
  }
  function markValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function markInvalid(input) {
    // Only show invalid if user has touched the field
    if (input.dataset.touched) {
      input.classList.add("is-invalid");
    }
    input.classList.remove("is-valid");
  }

  // --- Handle the actual 'Submit' click ---
  if (submitButton) {
    submitButton.addEventListener("click", function (event) {
      event.preventDefault(); // Just in case

      // if (legalCheckbox && !legalCheckbox.checked) {
      //   console.log("Legal Checkbox is not checked. Cannot submit.");
      //   return;
      // }

      // // Use the new validation function for all inputs on the form step.
      // if (!validateFormInput("form")) {
      //   console.log("Validation failed. Please check your inputs.");
      //   return;
      // }

      // Mark all inputs as touched so that the validation function applies the invalid class.
      const allInputs = document.querySelectorAll(
        '[data-step="form"] [data-input], #legal-checkbox'
      );
      allInputs.forEach((input) => {
        input.dataset.touched = true;
      });

      // Also, validate the legal checkbox if needed:
      // if (legalCheckbox && !legalCheckbox.checked) {
      //   console.log("Legal Checkbox is not checked. Cannot submit.");
      //   // Optionally, also mark it as invalid:
      //   legalCheckbox.classList.remove("is-valid");
      //   legalCheckbox.classList.add("is-invalid");
      //   return;
      // }

      if (!validateFormInput("form")) {
        console.log("Validation failed. Please check your inputs.");
        return;
      }

      // 1) Show loading screen
      showLoadingStep();

      // 2) Get the phone number in unformatted form
      const formattedPhone = phoneInput ? phoneInput.value : "";
      const unformattedPhone = formattedPhone.replace(/\D/g, "");

      // 3) Build the userData
      appState.userData = {
        firstName: firstNameInput ? firstNameInput.value.trim() : "",
        lastName: lastNameInput ? lastNameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        phone: unformattedPhone,
        brokerage: brokerageInput ? brokerageInput.value.trim() : "",
      };

      // 4) Retrieve property data from sessionStorage (or somewhere).
      //    Suppose sessionStorage item is "agentData" containing property info.
      const stored = sessionStorage.getItem("agentData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // You can store it directly, or if you need to rename fields, do so here.
          // Example: if the property data is under `parsed.resp`, use that
          appState.propertyData = parsed.resp ? parsed.resp : parsed; // or however your data is structured
        } catch (err) {
          console.warn("Could not parse sessionStorage item 'agentData':", err);
        }
      }

      // 5) If you have no propertyData at all, handle that scenario
      if (!appState.propertyData) {
        console.error("No propertyData found. Submission aborted.");
        // Optionally revert the UI or show an error
        removeLoadingStep();
        return;
      }
      // if (!validateFormInput) {
      //   return;
      // }
      // 6) Do final submission to your “submit” endpoint
      //    This uses the same logic from your first code (validateAndBuildHomeProfile, etc.)
      submitDataToAPI(appState.propertyData, appState.userData)
        .then((res) => {
          console.log("Lead submitted successfully:", res);
          // Show success step
          showSubmitSuccess();
        })
        .catch((err) => {
          console.log("Error submitting lead:", err);
          // If you want to revert or show an error screen, do so
        });
    });
  }

  // Initial check
  validateAllInputs();
}

////////////////////////////////////////////
// Re-Use the same Final Submission Logic
////////////////////////////////////////////

// The same function from your first code, no address validation step needed.
function validateAndBuildHomeProfile(propertyData) {
  let allPassed = true;
  const checks = [];

  // HOME_TYPE: Must be "Singlefamily" -> "Single-Family Detached Home"
  let homeTypeTransformed = propertyData.homeType;
  if (propertyData.homeType?.toLowerCase() === "singlefamily") {
    homeTypeTransformed = "Single-Family Detached Home";
  }
  const homeTypePassed =
    homeTypeTransformed === "Single-Family Detached Home" ? "Passed" : "Failed";
  if (homeTypePassed === "Failed") allPassed = false;
  checks.push({
    id: "HOME_TYPE",
    value: homeTypeTransformed,
    eligibilityCheck: homeTypePassed,
  });

  // BEDS >= 3
  const bedPassed = propertyData.numOfBeds >= 3 ? "Passed" : "Failed";
  if (bedPassed === "Failed") allPassed = false;
  checks.push({
    id: "BEDS",
    value: propertyData.numOfBeds,
    eligibilityCheck: bedPassed,
  });

  // BATHS >= 2
  const bathPassed = propertyData.numOfBaths >= 2 ? "Passed" : "Failed";
  if (bathPassed === "Failed") allPassed = false;
  checks.push({
    id: "BATHS",
    value: propertyData.numOfBaths,
    eligibilityCheck: bathPassed,
  });

  // ACRES <= 0.5
  const acreageValue = parseFloat(propertyData.acreage) || 0;
  const acreagePassed = acreageValue <= 0.5 ? "Passed" : "Failed";
  if (acreagePassed === "Failed") allPassed = false;
  checks.push({
    id: "ACRES",
    value: acreageValue > 0.5 ? "> .5" : "< .5",
    eligibilityCheck: acreagePassed,
  });

  // SQUARE_FOOTAGE: e.g. 1300 - 3500
  const squareFootPassed =
    propertyData.squareFootage >= 1300 && propertyData.squareFootage <= 3500
      ? "Passed"
      : "Failed";
  if (squareFootPassed === "Failed") allPassed = false;
  checks.push({
    id: "SQUARE_FOOTAGE",
    value: propertyData.squareFootage,
    eligibilityCheck: squareFootPassed,
  });

  // MORTGAGE_TYPE: must not be empty
  const mortgageTypeValue = propertyData.mortgages?.[0]?.mortgageType || "";
  const mortgageTypePassed =
    mortgageTypeValue.trim() !== "" ? "Passed" : "Failed";
  if (mortgageTypePassed === "Failed") allPassed = false;
  checks.push({
    id: "MORTGAGE_TYPE",
    value: mortgageTypeValue,
    eligibilityCheck: mortgageTypePassed,
  });

  // MORTGAGE_INTEREST_RATE: between 0 and 4.25
  // const interestRate =
  //   parseFloat(propertyData.mortgages?.[0]?.interestRate) || 0;
  // const ratePassed =
  //   interestRate > 0 && interestRate <= 4.25 ? "Passed" : "Failed";
  // if (ratePassed === "Failed") allPassed = false;
  // checks.push({
  //   id: "MORTGAGE_INTEREST_RATE",
  //   value: propertyData.mortgages?.[0]?.interestRate,
  //   eligibilityCheck: ratePassed,
  // });

  // MORTGAGE_INTEREST_RATE: between 0 and 4.25
  const interestRate =
    parseFloat(propertyData.mortgages?.[0]?.interestRate) || 0;

  const ratePassed =
    interestRate > 0 && interestRate <= 4.25 ? "Passed" : "Failed";
  if (ratePassed === "Failed") allPassed = false;

  // Ensure the interest rate is always formatted with "%"
  const formattedRate = interestRate > 0 ? `${interestRate.toFixed(2)}%` : "";

  checks.push({
    id: "MORTGAGE_INTEREST_RATE",
    value: formattedRate, // Ensuring a formatted value with "%"
    eligibilityCheck: ratePassed,
  });

  // MORTGAGE_LOAN_TYPE: must be "Fixed"
  const loanTypeValue = propertyData.mortgages?.[0]?.loanType || "Unknown";
  const loanTypePassed =
    loanTypeValue.toLowerCase() === "fixed" ? "Passed" : "Failed";
  if (loanTypePassed === "Failed") allPassed = false;
  checks.push({
    id: "MORTGAGE_LOAN_TYPE",
    value: loanTypeValue,
    eligibilityCheck: loanTypePassed,
  });

  // MORTGAGE_TERM: must be 30
  const termValue = parseInt(propertyData.mortgages?.[0]?.term, 10) || 0;
  const termPassed = termValue === 30 ? "Passed" : "Failed";
  if (termPassed === "Failed") allPassed = false;
  checks.push({
    id: "MORTGAGE_TERM",
    value: termPassed === "Passed" ? `${termValue} years` : `${termValue}`,
    eligibilityCheck: termPassed,
  });

  // ESTIMATED_VALUE: between $225k and $625k
  const estimatedVal =
    parseInt(propertyData.valueEstimates?.[0]?.estimate, 10) || 0;
  const estimatePassed =
    estimatedVal >= 225000 && estimatedVal <= 625000 ? "Passed" : "Failed";
  if (estimatePassed === "Failed") allPassed = false;
  checks.push({
    id: "ESTIMATED_VALUE",
    value: `${estimatedVal}`,
    eligibilityCheck: estimatePassed,
  });

  return { allPassed, homeProfile: checks };
}

// The final submission function, same as in first code, but used here
async function submitDataToAPI(propertyData, userData) {
  const { allPassed, homeProfile } = validateAndBuildHomeProfile(propertyData);

  const payload = {
    streetAddress: propertyData.streetAddress,
    city: propertyData.city,
    state: propertyData.stateAbbrev,
    zipCode: propertyData.zipCode,
    userType: "Agent",
    contactInfo: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phone,
      agentBrokerage: userData.brokerage,
      agentCommunicationConsent: true,
    },
    isQualified: allPassed,
    locationProfile: {
      isInPreferredZipCode: propertyData.locationProfile?.isInPreferredZipCode,
      isInOperatedMSA: propertyData.locationProfile?.isInOperatedMSA,
      isInOperatedState: propertyData.locationProfile?.isInOperatedState,
      eligibilityCheck: "Failed",
    },
    homeProfile,
  };

  // If any check fails, set isQualified false + reason
  if (!allPassed) {
    payload.reasonUnqualified = "FailedLocationCheck";
  }

  console.log(
    "Final Payload being sent to the API:",
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await fetch(
      "https://6mkwa74oj8.execute-api.us-east-2.amazonaws.com/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
