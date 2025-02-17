console.log("homeowner js loaded");

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

function showLoading(stepNum) {
  console.log("CHANGING TO LOADING SCREEN");
  const lookupStr = `[data-step="${stepNum}"]`;
  const currentStep = document.querySelector(lookupStr);
  const loadingStep = document.querySelector('[data-step="loading"]');
  loadingStep.style.display = "block";
  currentStep.style.display = "none";
  console.log(loadingStep);
  console.log("LOADING SCREEN HAS BEEN CHANGED");
}

function removeLoading(stepNum) {
  // stepNum here is the step you want to show!
  console.log("LOADING SCREEN REMOVAL");
  if (stepNum instanceof HTMLElement) {
    const loadingStep = document.querySelector('[data-step="loading"]');
    loadingStep.style.display = "none";
    stepNum.style.display = "block";
    addStepToParams("6");
    console.log("LOADING SCREEN REMOVED");
  } else {
    const lookupStr = `[data-step="${stepNum}"]`;
    const show = document.querySelector(lookupStr);
    const loadingStep = document.querySelector('[data-step="loading"]');
    loadingStep.style.display = "none";
    show.style.display = "block";
    addStepToParams(stepNum);
    console.log("LOADING SCREEN REMOVED");
  }
} // //

function validateFormInput(dataStep) {
  const stepDiv = document.querySelector(`[data-step="${dataStep}"]`);
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

    // if (input.type == "phone") {
    //   handlePhoneInputFormat(input);
    // }

    // if (input.dataset.input === "phone") {
    //   // Always reformat first
    //   handlePhoneInputFormat(input);
    //   const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    //   if (phoneRegex.test(input.value.trim())) {
    //     input.classList.add("is-valid");
    //     input.classList.remove("is-invalid");
    //   } else {
    //     input.classList.add("is-invalid");
    //     input.classList.remove("is-valid");
    //     allFilled = false;
    //   }
    //   // Skip further (generic) processing for this input
    //   return;
    // }
  });

  return allFilled;
}

// new added jan 28th
// function for validation and showing popup if invalid

// function getInvalidInputs(stepEl) {
//   const inputs = stepEl.querySelectorAll("[data-input]");
//   const invalidInputs = [];
//   for (const input of inputs) {
//     if (
//       !input.classList.contains("is-valid") ||
//       input.classList.contains("is-invalid")
//     ) {
//       invalidInputs.push(input);
//     }
//   }
//   return invalidInputs;
// }

// function showInvalidPopUp(invalidInputs, targetElement = null) {
//   const popup = document.querySelector('[data-tag="invalid-pop-up"]');
//   if (!popup) return;

//   const popupMessage = popup.querySelector(
//     '[data-tag="invalid-pop-up-message"]'
//   );

//   if (popupMessage) {
//     if (invalidInputs.length === 0) {
//       popupMessage.textContent = "Please correct the errors.";
//     } else {
//       const labels = invalidInputs.map(
//         (input) => input.getAttribute("data-label") || input.name || "field"
//       );
//       popupMessage.textContent = "Please fix: " + labels.join(", ");
//     }
//   }

//   // If a target element is provided, display the popup within it
//   if (targetElement) {
//     targetElement.appendChild(popup);
//   }

//   popup.style.display = "block";
// }

//
document.addEventListener("DOMContentLoaded", function () {
  // Listen for clicks on the address validation trigger button on step 1.
  const addressValidationTrigger = document.querySelector(
    '[data-trigger="address-validation"]'
  );
  const addressInput = document.querySelector('[data-input="address"]');

  if (addressValidationTrigger && addressInput) {
    addressValidationTrigger.addEventListener("click", function (event) {
      // Check if the current step is 1.
      // (This example assumes that if step 1 is visible, then we are on step 1.)
      const step1Container = document.querySelector('[data-step="1"]');
      if (
        step1Container &&
        window.getComputedStyle(step1Container).display !== "none"
      ) {
        // Check if the session storage has the structured address data.
        const structAddress = sessionStorage.getItem("struct_address");
        if (!structAddress) {
          // No address was selected from the dropdown.
          alert("Please select an address from the dropdown to continue.");

          // Remove any valid class and add the invalid class to the address input.
          addressInput.classList.remove("is-valid");
          addressInput.classList.add("is-invalid");

          // Prevent any further action (like progressing to step 2).
          event.preventDefault();
          return false;
        } else {
          // If the structured address exists, you may clear any invalid classes
          // and allow the normal progression to step 2.
          addressInput.classList.remove("is-invalid");
          addressInput.classList.add("is-valid");
          // (Any additional logic to progress to step 2 can be executed here.)
        }
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Hide all steps except the first one
  const url = new URL(window.location.href);
  const currentStep = url.searchParams.get("step");

  var steps = document.querySelectorAll("[data-step]");
  steps.forEach(function (step) {
    if (step.getAttribute("data-step") == "1") {
      step.style.display = "block";
    } else {
      step.style.opacity = "1";
    }
  });
  // REMOVE UNTIL HERE

  function showStep(step) {
    step.style.display = "block";
  }

  //
  function hideStep(currentStep, nextStep) {
    currentStep.style.display = "none";
    showStep(nextStep);
  }

  // document.querySelectorAll('[data-alt="next"]').forEach(function (nextButton) {
  //   nextButton.addEventListener("click", function () {
  //     var currentStep = this.closest("[data-step]");
  //     var currentStepNumber = parseInt(currentStep.getAttribute("data-step"));

  //     var nextStepNumber = currentStepNumber + 1;
  //     var nextStep = document.querySelector(
  //       '[data-step="' + nextStepNumber + '"]'
  //     );

  //     addStepToParams(nextStepNumber.toString());
  //   });
  // });

  // double check this for console errors
  document.querySelectorAll('[data-alt="next"]').forEach(function (nextButton) {
    nextButton.addEventListener("click", function () {
      // 1) Identify the current step
      const currentStep = this.closest("[data-step]");
      const currentStepNumber = parseInt(
        currentStep.getAttribute("data-step"),
        10
      );

      // 2) If the current step is not step 1, check invalid fields
      // if (currentStepNumber !== 1) {
      //   const invalidInputs = getInvalidInputs(currentStep);

      //   if (invalidInputs.length > 0) {
      //     // showInvalidPopUp(invalidInputs);
      //     return; // Stop navigation if invalid
      //   }
      // }

      // 3) If valid (or if we skipped Step 1), proceed to the next step
      const interestRateInput = document.querySelector(
        '[data-input="interest-rate"]'
      );
      if (interestRateInput) {
        interestRateInput.addEventListener("input", function () {
          // Remove any non-numeric characters (except for decimal point)
          const cleanedValue = interestRateInput.value.replace(/[^0-9.]/g, "");
          const numericValue = parseFloat(cleanedValue);

          // If the value is empty, not a number, or less than or equal to 0, mark as invalid.
          if (!cleanedValue || isNaN(numericValue) || numericValue <= 0) {
            interestRateInput.classList.remove("is-valid");
            interestRateInput.classList.add("is-invalid");
          } else {
            interestRateInput.classList.remove("is-invalid");
            interestRateInput.classList.add("is-valid");
          }
          // Re-run the overall validation for step 2.
          checkInputsValidity();
        });
      }
    });
  });

  // document.addEventListener("DOMContentLoaded", function () {
  //   const interestRateInput = document.querySelector(
  //     '[data-input="interest-rate"]'
  //   );
  //   if (interestRateInput) {
  //     interestRateInput.addEventListener("input", function () {
  //       // Remove any non-numeric characters (except for decimal point)
  //       const cleanedValue = interestRateInput.value.replace(/[^0-9.]/g, "");
  //       const numericValue = parseFloat(cleanedValue);

  //       // If the value is empty, not a number, or less than or equal to 0, mark as invalid.
  //       if (!cleanedValue || isNaN(numericValue) || numericValue <= 0) {
  //         interestRateInput.classList.remove("is-valid");
  //         interestRateInput.classList.add("is-invalid");
  //       } else {
  //         interestRateInput.classList.remove("is-invalid");
  //         interestRateInput.classList.add("is-valid");
  //       }
  //       // Re-run the overall validation for step 2.
  //       checkInputsValidity();
  //     });
  //   }
  // });

  //
  document.querySelectorAll('[data-alt="back"]').forEach(function (backButton) {
    backButton.addEventListener("click", function () {
      var currentStep = this.closest("[data-step]");
      var currentStepNumber = parseInt(currentStep.getAttribute("data-step"));

      var previousStepNumber = currentStepNumber - 1;
      var previousStep = document.querySelector(
        '[data-step="' + previousStepNumber + '"]'
      );

      if (previousStep) {
        hideStep(currentStep, previousStep);
      }
      addStepToParams(previousStepNumber.toString());
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Click event: Handle "is-active" toggling within [data-tag="wrapper"]
  document.addEventListener("click", function (event) {
    const clickedElement = event.target.closest('[data-tag="wrapper"] > *');

    if (clickedElement) {
      const wrapper = clickedElement.closest('[data-tag="wrapper"]');

      if (wrapper) {
        // Remove 'is-active' and 'is-valid' from all children inside the same wrapper
        wrapper
          .querySelectorAll('[data-tag="wrapper"] > .is-active')
          .forEach(function (activeItem) {
            activeItem.classList.remove("is-active", "is-valid");
          });

        // Add 'is-active' and 'is-valid' to the clicked element
        clickedElement.classList.add("is-active", "is-valid");
      }
    }
  });

  // Change event: Call functions specified in the data-onchange attribute
  const selectElements = document.querySelectorAll("[data-onchange]");
  selectElements.forEach(function (selectElement) {
    selectElement.addEventListener("change", function (event) {
      const functionName = selectElement.getAttribute("data-onchange");

      if (typeof window[functionName] === "function") {
        window[functionName](event); // Call the function
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Select the <select> element with data-input="mortgage-type"
  const mortgageSelect = document.querySelector('[data-input="mortgage-type"]');
  if (mortgageSelect) {
    mortgageSelect.addEventListener("change", function () {
      // Re-validate dependent fields
      const dependentFields = [
        '[data-input="interest-rate"]',
        '[data-input="30-year-fixed"]',
        '[data-input="home-value-est"]',
        // Add other dependent fields here if any
      ];

      dependentFields.forEach((selector) => {
        const field = document.querySelector(selector);
        if (field) {
          // Dispatch an 'input' event to trigger validation
          field.dispatchEvent(new Event("input"));
        }
      });
    });
  }

  // Select all elements that should be hidden when "No mortgage" is selected
  const elementsToHide = document.querySelectorAll(
    '[data-alt="hide-no-mortgage"]'
  );

  // Function to toggle visibility based on the selected mortgage type
  function toggleVisibility() {
    if (mortgageSelect.value === "No mortgage") {
      elementsToHide.forEach(function (el) {
        el.style.display = "none";
      });
    } else {
      elementsToHide.forEach(function (el) {
        el.style.display = "";
      });
    }
  }

  // Attach the change event listener to the select element
  mortgageSelect.addEventListener("change", toggleVisibility);

  // Perform an initial check in case the default value requires hiding elements
  toggleVisibility();
});

document.addEventListener("DOMContentLoaded", function () {
  // Select elements with data-tag="phone"
  document
    .querySelectorAll('[data-input="phone"]')
    .forEach(function (phoneInput) {
      phoneInput.addEventListener("input", function () {
        var phone = this.value.replace(/\D/g, ""); // Remove non-digit characters
        this.value = phone.slice(0, 10); // Limit to 10 digits
      });
    });
});

// Function to log with timestamp and category
function logWithDetails(category, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    category,
    message,
    data,
  };
  console.log(JSON.stringify(logMessage, null, 2));
}

// Function to validate address string
// function isValidAddress(address) {
//   logWithDetails("ADDRESS_VALIDATION", "Starting address validation", {
//     address,
//   });

//   if (!address) {
//     logWithDetails("ADDRESS_VALIDATION", "Address is empty or null");
//     return false;
//   }

//   // Remove USA if present
//   address = address.replace(", USA", "");
//   logWithDetails("ADDRESS_VALIDATION", "Processed address after USA removal", {
//     processedAddress: address,
//   });

//   // Check if we have at least street, city, and state
//   const parts = address.split(", ");
//   const isValid = parts.length >= 3 && parts[2].includes(" ");

//   logWithDetails("ADDRESS_VALIDATION", "Validation result", {
//     parts,
//     isValid,
//     reason: isValid ? "Address is valid" : "Address is missing required parts",
//   });

//   // If address validation fails, show Step 1 and hide the loading step
//   if (!isValid) {
//     // Hide the loading step
//     const loadingStep = document.querySelector('[data-step="loading"]');
//     if (loadingStep) {
//       loadingStep.style.display = "none";
//     }

//     // Show Step 1
//     const stepOne = document.querySelector('[data-step="1"]');
//     if (stepOne) {
//       stepOne.style.display = "block";
//       stepOne.style.opacity = "1"; // Optional: Ensure visibility
//     }

//     // Optionally, provide feedback to the user
//     const errorElement = document.querySelector('[data-input="question"]');
//     if (errorElement) {
//       errorElement.textContent =
//         "Please re-enter your address, select an option and try again.";
//       errorElement.style.display = "block"; // Show the error message
//     }
//     // Enable the button with data-trigger="address-validation"
//     const validationButton = document.querySelector(
//       '[data-trigger="address-validation"]'
//     );
//     if (validationButton) {
//       validationButton.removeAttribute("disabled"); // Enable the button
//     }
//     return false; // Stop further execution
//   }

//   return isValid;
// }

// Function to parse address string
// function parseAddress(address) {
//   logWithDetails("ADDRESS_PARSING", "Starting address parsing", {
//     originalAddress: address,
//   });

//   // Remove USA if present
//   address = address.replace(", USA", "");
//   logWithDetails("ADDRESS_PARSING", "Address after USA removal", {
//     processedAddress: address,
//   });

//   // Split the address into components
//   const parts = address.split(", ");
//   const streetAddress = parts[0];
//   const city = parts[1];
//   const stateZip = parts[2].split(" ");
//   const zipCode = stateZip[1] || "";

//   const parsedData = {
//     streetAddress,
//     zipCode,
//   };

//   logWithDetails("ADDRESS_PARSING", "Completed address parsing", {
//     parts,
//     stateZip,
//     parsedData,
//   });

//   return parsedData;
// }
function parseAddress(address) {
  logWithDetails("ADDRESS_PARSING", "Starting address parsing", {
    originalAddress: address,
  });

  // Remove USA if present
  address = address.replace(", USA", "");
  logWithDetails("ADDRESS_PARSING", "Address after USA removal", {
    processedAddress: address,
  });

  // Split the address into components based on commas
  const parts = address.split(", ");
  const streetAddress = parts[0];

  // Improved Regular Expression to capture state abbreviation and zip code
  let stateZipPart = parts[parts.length - 1];
  const stateZipMatch = stateZipPart.match(/([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/);

  let state = "";
  let zipCode = "";

  if (stateZipMatch) {
    state = stateZipMatch[1];
    zipCode = stateZipMatch[2];

    // Handle cases with full state names (e.g., South Carolina)
    if (parts.length > 2) {
      const potentialStateName = parts[parts.length - 2];
      const abbreviatedState = transformStateToAbbrev(potentialStateName);

      if (abbreviatedState) {
        state = abbreviatedState;
        parts.pop(); // Remove zip code part
        parts.pop(); // Remove full state name part
        parts.push(state + " " + zipCode); // Add back state abbreviation and zip code
      }
    }
  } else {
    console.error(
      "State and Zip Code not found in the expected format:",
      stateZipPart
    );
  }

  // Extract City (more robust handling)
  const city = parts.slice(1, -1).join(", ");

  const parsedData = {
    streetAddress,
    city,
    state,
    zipCode,
  };

  logWithDetails("ADDRESS_PARSING", "Completed address parsing", {
    parts,
    stateZip: stateZipMatch,
    parsedData,
  });

  return parsedData;
}

// // Function to update form fields based on API response
// function prefillForm(data) {
//   // Check if we have valid data structure
//   if (!data || !data.data || !data.data.property) {
//     console.error("Invalid API response structure", data);
//     return; // Exit early if data is not in expected format
//   }

//   const propertyData = data.data.property;
//   // logWithDetails("FORM_PREFILL", "Extracted property data", { propertyData });

//   function determine_acres(acreage) {
//     console.log("in acre determine func", acreage);
//     const acreageValue = parseFloat(acreage);
//     // Check if the value is valid
//     if (isNaN(acreageValue)) {
//       throw new Error("Invalid acreage value");
//     }

//     // Determine the result based on the acreage value
//     return acreageValue > 0.5 ? "> .5 acre" : "< .5 acre";
//   }

//   // Map API responses to form field values
//   const fieldMappings = {
//     "type-of-home": (val) => {
//       const mapping = {
//         SingleFamily: "Single-family detached home", // Add this
//         "Single Family": "Single-family detached home",
//         Townhouse: "Townhome",
//         Duplex: "Duplex",
//         Condo: "Condominium",
//       };
//       const mappedValue = mapping[val] || val;

//       return mappedValue;
//     },
//     // bedrooms: (val) => {
//     //   const mappedValue = parseFloat(val) >= 5 ? "5+" : val;

//     //   return mappedValue;
//     // },
//     // bathrooms: (val) => {
//     //   const mappedValue =
//     //     parseFloat(val) >= 3 ? "3+" : Math.floor(parseFloat(val)).toString();

//     //   return mappedValue;
//     // },
//     bedrooms: (val) => {
//       // If 0 or empty, return an empty string (not valid)
//       if (!val || val === "0") {
//         return "";
//       }
//       // If 5 or more, show "5+"
//       const numericVal = parseFloat(val);
//       return numericVal >= 5 ? "5+" : val;
//     },
//     bathrooms: (val) => {
//       // If 0 or empty, return an empty string (not valid)
//       if (!val || parseFloat(val) === 0) {
//         return "";
//       }
//       // If 3 or more, show "3+"
//       const numericVal = parseFloat(val);
//       return numericVal >= 3 ? "3+" : Math.floor(numericVal).toString();
//     },

//     acres: (val) => {
//       mappedValue = determine_acres(val);
//       return mappedValue;
//     },
//     "square-foot": (val) => {
//       return val;
//     },
//     "mortgage-type": (val) => {
//       if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
//         return "No mortgage";
//       }
//       const mortgage = propertyData.mortgages[0];
//       const mappedValue = mortgage.mortgageType?.includes("Conventional")
//         ? "Conventional"
//         : mortgage.mortgageType?.includes("FHA")
//         ? "FHA"
//         : "Other";

//       return mappedValue;
//     },
//     "interest-rate": (val) => {
//       if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
//         return "";
//       }
//       const rate = propertyData.mortgages[0].interestRate || "";
//       // logWithDetails("FIELD_MAPPING", "Mapping interest rate", { rate });
//       return rate;
//     },
//     "30-year-fixed": (val) => {
//       if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
//         // logWithDetails("FIELD_MAPPING", "No mortgage data found for term type");
//         return "No";
//       }
//       const mortgage = propertyData.mortgages[0];
//       const isThirtyYearFixed =
//         mortgage.term === "30" && mortgage.loanType === "Fixed";

//       return isThirtyYearFixed ? "Yes" : "No";
//     },
//     "home-value-est": (val) => {
//       if (
//         !propertyData.valueEstimates ||
//         propertyData.valueEstimates.length === 0
//       ) {
//         console.log("No value estimates found");
//         return "";
//       }

//       const estimate = parseInt(propertyData.valueEstimates[0].estimate);
//       console.log("Raw estimate:", estimate);

//       function formatRange(min, max) {
//         if (max === 650000) {
//           return "$650,000+";
//         }
//         // Using regular hyphen (-) to match select options
//         return `$${min / 1000},000 - $${max / 1000},000`;
//       }

//       const ranges = [
//         [200000, 250000],
//         [250000, 300000],
//         [300000, 350000],
//         [350000, 400000],
//         [400000, 450000],
//         [450000, 500000],
//         [500000, 550000],
//         [550000, 600000],
//         [600000, 650000],
//       ];

//       let mappedValue = "";

//       // Debug the ranges check
//       for (let [min, max] of ranges) {
//         if (estimate >= min && estimate < max) {
//           mappedValue = formatRange(min, max);

//           break;
//         }
//       }

//       // Handle the edge cases
//       if (!mappedValue) {
//         if (estimate >= 650000) {
//           mappedValue = "$650,000+";
//         } else if (estimate < 200000) {
//           mappedValue = "$200,000 - $250,000";
//         }
//       }

//       // Log the select element's options for debugging
//       const selectElement = document.querySelector(
//         '[data-input="home-value-est"]'
//       );
//       if (selectElement) {
//         console.log(
//           "Available options:",
//           Array.from(selectElement.options).map((opt) => opt.text)
//         );
//       }

//       return mappedValue;
//     },
//   };

// Function to update form fields based on API response
function prefillForm(data) {
  // Check if we have valid data structure
  if (!data || !data.data || !data.data.property) {
    console.error("Invalid API response structure", data);
    return; // Exit early if data is not in expected format
  }

  const propertyData = data.data.property;
  // logWithDetails("FORM_PREFILL", "Extracted property data", { propertyData });

  function determine_acres(acreage) {
    console.log("in acre determine func", acreage);
    const acreageValue = parseFloat(acreage);
    // Check if the value is valid
    if (isNaN(acreageValue)) {
      throw new Error("Invalid acreage value");
    }

    // Determine the result based on the acreage value
    return acreageValue > 0.5 ? "> .5 acre" : "< .5 acre";
  }

  // Function to check if a value is effectively zero
  function isEffectivelyZero(val) {
    if (
      val === "" ||
      val === "0" ||
      val === 0 ||
      val === null ||
      val === undefined
    ) {
      return true;
    }
    // Remove non-numeric characters and check if the parsed value is zero
    const numericValue = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return !isNaN(numericValue) && numericValue === 0;
  }

  // Map API responses to form field values
  const fieldMappings = {
    "type-of-home": (val) => {
      const mapping = {
        SingleFamily: "Single-family detached home", // Add this
        "Single Family": "Single-family detached home",
        Townhouse: "Townhome",
        Duplex: "Duplex",
        Condo: "Condominium",
      };
      const mappedValue = mapping[val] || val;

      return mappedValue;
    },
    bedrooms: (val) => {
      // If 0 or empty, return an empty string (not valid)
      if (!val || val === "0") {
        return "";
      }
      // If 5 or more, show "5+"
      const numericVal = parseFloat(val);
      return numericVal >= 5 ? "5+" : val;
    },
    bathrooms: (val) => {
      // If 0 or empty, return an empty string (not valid)
      if (!val || parseFloat(val) === 0) {
        return "";
      }
      // If 3 or more, show "3+"
      const numericVal = parseFloat(val);
      return numericVal >= 3 ? "3+" : Math.floor(numericVal).toString();
    },

    acres: (val) => {
      mappedValue = determine_acres(val);
      return mappedValue;
    },
    "square-foot": (val) => {
      return val;
    },
    // "mortgage-type": (val) => {
    //   if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
    //     return "No mortgage";
    //   }
    //   const mortgage = propertyData.mortgages[0];
    //   const mappedValue = mortgage.mortgageType?.includes("Conventional")
    //     ? "Conventional"
    //     : mortgage.mortgageType?.includes("FHA")
    //     ? "FHA"
    //     : "Other";

    //   return mappedValue;
    // },
    "mortgage-type": (val) => {
      if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
        return "No mortgage";
      }
      const mortgage = propertyData.mortgages[0];

      const mappedValue = mortgage.mortgageType?.includes("Conventional")
        ? "Conventional"
        : mortgage.mortgageType?.includes("FHA")
        ? "FHA"
        : mortgage.mortgageType?.includes("VA")
        ? "VA"
        : "Other";

      return mappedValue;
    },
    // "interest-rate": (val) => {
    //   if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
    //     return "";
    //   }
    //   const rate = propertyData.mortgages[0].interestRate || "";
    //   // logWithDetails("FIELD_MAPPING", "Mapping interest rate", { rate });
    //   return rate;
    // },
    "interest-rate": (val) => {
      if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
        return "";
      }
      const rate = propertyData.mortgages[0].interestRate || "";
      // Add the following condition:
      if (rate === "" || parseFloat(rate) === 0) {
        const interestRateInput = document.querySelector(
          '[data-input="interest-rate"]'
        );
        if (interestRateInput) {
          interestRateInput.classList.remove("is-valid");
          interestRateInput.classList.add("is-invalid");
        }
      }

      // logWithDetails("FIELD_MAPPING", "Mapping interest rate", { rate });
      return rate;
    },
    "30-year-fixed": (val) => {
      if (!propertyData.mortgages || propertyData.mortgages.length === 0) {
        // logWithDetails("FIELD_MAPPING", "No mortgage data found for term type");
        return "No";
      }
      const mortgage = propertyData.mortgages[0];
      const isThirtyYearFixed =
        mortgage.term === "30" && mortgage.loanType === "Fixed";

      return isThirtyYearFixed ? "Yes" : "No";
    },
    "home-value-est": (val) => {
      if (
        !propertyData.valueEstimates ||
        propertyData.valueEstimates.length === 0
      ) {
        console.log("No value estimates found");
        return "";
      }

      const estimate = parseInt(propertyData.valueEstimates[0].estimate);
      console.log("Raw estimate:", estimate);

      function formatRange(min, max) {
        if (max === 650000) {
          return "$650,000+";
        }
        // Using regular hyphen (-) to match select options
        return `$${min / 1000},000 - $${max / 1000},000`;
      }

      const ranges = [
        [200000, 250000],
        [250000, 300000],
        [300000, 350000],
        [350000, 400000],
        [400000, 450000],
        [450000, 500000],
        [500000, 550000],
        [550000, 600000],
        [600000, 650000],
      ];

      let mappedValue = "";

      // Debug the ranges check
      for (let [min, max] of ranges) {
        if (estimate >= min && estimate < max) {
          mappedValue = formatRange(min, max);

          break;
        }
      }

      // Handle the edge cases
      if (!mappedValue) {
        if (estimate >= 650000) {
          mappedValue = "$650,000+";
        } else if (estimate < 200000) {
          mappedValue = "$200,000 - $250,000";
        }
      }

      // Log the select element's options for debugging
      const selectElement = document.querySelector(
        '[data-input="home-value-est"]'
      );
      if (selectElement) {
        console.log(
          "Available options:",
          Array.from(selectElement.options).map((opt) => opt.text)
        );
      }

      return mappedValue;
    },
  };

  // Loop through all elements with data-input attribute
  // Get the specific parent or div element
  const parent = document.querySelector('[data-step="2"]');
  const elements = parent.querySelectorAll("[data-input]");

  elements.forEach((element) => {
    const inputType = element.getAttribute("data-input");

    if (!fieldMappings[inputType]) {
      return;
    }

    let value;
    switch (inputType) {
      case "type-of-home":
        value = fieldMappings[inputType](propertyData.homeType);
        break;
      case "bedrooms":
        value = fieldMappings[inputType](propertyData.numOfBeds);
        break;
      case "bathrooms":
        value = fieldMappings[inputType](propertyData.numOfBaths);
        break;
      case "square-foot":
        value = fieldMappings[inputType](propertyData.squareFootage);
        break;
      case "mortgage-type":
      case "interest-rate":
      case "30-year-fixed":
      case "home-value-est":
        value = fieldMappings[inputType]();
        break;
      case "acres":
        value = fieldMappings[inputType](propertyData.acreage);
        break;
      default:
        console.error("Unhandled inputType:", inputType);
        break;
    }

    if (value !== undefined) {
      if (element.tagName === "SELECT") {
        const option = Array.from(element.options).find(
          (opt) => opt.text === value
        );
        // if (option) {
        //   element.value = option.value;
        //   element.classList.add("is-valid");
        // } else {
        //   element.classList.add("is-invalid");
        // }
        if (option) {
          element.value = option.value;
          element.classList.add("is-valid");
          element.classList.remove("is-invalid"); // Ensure 'is-invalid' is removed
        } else {
          element.classList.add("is-invalid");
          element.classList.remove("is-valid"); // Ensure 'is-valid' is removed
        }
        // } else {
        //   element.value = value;
        //   element.classList.add("is-valid");
        // }
      } else {
        element.value = value;
        if (isEffectivelyZero(value)) {
          element.classList.remove("is-valid");
          element.classList.add("is-invalid");
        } else {
          element.classList.remove("is-invalid");
          element.classList.add("is-valid");
        }
      }
    }
  });
  checkInputsValidity();
}

// function validateAddressResponse(data) {
//   let isValid = true;
//   const msaValid = data?.data?.property?.locationProfile?.isInOperatedMSA;
//   if (msaValid == false) {
//     isValid = false;
//     return isValid;
//   }
//   return isValid;
// }

// function validateAddressResponse(data) {
//   let isValid = true;
//   const zipValid = data?.data?.property?.locationProfile?.isInPreferredZipCode;
//   if (zipValid == false) {
//     isValid = false;
//     return isValid;
//   }
//   return isValid;
// }

// function validateAddressResponse(data) {
//   // Extract the location profile from the API response
//   const location = data?.data?.property?.locationProfile;

//   // First: If the zip code is preferred, pass.
//   if (location?.isInPreferredZipCode === true) {
//     return true;
//   }

//   // Second: If the zip code is not preferred but the property is in an operated MSA, pass.
//   if (location?.isInOperatedMSA === true) {
//     return true;
//   }

//   // Third: If neither the zip code nor the MSA condition is met, fail.
//   return false;
// }

function validateAddressResponse(data) {
  let location = data?.data?.property?.locationProfile;

  if (!location && data?.errors && data.errors.length > 0) {
    location = data.errors[0]?.extensions?.locationProfile;
  }

  if (location?.isInPreferredZipCode === true) {
    return true;
  }

  if (location?.isInOperatedMSA === true) {
    return true;
  }

  return false;
}

function addStepToParams(step) {
  if (!step || isNaN(step)) {
    console.error("Invalid step value. Must be a valid number as a string.");
    return;
  }

  // Get the current URL
  const url = new URL(window.location.href);

  // Set the 'step' parameter
  url.searchParams.set("step", step);

  // Update the browser's URL without reloading the page
  window.history.replaceState({}, "", url.toString());
}

function removeStepFromParams(step) {
  if (!step || isNaN(step)) {
    console.error("Invalid step value. Must be a valid number as a string.");
    return;
  }

  // Get the current URL
  const url = new URL(window.location.href);

  // Get the current 'step' parameter value
  const currentStep = url.searchParams.get("step");

  // Check if the step matches the current 'step' parameter
  if (currentStep === step) {
    url.searchParams.delete("step"); // Remove the 'step' parameter
    window.history.replaceState({}, "", url.toString()); // Update the browser's URL
  } else {
    console.log(`Step '${step}' not found in the URL parameters.`);
  }
}

const basePayload = {
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
    // agentBrokerage: "",
    homeownerCommunicationConsent: true,
    // homeownerConsentToShareInfo: true,
  },
  isQualified: false,
  locationProfile: {
    isInPreferredZipCode: false,
    isInOperatedMSA: false,
    isInOperatedState: false,
    eligibilityCheck: "Failed",
  },
  homeProfile: [
    {
      id: "HOME_TYPE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "BEDS",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "BATHS",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "ACRES",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "SQUARE_FOOTAGE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "MORTGAGE_TYPE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "MORTGAGE_INTEREST_RATE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "MORTGAGE_LOAN_TYPE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "MORTGAGE_TERM",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "ESTIMATED_VALUE",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "HOME_CONDITION",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "SOLAR",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "GARAGE",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "POOL",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "TIME_TO_MOVE",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "MORTGAGE_ESTIMATED_BALANCE",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "MORTGAGE_MONTHLY_PAYMENT",
      value: "",
      eligibilityCheck: "Passed",
    },
    {
      id: "MORTGAGE_INCLUDES_TAXES_INSURANCE",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "TAX_AMOUNT",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "INSURANCE_AMOUNT",
      value: "",
      eligibilityCheck: "Ignored",
    },
    {
      id: "HOA_MONTHLY",
      value: "",
      eligibilityCheck: "Ignored",
    },
  ],
  reasonUnqualified: "",
};

// function formatEstimatedValue(str) {
//   return str.replace(/\$([\d,]+)\s*-\s*\$([\d,]+)/, (match, lower, upper) => {
//     const lowerNum = parseInt(lower.replace(/,/g, ""), 10) / 1000;
//     const upperNum = parseInt(upper.replace(/,/g, ""), 10) / 1000;
//     return `$${lowerNum.toFixed(3)} - $${upperNum.toFixed(3)}`;
//   });
// }

function updateHomeAddressPayload(data) {
  console.log("data coming into updateHomeAddressPayload", data);
  basePayload.streetAddress = data.streetAddress;
  basePayload.city = data.city;
  basePayload.state = data.stateAbbrev;
  basePayload.zipCode = data.zipCode;

  function updateHomeProfileValues(id, newValue) {
    const item = basePayload.homeProfile.find((item) => item.id === id);
    if (item) {
      item.value = newValue || "";
      return item;
    }
  }

  updateHomeProfileValues("HOME_TYPE", data.homeType);
  updateHomeProfileValues("BEDS", data.numOfBaths);
  updateHomeProfileValues("BATHS", data.numOfBaths);
  updateHomeProfileValues("ACRES", data.acreage);
  updateHomeProfileValues("SQUARE_FOOTAGE", data.squareFootage);
  updateHomeProfileValues(
    "MORTGAGE_INTEREST_RATE",
    data.mortgages?.[0].interestRate
  );
  updateHomeProfileValues("MORTGAGE_LOAN_TYPE", data.mortgages?.[0].loanType);
  updateHomeProfileValues("MORTGAGE_TERM", data.mortgages?.[0].term);
  updateHomeProfileValues("ESTIMATED_VALUE", data.valueEstimates?.[0].estimate);

  // basePayload.homeProfile[0].value = data.homeType;
  // basePayload.homeProfile[1].value = data.numOfBeds;
  // basePayload.homeProfile[2].value = data.numOfBaths;
  // basePayload.homeProfile[3].value = data.squareFootage;
  // basePayload.homeProfile[4].value = data.acreage;

  // basePayload.homeProfile[5].value = data.mortgages?.[0]?.mortgageType;
  // basePayload.homeProfile[6].value = data.mortgages?.[0]?.interestRate;
  // basePayload.homeProfile[7].value = data.mortgages?.[0]?.loanType;
  // basePayload.homeProfile[8].value = data.mortgages?.[0]?.term;
  // basePayload.homeProfile[9].value = data.valueEstimates?.[0]?.estimate;
  // // basePayload.homeProfile[9].value = data.valueEstimates?.[0]?.estimate
  //   ? formatEstimatedValue(data.valueEstimates[0].estimate)
  //   : null;
  basePayload.homeProfile[10].value = data.mortgageIncludesTaxesInsurance;
  basePayload.homeProfile[11].value = data.taxAmount;
  basePayload.homeProfile[12].value = data.insuranceAmount;
  basePayload.homeProfile[13].value = data.hoaMonthly;

  basePayload.locationProfile.isInOperatedMSA =
    data.locationProfile.isInOperatedMSA;
  basePayload.locationProfile.isInOperatedState =
    data.locationProfile.isInOperatedState;
  basePayload.locationProfile.isInPreferredZipCode =
    data.locationProfile.isInPreferredZipCode;
  console.log("basePayload updated with house address", basePayload);
}

function updateHomeAddressPayloadFromSession(data) {
  console.log("function call update", data);
  basePayload.streetAddress = `${data.components.streetNumber}  ${data.components.street}`;
  basePayload.city = data.components.city;
  basePayload.state = transformStateToAbbrev(data.components.state);
  basePayload.zipCode = data.components.zip;
  console.log("function call update2", basePayload);
}

function transformStateToAbbrev(state) {
  // Optional: normalize the input, e.g.:
  // state = state.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const statesMap = {
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
  };

  // Return the abbreviation if it exists, otherwise null
  return statesMap[state] || null;
}

function validateNonEmptyAddress() {
  const input = document.querySelector('[data-input="address"]');
  if (input.value.trim() === "") {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    return false;
  } else {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  }
}
// // Main function to handle address submission
async function handleAddressSubmission() {
  if (!validateNonEmptyAddress()) {
    console.log("ADDRESS STEP INVALID");
    return;
  }
  //// new this blocks a user from submitting without selecting an address from the dropdown
  /// struct_address is set in the dropdown click event in GLOBAL JS
  // this file is in the custom code global settings in webflow
  const structAddress = sessionStorage.getItem("struct_address");
  if (!structAddress) {
    // If not set, alert the user and mark the input as invalid.
    // alert("Please select an address from the dropdown to continue.");
    const addressInput = document.querySelector('[data-input="address"]');
    if (addressInput) {
      addressInput.classList.remove("is-valid");
      addressInput.classList.add("is-invalid");
    }
    // Return early to block further progression (including the API call).
    return;
  }
  ////new ^^^^
  var currentStep = document.querySelector('[data-step="1"]');
  var currentStepNumber = parseInt(currentStep.getAttribute("data-step"));

  var previousStepNumber = currentStepNumber - 1;
  var previousStep = document.querySelector(
    '[data-step="' + previousStepNumber + '"]'
  );
  showLoading(currentStepNumber);
  const nextStepNumber = currentStepNumber + 1;
  addStepToParams(nextStepNumber.toString());

  const startTime = performance.now();
  logWithDetails("SUBMISSION", "Starting address submission");

  const addressInput = document.querySelector('[data-input="address"]');
  const addressString = addressInput.value;

  try {
    // if (!isValidAddress(addressString)) {
    //   const endTime = performance.now();
    //   const timeElapsed = endTime - startTime;
    //   console.log(
    //     `Address validation failed after ${timeElapsed.toFixed(2)}ms`
    //   );

    //   logWithDetails("SUBMISSION", "Address validation failed");
    //   return;
    // }

    // bonus api https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty
    // shanes api https://kfhxu6otvh.execute-api.us-east-2.amazonaws.com/validate

    const addressData = parseAddress(addressString);
    logWithDetails("SUBMISSION", "Prepared API request", { addressData });

    logWithDetails("API_REQUEST", "Sending API request", {
      url: "https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty",
      payload: addressData,
    });

    const response = await fetch(
      "https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      }
    );

    console.log("Response Status:", response.status);

    const data = await response.json();
    sessionStorage.setItem("api_response_data_address", JSON.stringify(data));
    // addressInput.classList.remove("is-invalid");
    // addressInput.classList.add("is-valid");

    console.log("API Response:", data);
    // current code

    if (
      (data.errors &&
        data.errors[0]?.extensions?.code === "PROPERTY_NOT_FOUND") ||
      data.data.property === null
    ) {
      console.warn("Property not found in API response.");

      // // Update basePayload.locationProfile using the alternative locationProfile from the response
      // // (Note: In your API sample, locationProfile is returned at the top level.)
      // // Update basePayload.locationProfile dynamically based on the API response.
      // const locationProfileData =
      //   data.locationProfile || data.data.locationProfile;

      // if (locationProfileData) {
      //   console.log("Found location profile in response:", locationProfileData);
      //   basePayload.locationProfile.isInOperatedMSA =
      //     locationProfileData.isInOperatedMSA;
      //   basePayload.locationProfile.isInOperatedState =
      //     locationProfileData.isInOperatedState;
      //   basePayload.locationProfile.isInPreferredZipCode =
      //     locationProfileData.isInPreferredZipCode;
      // } else {
      //   console.warn(
      //     "No locationProfile data found in API response; using fallback values."
      //   );
      //   basePayload.locationProfile.isInOperatedMSA = false;
      //   basePayload.locationProfile.isInOperatedState = false;
      //   basePayload.locationProfile.isInPreferredZipCode = false;
      // }
      // basePayload.locationProfile.eligibilityCheck = "Failed";

      // Try to grab the location profile from the API response.
      // It might be returned at the top level (data.locationProfile)
      // or nested inside the data object (data.data.locationProfile).
      // const locationProfileData =
      //   data.locationProfile || data.errors[0]?.extensions?.locationProfile;

      // if (locationProfileData) {
      //   console.log("Found location profile in response:", locationProfileData);

      //   // Update the existing locationProfile object rather than replacing it.
      //   Object.assign(basePayload.locationProfile, locationProfileData);
      //   basePayload.locationProfile.eligibilityCheck = "Failed";
      // } else {
      //   console.warn(
      //     "No locationProfile data found in API response; using fallback values."
      //   );
      //   Object.assign(basePayload.locationProfile, {
      //     isInOperatedMSA: false,
      //     isInOperatedState: false,
      //     isInPreferredZipCode: false,
      //     eligibilityCheck: "Failed",
      //   });
      // }

      //
      // Before redirecting, update the address portion of the payload from session storage
      const structAddress = JSON.parse(
        sessionStorage.getItem("struct_address")
      );
      if (structAddress && structAddress.components) {
        basePayload.streetAddress = `${structAddress.components.streetNumber} ${structAddress.components.street}`;
        basePayload.city = structAddress.components.city;
        // Use transformStateToAbbrev if available; otherwise, use the full state name
        basePayload.state =
          transformStateToAbbrev(structAddress.components.state) ||
          structAddress.components.state;
        basePayload.zipCode = structAddress.components.zip;
      } else {
        console.warn(
          "struct_address not found or missing components; address fields remain empty."
        );
      }

      // Update the locationProfile dynamically (using Object.assign to update the existing object)
      const locationProfileData =
        data.locationProfile || data.errors[0]?.extensions?.locationProfile;

      if (locationProfileData) {
        console.log("Found location profile in response:", locationProfileData);
        Object.assign(basePayload.locationProfile, locationProfileData);
        basePayload.locationProfile.eligibilityCheck = "Passed";
      } else {
        console.warn(
          "No locationProfile data found in API response; using fallback values."
        );
        Object.assign(basePayload.locationProfile, {
          isInOperatedMSA: false,
          isInOperatedState: false,
          isInPreferredZipCode: false,
        });
      }
      console.log("basePayload after address not found", basePayload);
      //
      // sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
      // window.location.href = "/submit-not-in-zip";

      if (!validateAddressResponse(data)) {
        // If validation fails (i.e. none of Zip, MSA, or State is true), mark as Failed and redirect.
        basePayload.locationProfile.eligibilityCheck = "Failed";
        sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
        window.location.href = "/submit-not-in-zip";
        return;
      } else {
        // If at least one is true, mark as Passed.
        basePayload.locationProfile.eligibilityCheck = "Passed";
        basePayload.isQualified = true;
      }
    }

    try {
      // // Attempt to access the nested property
      // const property = data.data.property;
      // console.log("Property:", property);
      // sessionStorage.setItem("homeData", JSON.stringify(data.data.property));
      // updateHomeAddressPayload(data.data.property);
      // if (!validateAddressResponse(data)) {
      //   sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
      // Attempt to access the nested property
      const property = data.data.property;
      console.log("Property:", property);
      sessionStorage.setItem("homeData", JSON.stringify(data.data.property));

      updateHomeAddressPayload(data.data.property);

      if (!validateAddressResponse(data)) {
        // --- Run Validation and Update eligibilityCheck ---
        basePayload.locationProfile.eligibilityCheck = "Failed"; // Location failed

        // 1. Create a formData object from the current basePayload values:
        const formData = {};
        basePayload.homeProfile.forEach((item) => {
          switch (item.id) {
            case "HOME_TYPE":
              formData.home_type = item.value;
              break;
            case "BEDS":
              formData.beds = item.value;
              break;
            case "BATHS":
              formData.baths = item.value;
              break;
            case "ACRES":
              formData.acres = item.value;
              break;
            case "SQUARE_FOOTAGE":
              formData.square_footage = item.value;
              break;
            case "MORTGAGE_TYPE":
              formData.mortgage_type = item.value;
              break;
            case "MORTGAGE_INTEREST_RATE":
              formData.mortgage_interest_rate = item.value;
              break;
            case "MORTGAGE_LOAN_TYPE":
              formData.isThirtyYearFixed = item.value;
              break;
            case "MORTGAGE_TERM":
              formData.mortgage_term = item.value; // Assign value, then add " years" below
              break;
            case "ESTIMATED_VALUE":
              formData.estimated_value = item.value;
              break;
            // Add cases for other fields as needed
          }
        });

        // 2. Add " years" to MORTGAGE_TERM in formData
        formData.mortgage_term += " years";
        // this was added to ensure the interest rate was fomatted correctly before redirect
        // Ensure the mortgage interest rate always has "%" appended.
        if (formData.mortgage_interest_rate) {
          if (!formData.mortgage_interest_rate.trim().endsWith("%")) {
            formData.mortgage_interest_rate = `${parseFloat(
              formData.mortgage_interest_rate
            ).toFixed(2)}%`;
          }
        }
        // Also update basePayload.homeProfile if needed (optional)
        const mortgageInterestItem = basePayload.homeProfile.find(
          (item) => item.id === "MORTGAGE_INTEREST_RATE"
        );
        if (mortgageInterestItem && mortgageInterestItem.value) {
          const rawRate = parseFloat(mortgageInterestItem.value) || 0;
          mortgageInterestItem.value =
            rawRate > 0 ? `${rawRate.toFixed(2)}%` : "";
        }

        // 3. Call homeDataValid with the formData:
        console.log("formData for invalid address reponse", formData);
        homeDataValid(formData); // This will update eligibilityCheck in basePayload

        // 4. Update basePayload.homeProfile[MORTGAGE_TERM].value:
        const mortgageTermItem = basePayload.homeProfile.find(
          (item) => item.id === "MORTGAGE_TERM"
        );
        if (mortgageTermItem) {
          mortgageTermItem.value += " years"; // Add " years" to the value in basePayload
        }

        sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
        window.location.href = "/submit-not-in-zip";
        return;
      } else {
        // If the validation passes, update eligibilityCheck to "Passed"
        basePayload.locationProfile.eligibilityCheck = "Passed";
        basePayload.isQualified = true;
      }

      console.log("API Response Data:", JSON.stringify(data, null, 2));
    } catch (error) {
      // addressInput.classList.remove("is-valid");
      // addressInput.classList.add("is-invalid");
      // If an error occurs, fetch an address from session storage
      if (error instanceof TypeError) {
        const address = JSON.parse(sessionStorage.getItem("struct_address"));
        updateHomeAddressPayloadFromSession(address);
        console.log("Address from session storage:", address);
      }
    }
    console.log("API_RESPONSE", "Received API response");
    // Check if the response contains an error
    if (data.error) {
      const endTime = performance.now();
      const timeElapsed = endTime - startTime;
      console.log(
        `Request failed with API error after ${timeElapsed.toFixed(2)}ms`
      );
      logWithDetails("TIMING", "Request timing (API error)", {
        startTime,
        endTime,
        timeElapsedMS: timeElapsed,
        error: data.error,
      });
      logWithDetails("ERROR", "API returned an error", { error: data.error });
      console.log("data extensions value", data.extensions.locationProfile);
      return;
    }
    // const err = data.errors[0];
    if (data.errors) {
      if (
        data.errors[0] &&
        data.errors[0].extensions.code == "PROPERTY_NOT_FOUND"
      ) {
        // console.log("err", err);
        // console.log("values", err.extensions.locationProfile);
      }
    } else {
      // Check for valid data structure
      if (!data || !data.data || !data.data.property) {
        const endTime = performance.now();
        const timeElapsed = endTime - startTime;

        console.log(
          `Request failed with invalid data structure after ${timeElapsed.toFixed(
            2
          )}ms`
        );
        logWithDetails("TIMING", "Request timing (invalid data)", {
          startTime,
          endTime,
          timeElapsedMS: timeElapsed,
        });
        logWithDetails("ERROR", "Invalid API response structure", {
          hasData: !!data,
          hasDataObject: !!(data && data.data),
          hasProperty: !!(data && data.data && data.data.property),
          fullResponse: data,
        });
        return;
      }
    }

    prefillForm(data);
    // this ensures that if the mortgage interest rate is 0 that the user cannot move past step 2
    // and the button will be disabled
    checkInputsValidity();
    // Hide loading step
    removeLoading(currentStepNumber + 1);

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    console.log(
      `Request completed successfully in ${timeElapsed.toFixed(2)}ms`
    );
    logWithDetails("TIMING", "Request timing", {
      startTime,
      endTime,
      timeElapsedMS: timeElapsed,
      status: "success",
    });

    logWithDetails("SUBMISSION", "Form prefill completed");
    return data;
  } catch (error) {
    const endTime = performance.now();
    const timeElapsed = endTime - startTime;

    console.log(`Request failed with error after ${timeElapsed.toFixed(2)}ms`);
    logWithDetails("TIMING", "Request timing (error)", {
      startTime,
      endTime,
      timeElapsedMS: timeElapsed,
      error: {
        message: error.message,
        name: error.name,
      },
    });

    logWithDetails("ERROR", "Error in submission process", {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
    console.error("Error processing address:", error);

    // Ensure the loading step is hidden
    removeLoading(currentStepNumber);

    // Show Step 1 again
    const stepOne = document.querySelector('[data-step="1"]');
    if (stepOne) {
      stepOne.style.display = "block"; // Make Step 1 visible
    }
    // can probably delete this

    //
    //
    // Update the text of the element with data-input="question"
    const questionElement = document.querySelector('[data-input="question"]');
    if (questionElement) {
      questionElement.textContent =
        "Please enter your address, select an option and try again."; // Update with your desired message
    }

    throw error;
  } finally {
    // Ensure loading step is hidden in case of error
    // if (loadingStep) {
    //   loadingStep.style.display = "none"; // Hide loading step
    // }
  }
}

// Check for address query parameter on page load
document.addEventListener("DOMContentLoaded", () => {
  const triggerButton = document.querySelector(
    '[data-trigger="address-validation"]'
  );

  if (triggerButton) {
    // triggerButton.disabled = true;
    const targetElement = document.querySelector('[data-input="address"]');
    if (triggerButton && targetElement) {
      targetElement.addEventListener("change", () => {
        const value = targetElement.value; // Get the value of the element
        // if (!value.includes("USA")) {
        //   triggerButton.disabled = false; // Re-enable the button if "USA" is not found
        // } else {
        //   triggerButton.disabled = true; // Disable the button if "USA" is found
        // }
      });
    }
    triggerButton.addEventListener("click", handleAddressSubmission);
  } else {
    logWithDetails("INITIALIZATION", "Warning: Trigger button not found");
  }

  // Check for address in query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const addressParam = urlParams.get("address");
  const loading = urlParams.get("loading");
  if (loading) {
    showLoading("1");
  }

  if (addressParam) {
    const addressInput = document.querySelector('[data-input="address"]');
    if (addressInput) {
      addressInput.value = decodeURIComponent(addressParam); // Set the address input
      console.log("CONDITION HIT IT SHOULD BE DOING AUTO SUBMIT", addressInput);
      handleAddressSubmission(); // Trigger address submission
    }
  }
});

// STEP 2 VALIDATION

// function checkInputsValidity() {
//   const form = document.querySelector('[data-step="2"]');
//   const button = document.querySelector(
//     '[data-trigger="home-data-validation"]'
//   );

//   // button.disabled = true;

//   // if (!form) {
//   //   console.error(`Form with selector "${formSelector}" not found.`);
//   //   return;
//   // }

//   // if (!button) {
//   //   console.error(`Button with selector "${buttonSelector}" not found.`);
//   //   return;
//   // }

//   if (!form) {
//     console.error("Form [data-step='2'] not found.");
//     return;
//   }
//   if (!button) {
//     console.error("Button [data-trigger='home-data-validation'] not found.");
//     return;
//   }

//   // Get all inputs within the form
//   const inputs = form.querySelectorAll("[data-input]");

//   // Debugging: Log each input and its classes
//   // inputs.forEach((input, index) => {
//   //   console.log(`Input ${index + 1}:`, input, "Classes:", input.className);
//   // });

//   // Check if all inputs have the 'is-valid' class
//   // const allValid = Array.from(inputs).every((input) =>
//   //   input.classList.contains("is-valid")
//   // );

//   // console.log("All valid", allValid);
//   // // Enable or disable the button based on validity

//   // Must ALL be "is-valid" for button to be enabled
//   const allValid = Array.from(inputs).every((input) =>
//     input.classList.contains("is-valid")
//   );
//   console.log("All valid:", allValid);

//   // button.disabled = !allValid;
//   // if (allValid) {
//   //   console.log("'Next' button enabled.");
//   // } else {
//   //   console.log("'Next' button disabled.");
//   // }
//   return allValid;
// }

function checkInputsValidity() {
  const form = document.querySelector('[data-step="2"]');
  const button = document.querySelector(
    '[data-trigger="home-data-validation"]'
  );

  // Disable the button initially
  // button.disabled = true;

  if (!form) {
    console.error("Form [data-step='2'] not found.");
    return;
  }
  if (!button) {
    console.error("Button [data-trigger='home-data-validation'] not found.");
    return;
  }

  const inputs = form.querySelectorAll("[data-input]");

  const allValid = Array.from(inputs).every((input) => {
    // For the mortgage interest rate field, also check its numeric value is > 0.
    if (input.getAttribute("data-input") === "interest-rate") {
      const cleanedValue = input.value.replace(/[^0-9.]/g, "");
      const numericValue = parseFloat(cleanedValue);
      return input.classList.contains("is-valid") && numericValue > 0;
    }
    // For all other inputs, simply check that the "is-valid" class is present.
    return input.classList.contains("is-valid");
  });

  console.log("All valid:", allValid);

  // button.disabled = !allValid;
  if (allValid) {
    console.log("Interest rate is greater than 0");
  } else {
    console.log("Interest rate much be greater than 0");
  }
  return allValid;
}

// function checkInputsValidity() {
//   const form = document.querySelector('[data-step="2"]');
//   const button = document.querySelector(
//     '[data-trigger="home-data-validation"]'
//   );

//   if (!form || !button) {
//     console.error("Form or button not found for Step 2 validation.");
//     return;
//   }

//   const inputs = form.querySelectorAll("[data-input]");
//   const invalidInputs = Array.from(inputs).filter(
//     (input) => !input.classList.contains("is-valid")
//   );

//   const allValid = invalidInputs.length === 0;

//   console.log("All valid", allValid, "Invalid inputs:", invalidInputs);

//   // Set button state based on validation
//   button.disabled = !allValid;

//   // Handle popup visibility
//   const popup = document.querySelector('[data-tag="invalid-pop-up"]');
//   if (allValid) {
//     if (popup) popup.style.display = "none";
//   } else {
//     showInvalidPopUp(invalidInputs, form);
//   }
// }
// function checkInputsValidity(showPopupIfInvalid = false) {
//   // Add parameter
//   const form = document.querySelector('[data-step="2"]');
//   const button = document.querySelector(
//     '[data-trigger="home-data-validation"]'
//   );

//   if (!form || !button) {
//     console.error("Form or button not found for Step 2 validation.");
//     return;
//   }

//   const inputs = form.querySelectorAll("[data-input]");
//   const invalidInputs = Array.from(inputs).filter(
//     (input) => !input.classList.contains("is-valid")
//   );

//   const allValid = invalidInputs.length === 0;

//   console.log("All valid", allValid, "Invalid inputs:", invalidInputs);

//   // Set button state based on validation
//   button.disabled = !allValid;

//   // Handle popup visibility
//   const popup = document.querySelector('[data-tag="invalid-pop-up"]');
//   if (allValid) {
//     if (popup) popup.style.display = "none";
//   } else if (showPopupIfInvalid) {
//     // Only show if parameter is true
//     showInvalidPopUp(invalidInputs, form);
//   }
// }

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const currentStep = urlParams.get("step");

  if (currentStep === "2") {
    // Initial validation check when step 2 loads
    // checkInputsValidity();
    checkInputsValidity(true);
    // Attach listeners for form inputs
    const form = document.querySelector('[data-step="2"]');
    if (form) {
      const inputs = form.querySelectorAll("[data-input]");
      inputs.forEach((input) => {
        input.addEventListener("input", checkInputsValidity);
        input.addEventListener("blur", checkInputsValidity);
        input.addEventListener("change", checkInputsValidity);
      });
    }
  }
});

function attachValidationListeners() {
  const form = document.querySelector('[data-step="2"]');

  // if (!form) {
  //   console.error(`Form with selector "${formSelector}" not found.`);
  //   return;
  // }
  if (!form) {
    console.error(`Form with selector '[data-step="2"]' not found.`);
    return;
  }
  // Add event listeners to all inputs in the form
  form.querySelectorAll("[data-input]").forEach((input) => {
    input.addEventListener("input", () => {
      // Trigger validation check when input value changes
      checkInputsValidity();
    });

    input.addEventListener("blur", () => {
      // Trigger validation check when input loses focus
      checkInputsValidity();
    });
    input.addEventListener("change", () => {
      checkInputsValidity();
    });
  });
}

function updateHomeProfileValues(id, newValue) {
  // If the field is ESTIMATED_VALUE, format it again
  // if (id === "ESTIMATED_VALUE") {
  //   newValue = formatEstimatedValue(newValue);
  // }

  const item = basePayload.homeProfile.find((item) => item.id === id);
  if (item) {
    item.value = newValue || "";
    return item;
  }
}

function submitHomeData() {
  if (!checkInputsValidity()) {
    return;
  }

  const formData = {
    home_type: document.querySelector('[data-input="type-of-home"]').value,
    beds: document.querySelector('[data-input="bedrooms"]').value,
    baths: document.querySelector('[data-input="bathrooms"]').value,
    square_footage: document.querySelector('[data-input="square-foot"]').value,
    acres: document.querySelector('[data-input="acres"]').value,
    mortgage_type: document.querySelector('[data-input="mortgage-type"]').value,
    mortgage_interest_rate: document.querySelector(
      '[data-input="interest-rate"]'
    ).value,
    isThirtyYearFixed: document.querySelector('[data-input="30-year-fixed"]')
      .value,
    esitmated_value: document.querySelector('[data-input="home-value-est"]')
      .value,
  };
  console.log("step 2 form data", formData);
  updateHomeProfileValues("HOME_TYPE", formData.home_type);
  updateHomeProfileValues("BEDS", formData.beds);
  updateHomeProfileValues("BATHS", formData.baths);
  updateHomeProfileValues("SQUARE_FOOTAGE", formData.square_footage);
  updateHomeProfileValues("ACRES", formData.acres);
  updateHomeProfileValues("MORTGAGE_TYPE", formData.mortgage_type);
  updateHomeProfileValues(
    "MORTGAGE_INTEREST_RATE",
    `${formData.mortgage_interest_rate}%`
  );
  updateHomeProfileValues(
    "MORTGAGE_TERM",
    formData.isThirtyYearFixed == "Yes" ? "30 years" : ""
  );
  updateHomeProfileValues(
    "MORTGAGE_LOAN_TYPE",
    formData.isThirtyYearFixed == "Yes" ? "Fixed" : ""
  );
  updateHomeProfileValues("ESTIMATED_VALUE", formData.esitmated_value);

  if (!homeDataValid(formData)) {
    console.log("base payload invalid", basePayload);

    sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
    window.location.href = "/submit-home-disqualified";
    return;
  }

  // if (
  //   formData.mortgage_type !== "No mortgage" &&
  //   (!formData.mortgage_interest_rate ||
  //     parseFloat(formData.mortgage_interest_rate) === 0)
  // ) {
  //   const interestRateInput = document.querySelector(
  //     '[data-input="interest-rate"]'
  //   );
  //   if (interestRateInput) {
  //     interestRateInput.classList.remove("is-valid");
  //     interestRateInput.classList.add("is-invalid");
  //   }
  //   console.log("failed for interest rate");
  //   updateEligibilityCheck("MORTGAGE_INTEREST_RATE", "Failed");
  //   console.log("base payload invalid", basePayload);
  //   sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
  //   window.location.href = "/submit-home-disqualified";
  //   return;
  // }

  showLoading("2");
  removeLoading("3");
  console.log("BASE PAYLOAD", basePayload);
}

function updateEligibilityCheck(id, newValue) {
  const item = basePayload.homeProfile.find((item) => item.id === id);
  if (item) {
    console.log("updating eligibility for item", item);
    item.eligibilityCheck = newValue;
    return item; // Return the updated object if needed
  }
  return null; // Return null if no object with the given id is found
}

function homeDataValid(data) {
  console.log("validating data", data);
  let valid = true;

  if (data.home_type !== "Single-family detached home") {
    console.log("failed for data.homeType", data.homeType);
    updateEligibilityCheck("HOME_TYPE", "Failed");
    valid = false;
  }
  if (data.beds < 3) {
    console.log("failed for bedrooms", data.bedrooms);
    updateEligibilityCheck("BEDS", "Failed");
    valid = false;
  }
  if (data.baths < 2) {
    console.log("failed for bathrooms", data.bathrooms);
    updateEligibilityCheck("BATHS", "Failed");
    valid = false;
  }
  if (data.acres == "> .5 acre" || parseInt(data.acres) > 0.5) {
    console.log("failed for acres");
    updateEligibilityCheck("ACRES", "Failed");
    valid = false;
  }
  if (data.square_footage < 1200 || data.square_footage > 3500) {
    console.log("failed for sq ft");
    updateEligibilityCheck("SQUARE_FOOTAGE", "Failed");
    valid = false;
  }
  if (data.mortgage_type == "No mortgage") {
    console.log("failed for mortgage type");
    updateEligibilityCheck("MORTGAGE_TYPE", "Failed");
    valid = false;
  }
  if (data.mortgage_interest_rate > 4.25) {
    console.log("failed for interest rate");
    updateEligibilityCheck("MORTGAGE_INTEREST_RATE", "Failed");
    valid = false;
  }

  if (data.isThirtyYearFixed === "No") {
    console.log("failed for 30 year fixed");
    updateEligibilityCheck("MORTGAGE_LOAN_TYPE", "Failed");
    updateEligibilityCheck("MORTGAGE_TERM", "Failed");
    valid = false;
  }
  if (data.esitmated_value > 225000 || data.homeEstValue > 625000) {
    console.log("failed for est home value");
    updateEligibilityCheck("ESTIMATED_VALUE", "Failed");
    valid = false;
  }
  if (
    data.mortgage_type !== "No mortgage" &&
    (!data.mortgage_interest_rate ||
      parseFloat(data.mortgage_interest_rate) === 0)
  ) {
    console.log("failed for interest rate");
    updateEligibilityCheck("MORTGAGE_INTEREST_RATE", "Failed");
    const interestRateInput = document.querySelector(
      '[data-input="interest-rate"]'
    );
    if (interestRateInput) {
      interestRateInput.classList.remove("is-valid");
      interestRateInput.classList.add("is-invalid");
    }
    valid = false; // Mark as invalid if interest rate is 0 or empty
  }
  console.log("submission valid, validation passsed", data);
  return valid;
}

document.addEventListener("DOMContentLoaded", () => {
  const triggerButton = document.querySelector(
    '[data-trigger="home-data-validation"]'
  );

  // Attach listeners to inputs and initialize button state
  attachValidationListeners();
  if (triggerButton) {
    triggerButton.addEventListener("click", submitHomeData);
  } else {
  }
});

// this simply displays the address in the bottom left

document.addEventListener("DOMContentLoaded", function () {
  // Check if the 'address' query parameter is present in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const addressFromParams = urlParams.get("address");

  if (addressFromParams) {
    // Find the address input element
    const addressInput = document.querySelector('[data-input="address"]');

    if (addressInput) {
      // Set the value of the address input field
      addressInput.value = decodeURIComponent(addressFromParams);

      // Find all elements with data-tag="display-address" and update them
      const addressDisplayElements = document.querySelectorAll(
        '[data-tag="display-address"]'
      );
      addressDisplayElements.forEach(function (element) {
        element.textContent = decodeURIComponent(addressFromParams); // Update displayed address
      });
    }
  }
});

// Event listener for the "next" button click
document.addEventListener("click", function (event) {
  const nextButton = event.target.getAttribute("data-alt");

  if (nextButton === "next") {
    const addressInput = document.querySelector('[data-input="address"]');

    if (addressInput && addressInput.value !== "") {
      const addressValue = addressInput.value; // Get the address value

      // Find all elements with data-tag="display-address"
      const addressDisplayElements = document.querySelectorAll(
        '[data-tag="display-address"]'
      );

      // Update the text content of each element
      addressDisplayElements.forEach(function (element) {
        element.textContent = addressValue; // Update the displayed address
      });
    }
  }
});

// STEP 3

function checkInputsValidity3() {
  const form = document.querySelector('[data-step="3"]');
  const button = document.querySelector('[data-trigger="home-data-step-3"]');

  // Select the wrapper and individual elements
  const wrapperHome = form.querySelectorAll('[data-input="home-condition"]');
  const wrapperSolar = form.querySelectorAll('[data-input="solar"]');
  const garage = form.querySelectorAll('[data-input="garage"]');
  const pool = form.querySelectorAll('[data-input="pool"]');
  const monthsToMove = form.querySelectorAll('[data-input="months-to-move"]');

  // Function to check validity of wrapper elements
  function checkWrapperValidity(wrappers) {
    return [...wrappers].every((wrapper) => {
      const radioButtons = wrapper.querySelectorAll(
        'input[type="radio"], [data-select]'
      );
      return Array.from(radioButtons).some((radio) =>
        radio.classList.contains("is-valid")
      );
    });
  }

  const isWrapperHomeValid = checkWrapperValidity(wrapperHome);
  const isWrapperSolarValid = checkWrapperValidity(wrapperSolar);

  // Apply 'is-invalid' if no valid selection is found
  wrapperHome.forEach((wrapper) => {
    if (!isWrapperHomeValid) {
      wrapper.classList.add("is-invalid");
    } else {
      wrapper.classList.remove("is-invalid");
    }
  });

  wrapperSolar.forEach((wrapper) => {
    if (!isWrapperSolarValid) {
      wrapper.classList.add("is-invalid");
    } else {
      wrapper.classList.remove("is-invalid");
    }
  });

  // Loop through each input in garage, pool, and monthsToMove
  [...garage, ...pool, ...monthsToMove].forEach((input) => {
    // If the input does not have the "is-valid" class, add it
    if (!input.classList.contains("is-valid")) {
      input.classList.add("is-invalid");
    } else {
      // If the input has the "is-valid" class, remove it
      // Remove the "is-invalid" class (if it exists)
      input.classList.remove("is-invalid");
    }
  });

  // Now check if all inputs have the "is-valid" class
  const allIndividualValid = [...garage, ...pool, ...monthsToMove].every(
    (input) => input.classList.contains("is-valid")
  );

  // Combine both checks: if either the wrappers or individual inputs are invalid, the button is disabled
  return isWrapperHomeValid && isWrapperSolarValid && allIndividualValid;
}

// function checkInputsValidity3() {
//   const form = document.querySelector('[data-step="3"]');
//   const button = document.querySelector('[data-trigger="home-data-step-3"]');

//   // Select the wrapper and individual elements
//   const wrapperHome = form.querySelectorAll('[data-input="home-condition"]');
//   const wrapperSolar = form.querySelectorAll('[data-input="solar"]');
//   const garage = form.querySelectorAll('[data-input="garage"]');
//   const pool = form.querySelectorAll('[data-input="pool"]');
//   const monthsToMove = form.querySelectorAll('[data-input="months-to-move"]');

//   // Check if all wrapper elements (Home and Solar) are valid
//   const allWrapperValid = [...wrapperHome, ...wrapperSolar].every((wrapper) => {
//     const radioButtons = wrapper.querySelectorAll(
//       'input[type="radio"], [data-select]'
//     );
//     return Array.from(radioButtons).every((radio) =>
//       radio.classList.contains("is-valid")
//     );
//   });

//   // Check if all individual elements (Garage, Pool, Months to Move) are invalid
//   const allIndividualValid = [...garage, ...pool, ...monthsToMove].every(
//     (input) => input.classList.contains("is-valid")
//   );

//   // Combine both checks: if either the wrappers or individual inputs are invalid, the button is disabled
//   if (allWrapperValid || allIndividualValid) {
//     return true;
//   } else {
//     return false;
//   }
// }

// function attachValidationListeners3() {
//   const form = document.querySelector('[data-step="3"]');

//   if (!form) {
//     console.error(`Form with selector "${formSelector}" not found.`);
//     return;
//   }

//   // Add event listeners to all inputs in the form
//   form.querySelectorAll("[data-input]").forEach((input) => {
//     input.addEventListener("input", () => {
//       // Trigger validation check when input value changes
//       checkInputsValidity3();
//     });

//     input.addEventListener("blur", () => {
//       // Trigger validation check when input loses focus
//       checkInputsValidity3();
//     });
//     input.addEventListener("change", () => {
//       checkInputsValidity3();
//     });
//   });
// }

document.addEventListener("DOMContentLoaded", () => {
  const triggerButton = document.querySelector(
    '[data-trigger="home-data-step-3"]'
  );

  // attachValidationListeners3();
  if (triggerButton) {
    // triggerButton.disabled = true;
    triggerButton.addEventListener("click", submitStep3);
  } else {
    logWithDetails(
      "INITIALIZATION",
      "Warning: Trigger button not found submitStep3"
    );
  }
});

// function addSelectionValidationListeners() {
//   const form = document.querySelector('[data-step="3"]');

//   if (!form) return;

//   // Select wrapper elements
//   const wrapperHome = form.querySelectorAll('[data-input="home-condition"]');
//   const wrapperSolar = form.querySelectorAll('[data-input="solar"]');

//   function handleInputChange(event) {
//     const wrapper = event.target.closest(
//       '[data-input="home-condition"], [data-input="solar"]'
//     );
//     if (wrapper) {
//       wrapper.classList.remove("is-invalid");
//       wrapper.classList.add("is-valid");
//     }
//   }

//   [...wrapperHome, ...wrapperSolar].forEach((wrapper) => {
//     const inputs = wrapper.querySelectorAll(
//       'input[type="radio"], [data-select]'
//     );
//     inputs.forEach((input) => {
//       input.addEventListener("change", handleInputChange);
//     });
//   });
// }

// function addSelectionValidationListeners() {
//   const form = document.querySelector('[data-step="3"]');
//   if (!form) return;

//   // Select wrapper elements for home condition and solar
//   const wrapperHome = form.querySelectorAll('[data-input="home-condition"]');
//   const wrapperSolar = form.querySelectorAll('[data-input="solar"]');

//   function handleInputChange(event) {
//     const wrapper = event.target.closest(
//       '[data-input="home-condition"], [data-input="solar"]'
//     );
//     if (wrapper) {
//       // Delay the check until after the DOM has updated the classes on the child element.
//       setTimeout(() => {
//         const validSelected = wrapper.querySelector(".is-active.is-valid");
//         if (validSelected) {
//           wrapper.classList.remove("is-invalid");
//           wrapper.classList.add("is-valid");
//         }
//       }, 0);
//     }
//   }

//   [...wrapperHome, ...wrapperSolar].forEach((wrapper) => {
//     const inputs = wrapper.querySelectorAll(
//       'input[type="radio"], [data-select]'
//     );
//     inputs.forEach((input) => {
//       input.addEventListener("change", handleInputChange);
//     });
//   });
// }

// addSelectionValidationListeners();

// function addSelectionValidationListeners() {
//   const form = document.querySelector('[data-step="3"]');
//   if (!form) return;

//   const wrapperHome = form.querySelectorAll('[data-input="home-condition"]');
//   const wrapperSolar = form.querySelectorAll('[data-input="solar"]');

//   function handleInputChange(event) {
//     console.log("Change event triggered on:", event.target);

//     const wrapper = event.target.closest(
//       '[data-input="home-condition"], [data-input="solar"]'
//     );

//     if (wrapper) {
//       // Update selector to look for custom radio elements
//       const validSelected = wrapper.querySelector(
//         "[data-select].is-active.is-valid"
//       );
//       console.log("Valid selection found:", validSelected);
//       console.log("Wrapper before:", wrapper.className);
//       // Reset classes
//       wrapper.classList.remove("is-valid", "is-invalid");

//       // Add appropriate class based on selection
//       if (validSelected) {
//         wrapper.classList.add("is-valid");
//       } else {
//         wrapper.classList.add("is-invalid");
//       }
//       console.log("Wrapper after:", wrapper.className);
//     }
//   }

//   // Add listeners to all wrappers
//   [...wrapperHome, ...wrapperSolar].forEach((wrapper) => {
//     // Update selector to only look for custom radio elements with data-select
//     const inputs = wrapper.querySelectorAll("[data-select]");

//     inputs.forEach((input) => {
//       input.addEventListener("change", handleInputChange);

//       // Trigger initial validation if there's a pre-selected value
//       if (input.classList.contains("is-active")) {
//         input.dispatchEvent(new Event("change"));
//       }
//     });
//   });
// }

// addSelectionValidationListeners();

function addSelectionValidationListeners() {
  const form = document.querySelector('[data-step="3"]');
  if (!form) return;

  // Select wrapper elements for home condition and solar
  const wrappers = form.querySelectorAll(
    '[data-input="home-condition"], [data-input="solar"]'
  );

  function handleInputChange(event) {
    const clickedElement = event.target.closest("[data-select]");
    if (!clickedElement) return;

    const wrapper = clickedElement.closest(
      '[data-input="home-condition"], [data-input="solar"]'
    );
    if (!wrapper) return;

    // Remove all active/valid classes from siblings
    wrapper.querySelectorAll("[data-select]").forEach((el) => {
      el.classList.remove("is-active", "is-valid");
    });

    // Add classes to clicked element
    clickedElement.classList.add("is-active", "is-valid");

    // Only remove is-invalid class if it exists (don't add is-valid yet)
    wrapper.classList.remove("is-invalid");
  }

  // Add click event listeners to the wrappers
  wrappers.forEach((wrapper) => {
    wrapper.addEventListener("click", (event) => {
      const clickedSelect = event.target.closest("[data-select]");
      if (clickedSelect) {
        handleInputChange(event);
      }
    });
  });

  // Add validation check to the "Next" button
  const nextButton = document.querySelector(
    '[data-trigger="home-data-step-3"]'
  );
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      wrappers.forEach((wrapper) => {
        const hasValidSelection = wrapper.querySelector(
          "[data-select].is-active"
        );
        if (!hasValidSelection) {
          wrapper.classList.add("is-invalid");
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", addSelectionValidationListeners);

function submitStep3() {
  // step 1 get all data labels
  // step 2 conditional logic for id valid
  // step 3 if not valid and return

  // if // this is my conditionl logic to check the validation (!checkInputsValidity3()) {
  // here is where I run my pop up function
  //   return;
  // }
  // const invalid = getInvalidInputs();
  // if (invalid) {
  //   showInvalidPopUp(invalid)
  //   return;
  // }
  if (!checkInputsValidity3()) {
    return;
  }

  const parentHomeDiv = document.querySelector('[data-input="home-condition"]');
  const checkedHomeCondition = parentHomeDiv.querySelector(
    "[data-select].is-active"
  );
  const checkedHomeValue =
    checkedHomeCondition.querySelector("div").textContent;

  const solarDiv = document.querySelector('[data-input="solar"]');
  const solarInput = solarDiv.querySelector("[data-select].is-active");
  const solarValue = solarInput.querySelector("div").textContent;

  step3FormData = {
    home_condition: checkedHomeValue,
    solar: solarValue,
    garage: document.querySelector('[data-input="garage"]').value,
    pool: document.querySelector('[data-input="pool"]').value,
    time_to_move: document.querySelector('[data-input="months-to-move"]').value,
  };

  updateHomeProfileValues("HOME_CONDITION", step3FormData.home_condition);
  updateHomeProfileValues("SOLAR", step3FormData.solar);
  updateHomeProfileValues("GARAGE", step3FormData.garage);
  updateHomeProfileValues("POOL", step3FormData.pool);
  updateHomeProfileValues("TIME_TO_MOVE", step3FormData.time_to_move);

  sessionStorage.setItem("basePayload", JSON.stringify(basePayload));
  console.log("step3 basepayload", basePayload);
  showLoading("3");
  removeLoading("4");
}

// STEP 4
// function step4Valid() {
//   const stepDiv = document.querySelector(`[data-step="4"]`);
//   if (!stepDiv) return false;

//   // Select all input fields, radio buttons, and select elements inside step 4
//   const inputs = stepDiv.querySelectorAll(
//     'input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="radio"], select, textarea'
//   );

//   let allValid = true;

//   // Check if includes-tax-insurance has any selected option
//   const includesTaxInsuranceWrapper = stepDiv.querySelector(
//     '[data-input="includes-tax-insurance"]'
//   );
//   const isTaxInsuranceSelected = includesTaxInsuranceWrapper
//     ? includesTaxInsuranceWrapper.querySelectorAll("[data-select].w--current")
//         .length > 0
//     : false;

//   inputs.forEach((input) => {
//     // Skip validation for annual-property-taxes and homeowners-insurance if tax/insurance is selected
//     if (
//       isTaxInsuranceSelected &&
//       (input.dataset.input === "annual-property-taxes" ||
//         input.dataset.input === "homeowners-insurance")
//     ) {
//       return;
//     }

//     // For radio buttons, ensure one is checked (by name)
//     if (input.type === "radio") {
//       if (!stepDiv.querySelector(`input[name="${input.name}"]:checked`)) {
//         input.classList.add("is-invalid");
//         input.classList.remove("is-valid");
//         allValid = false;
//       } else {
//         input.classList.remove("is-invalid");
//         input.classList.add("is-valid");
//       }
//     }
//     // For all other inputs, check that the trimmed value is not empty.
//     else {
//       if (input.value.trim() === "") {
//         input.classList.add("is-invalid");
//         input.classList.remove("is-valid");
//         allValid = false;
//       } else {
//         input.classList.remove("is-invalid");
//         input.classList.add("is-valid");
//       }
//     }
//   });

//   return allValid;
// }

// function step4Valid() {
//   const stepDiv = document.querySelector(`[data-step="4"]`);
//   if (!stepDiv) return false;

//   let allValid = true;
//   const inputs = stepDiv.querySelectorAll("[data-input]");

//   // make some logic here to check is Yes or I dont know is selected then ignore nested input
//   /// if no is selected then we care all input
//   /// If they have no HOA fees they we do not need to validate

//   inputs.forEach((input) => {
//     if (window.getComputedStyle(input).display === "none") return;

//     if (input.value.trim() === "") {
//       input.classList.add("is-invalid");
//       input.classList.remove("is-valid");
//       allValid = false;
//     } else {
//       input.classList.remove("is-invalid");
//       input.classList.add("is-valid");
//     }
//   });

//   console.log("step4Valid:", allValid);
//   return allValid;
// }

// if (window.location.search.includes("?step=4")) {
//   // Select the parent container
//   const parentContainer = document.querySelector(
//     ".lead-form_radio-group.is-tab.w-tab-menu"
//   );

//   if (parentContainer) {
//     // Ensure one tab has the "is-valid" class initially
//     const initialValidTab = parentContainer.querySelector(".w--current");
//     if (initialValidTab) {
//       initialValidTab.classList.add("is-valid");
//     }

//     // Add a click event listener to the parent container
//     parentContainer.addEventListener("click", (event) => {
//       const clickedElement = event.target.closest(".w-tab-link");
//       if (clickedElement && parentContainer.contains(clickedElement)) {
//         // Remove "w--current" and "is-valid" from all tabs
//         parentContainer
//           .querySelectorAll(".w--current, .is-valid")
//           .forEach((element) => {
//             element.classList.remove("w--current", "is-valid");
//           });

//         // Add "w--current" and "is-valid" to the clicked tab
//         clickedElement.classList.add("w--current", "is-valid");
//       }
//     });
//   } else {
//     console.warn("Parent container not found.");
//   }
// }

// function step4Valid() {
//   const stepDiv = document.querySelector(`[data-step="4"]`);
//   if (!stepDiv) return false;

//   let allValid = true;
//   const inputs = stepDiv.querySelectorAll("[data-input]");

//   // --- Custom logic for "includes-taxes-insurance" ---
//   const taxInsuranceContainer = stepDiv.querySelector(
//     '[data-input="includes-taxes-insurance"]'
//   );
//   if (taxInsuranceContainer) {
//     // Find the element marked with .w--current
//     const selectedOption = taxInsuranceContainer.querySelector(".w--current");
//     // Only if selectedOption exists and it has a <div> child, get its text.
//     const divChild = selectedOption
//       ? selectedOption.querySelector("div")
//       : null;
//     const taxInsuranceValue =
//       divChild && typeof divChild.textContent === "string"
//         ? divChild.textContent.trim().toLowerCase()
//         : "";
//     // If the selection is "no" (in lowercase), then we require values for the tax and insurance fields.
//     if (taxInsuranceValue === "no") {
//       // --- Validate Annual Property Taxes ---
//       const annualTaxesInput = stepDiv.querySelector(
//         '[data-input="annual-property-taxes"]'
//       );
//       let annualTaxesValid = false;
//       if (annualTaxesInput) {
//         if (
//           typeof annualTaxesInput.value === "string" &&
//           annualTaxesInput.value.trim() !== ""
//         ) {
//           annualTaxesValid = true;
//         } else {
//           // Check if the sibling radio (with data-alt="idk-property-taxes") is marked as valid.
//           const idkPropTaxes = stepDiv.querySelector(
//             '[data-alt="idk-property-taxes"]'
//           );
//           if (idkPropTaxes && idkPropTaxes.classList.contains("is-valid")) {
//             annualTaxesValid = true;
//           }
//         }
//         if (!annualTaxesValid) {
//           annualTaxesInput.classList.add("is-invalid");
//           annualTaxesInput.classList.remove("is-valid");
//           allValid = false;
//         } else {
//           annualTaxesInput.classList.remove("is-invalid");
//           annualTaxesInput.classList.add("is-valid");
//         }
//       }

//       // --- Validate Homeowners Insurance ---
//       const homeInsInput = stepDiv.querySelector(
//         '[data-input="homeowners-insurance"]'
//       );
//       let homeInsValid = false;
//       if (homeInsInput) {
//         if (
//           typeof homeInsInput.value === "string" &&
//           homeInsInput.value.trim() !== ""
//         ) {
//           homeInsValid = true;
//         } else {
//           // Check if the sibling radio (with data-alt="idk-home-insurance") is marked as valid.
//           const idkHomeIns = stepDiv.querySelector(
//             '[data-alt="idk-home-insurance"]'
//           );
//           if (idkHomeIns && idkHomeIns.classList.contains("is-valid")) {
//             homeInsValid = true;
//           }
//         }
//         if (!homeInsValid) {
//           homeInsInput.classList.add("is-invalid");
//           homeInsInput.classList.remove("is-valid");
//           allValid = false;
//         } else {
//           homeInsInput.classList.remove("is-invalid");
//           homeInsInput.classList.add("is-valid");
//         }
//       }
//     }
//   }

//   // --- Custom logic for monthly-hoa ---
//   const monthlyHoaInput = stepDiv.querySelector('[data-input="monthly-hoa"]');
//   if (monthlyHoaInput) {
//     let monthlyHoaValid = false;
//     if (
//       typeof monthlyHoaInput.value === "string" &&
//       monthlyHoaInput.value.trim() !== ""
//     ) {
//       monthlyHoaValid = true;
//     } else {
//       // Check if the sibling radio (with data-alt="idk-hoa") is valid.
//       const idkHoa = stepDiv.querySelector('[data-alt="idk-hoa"]');
//       if (idkHoa && idkHoa.classList.contains("is-valid")) {
//         monthlyHoaValid = true;
//       }
//     }
//     if (!monthlyHoaValid) {
//       monthlyHoaInput.classList.add("is-invalid");
//       monthlyHoaInput.classList.remove("is-valid");
//       allValid = false;
//     } else {
//       monthlyHoaInput.classList.remove("is-invalid");
//       monthlyHoaInput.classList.add("is-valid");
//     }
//   }

//   // --- Generic validation for each field with a data-input attribute ---
//   inputs.forEach((input) => {
//     if (window.getComputedStyle(input).display === "none") return;
//     // Only validate if the input has a string value.
//     if (typeof input.value === "string") {
//       if (input.value.trim() === "") {
//         input.classList.add("is-invalid");
//         input.classList.remove("is-valid");
//         allValid = false;
//       } else {
//         input.classList.remove("is-invalid");
//         input.classList.add("is-valid");
//       }
//     }
//   });

//   console.log("step4Valid:", allValid);
//   return allValid;
// }

function step4Valid() {
  const stepDiv = document.querySelector(`[data-step="4"]`);
  if (!stepDiv) return false;

  let allValid = true;

  // --- Custom logic for "includes-taxes-insurance" group ---
  const taxInsuranceContainer = stepDiv.querySelector(
    '[data-input="includes-taxes-insurance"]'
  );
  if (taxInsuranceContainer) {
    // Get the currently selected option by finding the element with the class "w--current"
    const selectedOption = taxInsuranceContainer.querySelector(".w--current");
    const divChild = selectedOption
      ? selectedOption.querySelector("div")
      : null;
    const taxInsuranceValue =
      divChild && typeof divChild.textContent === "string"
        ? divChild.textContent.trim().toLowerCase()
        : "";
    // If the user selected "no" (in lowercase), then we must validate annual property taxes and homeowners insurance.
    if (taxInsuranceValue === "no") {
      // Validate Annual Property Taxes:
      const annualTaxesInput = stepDiv.querySelector(
        '[data-input="annual-property-taxes"]'
      );
      let annualTaxesValid = false;
      if (annualTaxesInput) {
        if (
          typeof annualTaxesInput.value === "string" &&
          annualTaxesInput.value.trim() !== ""
        ) {
          annualTaxesValid = true;
        } else {
          // Otherwise, check if the "I don't know" radio is valid.
          const idkPropTaxes = stepDiv.querySelector(
            '[data-alt="idk-property-taxes"]'
          );
          if (idkPropTaxes && idkPropTaxes.classList.contains("is-valid")) {
            annualTaxesValid = true;
          }
        }
        if (!annualTaxesValid) {
          annualTaxesInput.classList.add("is-invalid");
          annualTaxesInput.classList.remove("is-valid");
          allValid = false;
        } else {
          annualTaxesInput.classList.remove("is-invalid");
          annualTaxesInput.classList.add("is-valid");
        }
      }

      // Validate Homeowners Insurance:
      const homeInsInput = stepDiv.querySelector(
        '[data-input="homeowners-insurance"]'
      );
      let homeInsValid = false;
      if (homeInsInput) {
        if (
          typeof homeInsInput.value === "string" &&
          homeInsInput.value.trim() !== ""
        ) {
          homeInsValid = true;
        } else {
          const idkHomeIns = stepDiv.querySelector(
            '[data-alt="idk-home-insurance"]'
          );
          if (idkHomeIns && idkHomeIns.classList.contains("is-valid")) {
            homeInsValid = true;
          }
        }
        if (!homeInsValid) {
          homeInsInput.classList.add("is-invalid");
          homeInsInput.classList.remove("is-valid");
          allValid = false;
        } else {
          homeInsInput.classList.remove("is-invalid");
          homeInsInput.classList.add("is-valid");
        }
      }
    }
  }

  // --- Custom logic for "monthly-hoa" ---
  const monthlyHoaInput = stepDiv.querySelector('[data-input="monthly-hoa"]');
  if (monthlyHoaInput) {
    let monthlyHoaValid = false;
    if (
      typeof monthlyHoaInput.value === "string" &&
      monthlyHoaInput.value.trim() !== ""
    ) {
      monthlyHoaValid = true;
    } else {
      const idkHoa = stepDiv.querySelector('[data-alt="idk-hoa"]');
      if (idkHoa && idkHoa.classList.contains("is-valid")) {
        monthlyHoaValid = true;
      }
    }
    if (!monthlyHoaValid) {
      monthlyHoaInput.classList.add("is-invalid");
      monthlyHoaInput.classList.remove("is-valid");
      allValid = false;
    } else {
      monthlyHoaInput.classList.remove("is-invalid");
      monthlyHoaInput.classList.add("is-valid");
    }
  }

  // --- Generic validation for all other data-input fields ---
  // Skip the fields we've handled in custom logic.
  const skipFields = [
    "includes-taxes-insurance",
    "annual-property-taxes",
    "homeowners-insurance",
    "monthly-hoa",
  ];
  const inputs = stepDiv.querySelectorAll("[data-input]");
  inputs.forEach((input) => {
    if (window.getComputedStyle(input).display === "none") return;
    if (skipFields.includes(input.getAttribute("data-input"))) return; // Skip custom-handled fields
    if (typeof input.value === "string") {
      if (input.value.trim() === "") {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        allValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    }
  });

  console.log("step4Valid:", allValid);
  return allValid;
}

////

document.addEventListener("DOMContentLoaded", () => {
  const triggerButton = document.querySelector(
    '[data-trigger="home-data-step-4"]'
  );

  if (triggerButton) {
    triggerButton.addEventListener("click", submitStep4);
  } else {
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const radioPropTax = document.querySelector(
    '[data-alt="idk-property-taxes"]'
  );
  const radioHomeIns = document.querySelector(
    '[data-alt="idk-home-insurance"]'
  );
  const radioHOA = document.querySelector('[data-alt="idk-hoa"]');

  // Clear input for property taxes
  function clearPropTaxInput(event) {
    console.log(event);
    const propInput = document.querySelector(
      '[data-input="annual-property-taxes"]'
    ); // Fixed selector
    if (propInput) propInput.value = "";
  }

  // Clear input for homeowner's insurance
  function clearHomeInsInput(event) {
    const propInput = document.querySelector(
      '[data-input="homeowners-insurance"]'
    ); // Fixed selector
    if (propInput) propInput.value = "";
  }

  // Clear input for HOA
  function clearHOAInput(event) {
    console.log(event);
    const propInput = document.querySelector('[data-input="monthly-hoa"]'); // Fixed selector
    if (propInput) propInput.value = "";
  }

  // Add event listeners to each radio button
  if (radioPropTax) radioPropTax.addEventListener("click", clearPropTaxInput);
  if (radioHomeIns) radioHomeIns.addEventListener("click", clearHomeInsInput);
  if (radioHOA) radioHOA.addEventListener("click", clearHOAInput);
});

let PassStep4Validation = true;

function submitStep4() {
  if (!step4Valid()) {
    // scroll to first invalid field and exit
    return;
  }

  // Does this include taxes and insurance
  const taxesInsDiv = document.querySelector(
    '[data-input="includes-taxes-insurance"]'
  );
  const taxesInsSelection = taxesInsDiv.querySelector(
    "[data-select].w--current"
  );
  const taxesInsValue = taxesInsSelection.querySelector("div").textContent;

  // Tabs
  const propertyTaxesDiv = document.querySelector(
    '[data-tag-wrapper="property-taxes"]'
  );
  const isPropertyTaxesKnown = propertyTaxesDiv.querySelector(
    "[data-select].is-active"
  );
  const propertyTaxesValue = isPropertyTaxesKnown
    ? isPropertyTaxesKnown.querySelector("div").textContent
    : document.querySelector('[data-input="annual-property-taxes"]').value;

  const homeInsDiv = document.querySelector(
    '[data-tag-wrapper="homeowners-insurance"]'
  );
  const homeInsKnown = homeInsDiv.querySelector("[data-select].is-active");
  const homeInsValue = homeInsKnown
    ? homeInsKnown.querySelector("div").textContent
    : document.querySelector('[data-input="homeowners-insurance"]').value;
  const hoaFeeDiv = document.querySelector('[data-tag-wrapper="hoa-fees"]');
  const hoaFeeKnown = hoaFeeDiv.querySelector("[data-select].is-active");
  const hoaFeeValue = hoaFeeKnown
    ? hoaFeeKnown.querySelector("div").textContent
    : document.querySelector('[data-input="monthly-hoa"]').value;

  step4FormData = {
    MORTGAGE_ESTIMATED_BALANCE: document.querySelector(
      '[data-input="remaining-mortgage-balance"]'
    ).value,
    MORTGAGE_MONTHLY_PAYMENT: document.querySelector(
      '[data-input="monthly-mortgage-payment"]'
    ).value,
    MORTGAGE_INCLUDES_TAXES_INSURANCE: taxesInsValue,
    TAX_AMOUNT: taxesInsValue == "Yes" ? null : propertyTaxesValue,
    INSURANCE_AMOUNT: taxesInsValue == "Yes" ? null : homeInsValue,
    HOA_MONTHLY: hoaFeeValue,
  };
  updateHomeProfileValues(
    "MORTGAGE_ESTIMATED_BALANCE",
    step4FormData.MORTGAGE_ESTIMATED_BALANCE
  );
  updateHomeProfileValues(
    "MORTGAGE_MONTHLY_PAYMENT",
    step4FormData.MORTGAGE_MONTHLY_PAYMENT
  );
  updateHomeProfileValues(
    "MORTGAGE_INCLUDES_TAXES_INSURANCE",
    step4FormData.MORTGAGE_INCLUDES_TAXES_INSURANCE
  );
  updateHomeProfileValues("TAX_AMOUNT", step4FormData.TAX_AMOUNT);
  updateHomeProfileValues("INSURANCE_AMOUNT", step4FormData.INSURANCE_AMOUNT);
  updateHomeProfileValues("HOA_MONTHLY", step4FormData.HOA_MONTHLY);

  console.log("step 4 form data", step4FormData);

  // if (step4FormData.MORTGAGE_INCLUDES_TAXES_INSURANCE == "Yes") {
  //   const monthlyTotal = parseFloat(
  //     step4FormData.MORTGAGE_MONTHLY_PAYMENT.replace(/[$,]/g, "")
  //   );
  //   if (monthlyTotal > 2500) {
  //     updateEligibilityCheck("MORTGAGE_MONTHLY_PAYMENT", "Failed");
  //     console.log(
  //       "validation failed, mothly payment",
  //       step4FormData.MORTGAGE_MONTHLY_PAYMENT,
  //       parseFloat(step4FormData.MORTGAGE_MONTHLY_PAYMENT)
  //     );
  //     PassStep4Validation = false;
  //   }
  // } else {
  //   const total =
  //     parseFloat(
  //       (step4FormData.MORTGAGE_MONTHLY_PAYMENT || "0").replace(/[$,]/g, "")
  //     ) +
  //     parseFloat((step4FormData.TAX_AMOUNT || "0").replace(/[$,]/g, "")) +
  //     parseFloat((step4FormData.INSURANCE_AMOUNT || "0").replace(/[$,]/g, ""));

  //   console.log("m piti validation total: ", total);
  //   if (total > 2500) {
  //     updateEligibilityCheck("MORTGAGE_MONTHLY_PAYMENT", "Failed");
  //     PassStep4Validation = false;
  //   }
  // }
  // console.log("MORTGAGE PITI VALIDATION PASSED", PassStep4Validation);
  // const userData = {
  //   mortgage_piti_validation_passed: PassStep4Validation,
  // };
  // sessionStorage.setItem("step4DataPass", JSON.stringify(userData));
  // // return
  // console.log("basePayload Step 4", basePayload);
  // showLoading("4");
  // removeLoading("5");
  // return;

  // Always compute the total monthly obligation by dividing annual taxes and insurance by 12
  const mortgageMonthly = parseFloat(
    (step4FormData.MORTGAGE_MONTHLY_PAYMENT || "0").replace(/[$,]/g, "")
  );
  const annualTaxes = parseFloat(
    (step4FormData.TAX_AMOUNT || "0").replace(/[$,]/g, "")
  );
  const annualInsurance = parseFloat(
    (step4FormData.INSURANCE_AMOUNT || "0").replace(/[$,]/g, "")
  );
  const totalMonthly =
    mortgageMonthly + annualTaxes / 12 + annualInsurance / 12;

  console.log(
    "Computed monthly total (mortgage + tax/12 + insurance/12):",
    totalMonthly
  );

  if (totalMonthly > 2700) {
    updateEligibilityCheck("MORTGAGE_MONTHLY_PAYMENT", "Failed");
    console.log(
      "Validation failed: total monthly obligation exceeds 2700",
      totalMonthly
    );
    PassStep4Validation = false;
  }
  const step4Data = {
    mortgage_piti_validation_passed: PassStep4Validation,
  };
  sessionStorage.setItem("step4DataPass", JSON.stringify(step4Data));
  showLoading("4");
  removeLoading("5");
  return;
}

document
  .querySelectorAll(
    '[data-input="monthly-mortgage-payment"],[data-input="remaining-mortgage-balance"],[data-input="annual-property-taxes"], [data-input="homeowners-insurance"], [data-input="monthly-hoa"]'
  )
  .forEach((input) => {
    input.addEventListener("input", function (event) {
      let value = input.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      if (value) {
        value = parseInt(value, 10).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      input.value = value || ""; // Set formatted value or clear input
    });
  });

// LAST STEP STEP 5 _ SUBMIT ALL FORM DATA TO API

function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return cleaned;
}

document.addEventListener("DOMContentLoaded", () => {
  const triggerButton = document.querySelector('[data-alt="submit"]');

  if (triggerButton) {
    triggerButton.addEventListener("click", submitFinal);
  } else {
  }

  const submitButton = document.querySelector('[data-alt="submit"]');

  // submitButton.disabled = true;
  const inputs = document.querySelectorAll(
    '[data-input="first-name"], [data-input="last-name"]'
  );
  const emailInput = document.querySelector('[data-input="email"]');
  const phoneInput = document.querySelector('[data-input="phone"]');
  const legalCheckbox = document.querySelector("#legal-checkbox");
  const discoverySourceInput = document.querySelector(
    '[data-input="discovery-source"]'
  );

  // Add touch state to email and phone inputs
  emailInput.addEventListener("focus", () => {
    emailInput.dataset.touched = true;
  });

  phoneInput.addEventListener("focus", () => {
    phoneInput.dataset.touched = true;
  });
  // Add touch state to discovery source input
  discoverySourceInput.addEventListener("focus", () => {
    discoverySourceInput.dataset.touched = true;
  });

  // Add input listener for discovery source
  discoverySourceInput.addEventListener("input", validateInputs);
  // Add input listeners for email and phone
  emailInput.addEventListener("input", validateInputs);
  phoneInput.addEventListener("input", (event) => {
    const numericPhone = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (numericPhone.length > 10) {
      event.target.value = formatPhoneNumber(numericPhone.slice(0, 10));
    } else if (numericPhone.length === 10) {
      event.target.value = formatPhoneNumber(numericPhone);
    } else {
      event.target.value = numericPhone;
    }
    validateInputs();
  });

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

    // Validate discovery source - must have a value
    if (
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

    // Validate email - must be valid format
    if (!validateEmail(emailInput.value)) {
      emailInput.classList.remove("is-valid");
      if (emailInput.dataset.touched) {
        emailInput.classList.add("is-invalid");
      }
      allValid = false;
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    }

    // Validate phone - must be 10 digits
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

    // Validate checkbox - must be checked
    if (!legalCheckbox.checked) {
      allValid = false;
    }

    // Explicitly set the disabled state of the submit button
    // if (allValid) {
    //   submitButton.removeAttribute("disabled");
    // } else {
    //   submitButton.setAttribute("disabled", "disabled");
    // }

    return allValid;
  }

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.dataset.touched = true;
    });
    input.addEventListener("input", (event) => {
      if (event.target === phoneInput) {
        const numericPhone = phoneInput.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (numericPhone.length > 10) {
          phoneInput.value = formatPhoneNumber(numericPhone.slice(0, 10)); // Limit to 10 digits and format
        } else if (numericPhone.length === 10) {
          phoneInput.value = formatPhoneNumber(numericPhone); // Format the phone number
        } else {
          phoneInput.value = numericPhone; // Keep only numbers, no formatting
        }
      }
      validateInputs();
    });
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

  submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    if (!legalCheckbox.checked) {
      console.log("Checkbox is not checked.");
      return;
    }
  });
});

async function submitFinal() {
  if (!validateFormInput("5")) {
    return;
  }

  const step4Data = JSON.parse(sessionStorage.getItem("step4DataPass"));
  const userData = {
    firstName: document.querySelector('[data-input="first-name"]').value,
    lastName: document.querySelector('[data-input="last-name"]').value,
    email: document.querySelector('[data-input="email"]').value,
    phone: document.querySelector('[data-input="phone"]').value,
    bonusDiscoverySource: document.querySelector(
      '[data-input="discovery-source"]'
    ).value,
  };

  const mortgagePITIPass = step4Data.mortgage_piti_validation_passed;

  basePayload.contactInfo.firstName = userData.firstName;
  basePayload.contactInfo.lastName = userData.lastName;
  basePayload.contactInfo.email = userData.email;
  basePayload.contactInfo.phoneNumber = userData.phone.replace(/\D/g, "");
  basePayload.contactInfo.bonusDiscoverySource =
    userData.bonusDiscoverySource.replace(/[^a-zA-Z]/g, "");
  basePayload.isQualified = mortgagePITIPass;

  try {
    // const apiResponse = await submitDataToAPI(homeData, userData, step3Data);
    if (PassStep4Validation) {
      showLoading("5");
      delete basePayload["reasonUnqualified"];
      basePayload.locationProfile.eligibilityCheck = "Passed";
      const apiResponse = await submitDataToAPI();

      // Store the API response in sessionStorage
      sessionStorage.setItem("responseData", JSON.stringify(apiResponse));
      sessionStorage.removeItem("basePayload");
      sessionStorage.setItem("finalBasePayload", JSON.stringify(basePayload));

      window.location.href = "/submit-home-submitted";
      return apiResponse; // You can return the API response if needed
    } else {
      const step = document.querySelector('[data-step="not-qualified"]');
      showLoading("5");
      removeLoading(step);
      return;
    }
  } catch (error) {
    console.error("Submission error:", error);
  }
}

//////////////////////////////////////////////
// Submission / API-related logic
//////////////////////////////////////////////
/// bonus https://vpqqjszp06.execute-api.us-west-1.amazonaws.com/prod/submitHomeownerWebsiteLead
/// shane https://prr3s34b9e.execute-api.us-east-2.amazonaws.com/bonussubmitlead
async function submitDataToAPI() {
  try {
    console.log(
      "Final Payload being sent to the API:",
      JSON.stringify(basePayload, null, 2)
    );

    console.log("Starting API submission...");

    const response = await fetch(
      "https://vpqqjszp06.execute-api.us-west-1.amazonaws.com/prod/submitHomeownerWebsiteLead",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(basePayload),
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

// step not qualified
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector('[data-step="not-qualified"]');
  const triggerButton = wrapper.querySelector('[data-alt="submit"]');

  if (triggerButton) {
    triggerButton.addEventListener("click", submitFinalConsent);
  } else {
  }
});

async function submitFinalConsent() {
  const input = document.querySelector('[data-input="share-consent"]');
  const answer = input.querySelector("[data-select].is-valid");

  // console.log("consent answer", answer);
  // const value = answer.querySelector("div").textContent == "Yes" ? true : false;
  // basePayload.contactInfo.homeownerConsentToShareInfo = value;
  // basePayload.reasonUnqualified = "FailedFeaturesCheck";
  console.log("consent answer", answer);
  const value = answer.querySelector("div").textContent == "Yes";

  basePayload.contactInfo = {
    ...basePayload.contactInfo,
    homeownerConsentToShareInfo: value, // Will be true if "Yes", false if "No"
  };

  // Update the text of the final consent label if the answer is "No"
  if (!value) {
    const finalConsentLabel = document.querySelector(
      '[data-label="final-consent"]'
    );
    if (finalConsentLabel) {
      finalConsentLabel.textContent =
        "Good deal, we won’t share your info without your consent.";
    }
  }

  basePayload.reasonUnqualified = "FailedFeaturesCheck";

  const current = document.querySelector('[data-step="not-qualified"]');
  const finalStep = document.querySelector('[data-step="sent-to-agent"]');
  current.style.display = "none";
  finalStep.style.display = "block";

  sessionStorage.removeItem("basePayload");
  sessionStorage.setItem("finalPayloadPITIFailed", JSON.stringify(basePayload));

  try {
    const apiResponse = await submitDataToAPI();

    return apiResponse;
  } catch (error) {
    console.error("Submission error:", error);
  }
}

// data-label="final-consent"
