const basePayload = {
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  userType: "Agent",
  contactInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    // bonusDiscoverySource: "",
    agentBrokerage: "",
    agentCommunicationConsent: true,
  },
  isQualified: false,
  locationProfile: {
    isInPreferredZipCode: false,
    isInOperatedMSA: false, // No longer used for validation
    isInOperatedState: false, // No longer used for validation
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

// A global state object to hold user and property data.
const appState = {
  propertyData: null,
  userData: null,
  googleAutocompleteData: null, // Add a place to store Autocomplete data
};

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
    // if (input.type == "email") {
    //   if (input.value.includes("@")) {
    //     input.classList.add("is-valid");
    //     input.classList.remove("is-invalid");
    //   } else {
    //     input.classList.add("is-invalid");
    //     input.classList.remove("is-valid");
    //   }
    // }

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

    if (input.dataset.input === "phone") {
      // Always reformat first
      handlePhoneInputFormat(input);
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (phoneRegex.test(input.value.trim())) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        allFilled = false;
      }
      // Skip further (generic) processing for this input
      return;
    }
  });

  return allFilled;

  // const step2 = document.querySelector()
  // const value = inputElement.value.trim();

  // let isValid = true;

  // // For text and other inputs, check if the value is empty
  // if (value === "") {
  //   alert("This field cannot be empty!");
  //   inputElement.focus();
  //   isValid = false;
  // }

  // // For select inputs, check if a valid option is selected
  // else if (
  //   inputElement.tagName === "SELECT" &&
  //   (inputElement.value === "" ||
  //     inputElement.value == "Select One..." ||
  //     inputElement.value == "Select one...")
  // ) {
  //   alert("Please select an option!");
  //   inputElement.focus();
  //   isValid = false;
  // }

  // // Toggle validity classes based on isValid value
  // if (isValid) {
  //   inputElement.classList.add("is-valid");
  //   inputElement.classList.remove("is-invalid");
  // } else {
  //   inputElement.classList.add("is-invalid");
  //   inputElement.classList.remove("is-valid");
  // }

  // return isValid;
}

////////////////////////////////////////////
// Global State and Utility Functions
//////////////////////////////////////////////
// Modified version of setupQueryParamCheck()

// A simple logger with optional details
function logWithDetails(type, message, details = {}) {
  console.log(`[${type}] ${message}`, details);
}

// Parse address into street, city, state, zip
// function parseAddress(addressString) {
//   const addressParts = addressString.split(",");
//   if (addressParts.length < 3) {
//     throw new Error("Invalid address format");
//   }
//   const [streetAddress, city, stateAndZip] = addressParts.map((part) =>
//     part.trim()
//   );
//   const [state, zipCode] = stateAndZip.split(" ");
//   return {
//     streetAddress,
//     city,
//     stateAbbrev: state,
//     zipCode,
//   };
// }

function parseAddress(addressString) {
  const addressParts = addressString.split(",");
  if (addressParts.length < 3) {
    throw new Error("Invalid address format");
  }
  // Trim all parts
  const [streetAddress, city, stateAndZip] = addressParts.map((part) =>
    part.trim()
  );

  // Split the state and zip parts into words
  const stateAndZipParts = stateAndZip.split(" ");

  // Take the last element as the zip code
  const zipCode = stateAndZipParts.pop();

  // Join the remaining parts to form the state name
  const state = stateAndZipParts.join(" ");

  return {
    streetAddress,
    city,
    stateAbbrev: state, // or rename to state if you prefer
    zipCode,
  };
}

// Basic check to see if the address is valid enough to attempt validation
function isValidAddress(addressString) {
  const addressParts = addressString.split(",");
  if (addressParts.length < 3) return false;
  const stateAndZip = addressParts[2].trim().split(" ");
  return (
    stateAndZip.length >= 2 && stateAndZip[stateAndZip.length - 1].length >= 5
  );
}

// Show a loading "step" and hide a given step
function showLoading(stepNum) {
  console.log("CHANGING TO LOADING SCREEN");
  const currentStep = document.querySelector(`[data-step="${stepNum}"]`);
  const loadingStep = document.querySelector('[data-step="loading"]');
  loadingStep.style.display = "block";
  currentStep.style.display = "none";
  console.log("LOADING SCREEN HAS BEEN CHANGED");
}

// Remove loading "step" and show a given step
function removeLoading(stepNum) {
  console.log("LOADING SCREEN REMOVAL");
  const show = document.querySelector(`[data-step="${stepNum}"]`);
  const loadingStep = document.querySelector('[data-step="loading"]');
  loadingStep.style.display = "none";
  show.style.display = "block";
  console.log("LOADING SCREEN REMOVED");
}

//////////////////////////////////////////////
// Set up multi-step logic on DOM load
//////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  initializeSteps();

  // setupAddressTrigger();
  setupQueryParamCheck();

  setupUserFormValidation();
  setupBackNavigation();

  // Reset submission state if we're on the form page (not success page)
  if (!window.location.pathname.includes("submit-agent-success")) {
    sessionStorage.removeItem("formSubmitted");
  } else {
    // If we're on the success page, mark as submitted
    sessionStorage.setItem("formSubmitted", "true");
  }
});

// Hide all steps except step 1 initially
function initializeSteps() {
  const steps = document.querySelectorAll("[data-step]");
  steps.forEach((step) => {
    if (step.getAttribute("data-step") !== "1") {
      step.style.display = "none";
    } else {
      // Explicitly show Step 1
      step.style.display = "block";
    }
  });
}

// Wire up the event handler to the Next button on Step 1
// function setupAddressTrigger() {
//   const triggerButton = document.querySelector(
//     '[data-trigger="address-validation"]'
//   );
//   if (!triggerButton) {
//     logWithDetails("INITIALIZATION", "Warning: Trigger button not found");
//     return;
//   }
//   logWithDetails(
//     "INITIALIZATION",
//     "Found trigger button, attaching click handler"
//   );
//   triggerButton.addEventListener("click", handleAddressSubmission);
// }

// If there's an "address" query param, auto-fill the address input and submit
// function setupQueryParamCheck() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const addressParam = urlParams.get("address");
//   if (addressParam) {
//     const addressInput = document.querySelector('[data-input="address"]');
//     if (addressInput) {
//       addressInput.value = decodeURIComponent(addressParam);
//       handleAddressSubmission(); // Attempt validation automatically
//     }
//   }
// }

// Helper function to set up "Back" button for Step 2
function setupBackNavigation() {
  const backButton = document.querySelector('[data-alt="back"]');
  if (backButton) {
    backButton.addEventListener("click", function () {
      removeLoading("1"); // In case we want to show step 1 again
    });
  }
}

//////////////////////////////////////////////
// Address Submission / Validation
//////////////////////////////////////////////

// async function handleAddressSubmission() {
//   const startTime = performance.now();
//   logWithDetails("SUBMISSION", "Starting address submission");

//   const addressInput = document.querySelector('[data-input="address"]');
//   const addressString = addressInput.value;
//   logWithDetails("SUBMISSION", "Retrieved address from input", {
//     address: addressString,
//   });

//   if (!isValidAddress(addressString)) {
//     logWithDetails("SUBMISSION", "Address validation failed (client-side)");
//     return;
//   }

//   showLoading("1");
//   const addressData = parseAddress(addressString);
//   logWithDetails("SUBMISSION", "Prepared API request", { addressData });

//   try {
//     const response = await fetch(
//       "https://kfhxu6otvh.execute-api.us-east-2.amazonaws.com/validate",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         mode: "cors",
//         credentials: "omit",
//         body: JSON.stringify(addressData),
//       }
//     );

//     const data = await response.json();

//     // Handle API errors first
//     if (data.errors && data.errors.length > 0) {
//       const propertyNotFoundError = data.errors.find(
//         (e) => e.extensions?.code === "PROPERTY_NOT_FOUND"
//       );

//       if (propertyNotFoundError) {
//         const locationProfile =
//           propertyNotFoundError.extensions?.locationProfile;

//         // Remove loading spinner and reset UI
//         removeLoading("1");

//         // Show appropriate error message in Step 1
//         showErrorMessage(
//           "We found your location but couldn't verify the property details. Please check the address and try again."
//         );
//         return;
//       }

//       // Handle other errors
//       removeLoading("1");
//       showErrorMessage(
//         "There was an error processing your request. Please try again."
//       );
//       return;
//     }

//     // Now validate the address response structure
//     if (!validateAddressResponse(data)) {
//       removeLoading("1");
//       sessionStorage.setItem(
//         "agentData",
//         JSON.stringify({ resp: data.data?.property })
//       );
//       window.location.href = "/submit-home-submitted";
//       return;
//     }

//     if (!data?.data?.property) {
//       removeLoading("1");
//       showErrorMessage("Invalid response format. Please try again.");
//       return;
//     }

//     appState.propertyData = data.data.property;

//     // Proceed to Step 2
//     removeLoading("2");
//     setupFinalSubmission();

//     const endTime = performance.now();
//     logWithDetails("TIMING", "Address submission success", {
//       elapsedMS: (endTime - startTime).toFixed(2),
//     });
//   } catch (error) {
//     removeLoading("1");
//     showErrorMessage(
//       "Network error. Please check your connection and try again."
//     );
//     const endTime = performance.now();
//     logWithDetails("ERROR", "Error in address submission process", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//       elapsedMS: (endTime - startTime).toFixed(2),
//     });
//   }
// }

// async function handleAddressSubmission() {
//   const startTime = performance.now();
//   logWithDetails("SUBMISSION", "Starting address submission");

//   const addressInput = document.querySelector('[data-input="address"]');
//   const addressString = addressInput.value;
//   logWithDetails("SUBMISSION", "Retrieved address from input", {
//     address: addressString,
//   });

//   if (!isValidAddress(addressString)) {
//     logWithDetails("SUBMISSION", "Address validation failed (client-side)");
//     return;
//   }

//   showLoading("1");
//   const addressData = parseAddress(addressString);
//   logWithDetails("SUBMISSION", "Prepared API request", { addressData });

//   try {
//     const response = await fetch(
//       "https://kfhxu6otvh.execute-api.us-east-2.amazonaws.com/validate",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         mode: "cors",
//         credentials: "omit",
//         body: JSON.stringify(addressData),
//       }
//     );

//     const data = await response.json();

//     // Handle API errors first
//     if (data.errors && data.errors.length > 0) {
//       const propertyNotFoundError = data.errors.find(
//         (e) => e.extensions?.code === "PROPERTY_NOT_FOUND"
//       );

//       if (propertyNotFoundError) {
//         const locationProfile =
//           propertyNotFoundError.extensions?.locationProfile;

//         // Remove loading spinner
//         removeLoading("2"); // Proceed to Step 2 even on error

//         // Optionally show error message in Step 2:
//         // showErrorMessageInStep2(
//         //   "We found your location but couldn't verify the property details. Please check the address and try again."
//         // );

//         setupFinalSubmission(); // Ensure Step 2 functionality is set up
//         return; // Continue to Step 2
//       }

//       // Handle other errors
//       removeLoading("2"); // Proceed to Step 2
//       // showErrorMessageInStep2(
//       //   "There was an error processing your request. Please try again."
//       // );
//       setupFinalSubmission(); // Ensure Step 2 functionality is set up
//       return; // Continue to Step 2
//     }

//     // Now validate the address response structure
//     if (!validateAddressResponse(data)) {
//       removeLoading("2");
//       sessionStorage.setItem(
//         "agentData",
//         JSON.stringify({ resp: data.data?.property })
//       );
//       // window.location.href = "/submit-home-submitted";
//       // showErrorMessageInStep2(
//       //   "We found your location but it is not in an area we operate in. Please check the address and try again."
//       // );
//       setupFinalSubmission();
//       return;
//     }

//     if (!data?.data?.property) {
//       removeLoading("2"); // Proceed to Step 2
//       // showErrorMessageInStep2("Invalid response format. Please try again.");
//       setupFinalSubmission(); // Ensure Step 2 functionality is set up
//       return; // Continue to Step 2
//     }

//     appState.propertyData = data.data.property;

//     // Proceed to Step 2
//     removeLoading("2");
//     setupFinalSubmission();

//     const endTime = performance.now();
//     logWithDetails("TIMING", "Address submission success", {
//       elapsedMS: (endTime - startTime).toFixed(2),
//     });
//   } catch (error) {
//     removeLoading("2"); // Proceed to Step 2 even on network error
//     // showErrorMessageInStep2(
//     //   "Network error. Please check your connection and try again."
//     // );
//     setupFinalSubmission(); // Ensure Step 2 functionality is set up
//     const endTime = performance.now();
//     logWithDetails("ERROR", "Error in address submission process", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//       elapsedMS: (endTime - startTime).toFixed(2),
//     });
//   }
// }

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

// let finalSubmissionSetup = false; // Flag to track if setupFinalSubmission has been called
let finalSubmissionSetup = false; // Flag to track if setupFinalSubmission has been called

async function handleAddressSubmission() {
  const startTime = performance.now();
  logWithDetails("SUBMISSION", "Starting address submission");
  // this code forces a user to select an address from the dropdown to progress pass step 1
  // if they don't select an address, they will be alerted to do so and the address input will be marked as invalid
  // struct_address is set in the GLOBAL JS file that is in the global webflow custom code settings
  const structAddress = sessionStorage.getItem("struct_address");
  if (!structAddress) {
    alert("Please select an address from the dropdown to continue.");
    const addressInput = document.querySelector('[data-input="address"]');
    if (addressInput) {
      addressInput.classList.remove("is-valid");
      addressInput.classList.add("is-invalid");
    }
    // return to force the user to select from the dropdown
    return;
  }

  const addressInput = document.querySelector('[data-input="address"]');
  const addressString = addressInput.value;
  logWithDetails("SUBMISSION", "Retrieved address from input", {
    address: addressString,
  });

  if (!isValidAddress(addressString)) {
    logWithDetails("SUBMISSION", "Address validation failed (client-side)");
    return;
  }

  if (!validateFormInput("1")) {
    return;
  }

  showLoading("1");
  const addressData = parseAddress(addressString);
  console.log("addressData:", addressData); // Log the parsed address data

  logWithDetails("SUBMISSION", "Prepared API request", { addressData });

  // bonus api https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty
  // shanes api https://kfhxu6otvh.execute-api.us-east-2.amazonaws.com/validate

  try {
    const response = await fetch(
      "https://qtgh7m7p8l.execute-api.us-west-1.amazonaws.com/prod/validateWebsiteProperty",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify(addressData),
      }
    );

    const data = await response.json();
    console.log("API RESPONSE DATA", data);

    // Handle API errors first
    if (data.errors && data.errors.length > 0) {
      const propertyNotFoundError = data.errors.find(
        (e) => e.extensions?.code === "PROPERTY_NOT_FOUND"
      );

      if (propertyNotFoundError) {
        const locationProfile =
          propertyNotFoundError.extensions?.locationProfile;

        // Get struct_address from sessionStorage
        const structAddress = JSON.parse(
          sessionStorage.getItem("struct_address")
        );
        console.log("structAddress from sessionStorage:", structAddress);

        // Build blank agent data (basePayload) - Use structAddress if available
        // const blankAgentData = {
        //   ...basePayload,
        //   streetAddress: structAddress
        //     ? `${structAddress.components.streetNumber} ${structAddress.components.street}`
        //     : addressData.streetAddress,
        //   city: structAddress?.components.city || addressData.city,
        //   state:
        //     transformStateToAbbrev(structAddress?.components.state) ||
        //     addressData.state, // Use transformed state
        //   zipCode: structAddress?.components.zip || addressData.zipCode,
        //   locationProfile: {
        //     isInPreferredZipCode:
        //       locationProfile?.isInPreferredZipCode || false,
        //     isInOperatedMSA: locationProfile?.isInOperatedMSA || false,
        //     isInOperatedState: locationProfile?.isInOperatedState || false,
        //     eligibilityCheck: "Failed",
        //   },
        // };

        const blankAgentData = {
          ...basePayload,
          streetAddress: structAddress
            ? `${structAddress.components.streetNumber} ${structAddress.components.street}`
            : addressData.streetAddress,
          city: structAddress?.components.city || addressData.city,
          state:
            transformStateToAbbrev(structAddress?.components.state) ||
            addressData.state, // Use transformed state
          zipCode: structAddress?.components.zip || addressData.zipCode,
          locationProfile: {
            isInPreferredZipCode:
              locationProfile?.isInPreferredZipCode || false,
            isInOperatedMSA: locationProfile?.isInOperatedMSA || false,
            isInOperatedState: locationProfile?.isInOperatedState || false,
            eligibilityCheck:
              locationProfile?.isInPreferredZipCode === true
                ? "Passed"
                : "Failed",
          },
        };

        console.log("blankAgentData (propertyNotFoundError):", blankAgentData);

        // Validate location profile from error extensions
        if (locationProfile) {
          basePayload.locationProfile.isInPreferredZipCode =
            locationProfile.isInPreferredZipCode || false;
          basePayload.locationProfile.isInOperatedMSA =
            locationProfile.isInOperatedMSA || false;
          basePayload.locationProfile.isInOperatedState =
            locationProfile.isInOperatedState || false;

          // Only qualify if zip code is preferred
          basePayload.isQualified =
            locationProfile.isInPreferredZipCode === true;
          basePayload.locationProfile.eligibilityCheck = basePayload.isQualified
            ? "Passed"
            : "Failed";
        } else {
          basePayload.isQualified = false;
          basePayload.locationProfile.eligibilityCheck = "Failed";
        }

        console.log("basepayload after updates", basePayload);
        // Remove loading spinner
        removeLoading("2"); // Proceed to Step 2 even on error

        // Set blank agent data to appState
        appState.propertyData = blankAgentData;

        // Also update basePayload to ensure consistency
        basePayload.streetAddress = blankAgentData.streetAddress;
        basePayload.city = blankAgentData.city;
        basePayload.state = blankAgentData.state;
        basePayload.zipCode = blankAgentData.zipCode;
        basePayload.locationProfile = { ...blankAgentData.locationProfile };

        // Call setupFinalSubmission only if it hasn't been called before
        if (!finalSubmissionSetup) {
          setupFinalSubmission();
          finalSubmissionSetup = true;
        }
        return; // Continue to Step 2
      }

      // Handle other errors
      removeLoading("2"); // Proceed to Step 2

      // Call setupFinalSubmission only if it hasn't been called before
      if (!finalSubmissionSetup) {
        setupFinalSubmission();
        finalSubmissionSetup = true;
      }
      return; // Continue to Step 2
    }

    // Now validate the address response structure
    if (!validateAddressResponse(data)) {
      sessionStorage.setItem(
        "agentData",
        JSON.stringify({ resp: data.data?.property })
      );

      // Call setupFinalSubmission only if it hasn't been called before
      if (!finalSubmissionSetup) {
        setupFinalSubmission();
        finalSubmissionSetup = true;
      }
      // Add address to query params for fail redirect
      const addressInput = document.querySelector('[data-input="address"]');
      const failQueryParams = new URLSearchParams();
      if (addressInput && addressInput.value.trim()) {
        failQueryParams.set("address", addressInput.value.trim());
      }
      window.location.href = `/submit-agent-fail-not-in-state?${failQueryParams.toString()}`;
      return;
    }

    // If no property data, build blank agent data - Use structAddress if available
    if (!data?.data?.property) {
      // Get struct_address from sessionStorage
      const structAddress = JSON.parse(
        sessionStorage.getItem("struct_address")
      );
      console.log("structAddress from sessionStorage:", structAddress);

      // Build blank agent data (basePayload) - Use structAddress if available
      const blankAgentData = {
        ...basePayload,
        streetAddress: structAddress
          ? `${structAddress.components.streetNumber} ${structAddress.components.street}`
          : addressData.streetAddress,
        city: structAddress?.components.city || addressData.city,
        state:
          transformStateToAbbrev(structAddress?.components.state) ||
          addressData.state, // Use transformed state
        zipCode: structAddress?.components.zip || addressData.zipCode,
      };

      console.log("blankAgentData (no property data):", blankAgentData);

      removeLoading("2"); // Proceed to Step 2

      // Set blank agent data to appState
      appState.propertyData = blankAgentData;

      // Also update basePayload to ensure consistency
      basePayload.streetAddress = blankAgentData.streetAddress;
      basePayload.city = blankAgentData.city;
      basePayload.state = blankAgentData.state;
      basePayload.zipCode = blankAgentData.zipCode;
      // For no property data case, assume location validation failed
      basePayload.locationProfile.isInPreferredZipCode = false;
      basePayload.locationProfile.isInOperatedMSA = false;
      basePayload.locationProfile.isInOperatedState = false;
      basePayload.locationProfile.eligibilityCheck = "Failed";
      basePayload.isQualified = false;

      // Call setupFinalSubmission only if it hasn't been called before
      if (!finalSubmissionSetup) {
        setupFinalSubmission();
        finalSubmissionSetup = true;
      }
      return; // Continue to Step 2
    }

    appState.propertyData = data.data.property;

    // Proceed to Step 2
    removeLoading("2");

    // Call setupFinalSubmission only if it hasn't been called before
    if (!finalSubmissionSetup) {
      setupFinalSubmission();
      finalSubmissionSetup = true;
    }

    const endTime = performance.now();
    logWithDetails("TIMING", "Address submission success", {
      elapsedMS: (endTime - startTime).toFixed(2),
    });
  } catch (error) {
    removeLoading("2"); // Proceed to Step 2 even on network error

    // Call setupFinalSubmission only if it hasn't been called before
    if (!finalSubmissionSetup) {
      setupFinalSubmission();
      finalSubmissionSetup = true;
    }

    const endTime = performance.now();
    logWithDetails("ERROR", "Error in address submission process", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      elapsedMS: (endTime - startTime).toFixed(2),
    });
  }
}

//
//
//
//
// Helper function to display error messages in Step 1
function showErrorMessage(message) {
  const errorContainer = document.querySelector(
    '[data-error-container="address"]'
  );
  const addressInput = document.querySelector('[data-input="address"]');

  // errorContainer.textContent = message;
  // errorContainer.style.display = "block";
  addressInput.focus();
}

// // Confirm the property is in an operated state
// function validateAddressResponse(data) {
//   return data?.data?.property?.locationProfile?.isInOperatedState === true;
// }

function validateAddressResponse(data) {
  // First try to get the location profile from the property
  let location = data?.data?.property?.locationProfile;
  // If not found, look for it in the error extensions
  if (!location && data?.errors && data.errors.length > 0) {
    location = data.errors[0]?.extensions?.locationProfile;
  }

  // Only pass if zip code is preferred - no MSA or State fallback
  if (location?.isInPreferredZipCode === true) {
    return true;
  }
  return false;
}

// function setupQueryParamCheck() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const addressParam = urlParams.get("address");

//   if (addressParam) {
//     const addressInput = document.querySelector('[data-input="address"]');
//     const displayElements = document.querySelectorAll(
//       '[data-tag="display-address"]'
//     );

//     if (addressInput) {
//       const decodedAddress = decodeURIComponent(addressParam);
//       addressInput.value = decodedAddress;

//       // Update display elements
//       displayElements.forEach((el) => {
//         el.textContent = decodedAddress;
//       });

//       handleAddressSubmission(); // Existing auto-validation
//     }
//   }
// }

function setupQueryParamCheck() {
  const urlParams = new URLSearchParams(window.location.search);
  const addressParam = urlParams.get("address");

  const addressInput = document.querySelector('[data-input="address"]');
  const displayElements = document.querySelectorAll(
    '[data-tag="display-address"]'
  );
  const triggerButton = document.querySelector(
    '[data-trigger="address-validation"]'
  );

  if (addressParam) {
    // If query param exists, decode and update the address
    const decodedAddress = decodeURIComponent(addressParam);

    if (addressInput) {
      addressInput.value = decodedAddress;

      // Update display elements
      displayElements.forEach((el) => {
        el.textContent = decodedAddress;
      });

      handleAddressSubmission(); // Existing auto-validation
    }
  } else if (triggerButton) {
    // If no query param exists, wait for the trigger button to be clicked
    triggerButton.addEventListener("click", () => {
      if (!validateFormInput("1")) {
        // alert("Please enter an address before validating."); // Optional user feedback
        return;
      }
      if (addressInput) {
        const userInput = addressInput.value.trim(); // Get user-entered address

        if (userInput) {
          // Update display elements
          displayElements.forEach((el) => {
            el.textContent = userInput;
          });

          handleAddressSubmission(); // Call validation function
        } else {
          alert("Please enter an address before validating."); // Optional user feedback
        }
      }
    });
  }
}

// function setupQueryParamCheck() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const addressParam = urlParams.get("address");

//   if (addressParam) {
//     const addressInput = document.querySelector('[data-input="address"]');
//     const displayElements = document.querySelectorAll(
//       '[data-tag="display-address"]'
//     );

//     if (addressInput) {
//       const decodedAddress = decodeURIComponent(addressParam);
//       addressInput.value = decodedAddress;

//       // Update display elements
//       displayElements.forEach((el) => {
//         el.textContent = decodedAddress;
//       });

//       // Remove handleAddressSubmission() from here, as we will trigger it on button click
//       handleAddressSubmission(); // Existing auto-validation (Removed)
//     }
//   }
// }

// function handleAddressValidationClick() {
//   const validationButton = document.querySelector(
//     '[data-trigger="address-validation"]'
//   );

//   if (validationButton) {
//     validationButton.addEventListener("click", () => {
//       handleAddressSubmission(); // Trigger your existing validation logic
//     });
//   }
// }

// // Run the setup function when the page loads
// window.addEventListener("DOMContentLoaded", () => {
//   setupQueryParamCheck();
//   handleAddressValidationClick(); // Setup click listener for the validation button
// });

//////////////////////////////////////////////
// Final Submission to the "submit" endpoint
//////////////////////////////////////////////

//new code today jan 29

// Define handleSubmitClick in the global scope
// function handleSubmitClick(event) {
//   event.preventDefault();
//   const legalCheckbox = document.querySelector("#legal-checkbox");
//   if (!legalCheckbox.checked) {
//     console.log("Checkbox is not checked.");
//     return;
//   }

//   // Gather user data from Step 2
//   const formattedPhone = document.querySelector('[data-input="phone"]').value;
//   const unformattedPhone = formattedPhone.replace(/\D/g, "");
//   appState.userData = {
//     firstName: document.querySelector('[data-input="first-name"]').value.trim(),
//     lastName: document.querySelector('[data-input="last-name"]').value.trim(),
//     email: document.querySelector('[data-input="email"]').value.trim(),
//     phone: unformattedPhone,
//     brokerage: document.querySelector('[data-input="brokerage"]').value.trim(),
//   };

//   // Attempt final submission to the API
//   showLoading("2");
//   submitDataToAPI(appState.propertyData, appState.userData)
//     .then((res) => {
//       console.log("Lead submitted successfully:", res);
//       sessionStorage.setItem("responseData", JSON.stringify(res));
//       const queryParams = new URLSearchParams({
//         success: res.success,
//         leadId: res.leadId,
//       });
//       window.location.href = `/submit-agent-success?${queryParams.toString()}`;
//     })
//     .catch((err) => {
//       removeLoading("2");
//       console.log("Error submitting lead:", err);
//     });
// }
/// end of new code

// Sets up the final "Submit" button click for Step 2
function setupFinalSubmission() {
  const submitButton = document.querySelector('[data-alt="submit"]');
  if (!submitButton) return;

  // Remove existing event listeners before adding a new one
  // Clone the button to remove all existing event listeners
  const newSubmitButton = submitButton.cloneNode(true);
  submitButton.parentNode.replaceChild(newSubmitButton, submitButton);

  newSubmitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // Check if we've already successfully submitted
    if (sessionStorage.getItem("formSubmitted") === "true") {
      console.log("Form already submitted successfully, ignoring click");
      return;
    }

    // Set flag IMMEDIATELY to prevent race conditions and duplicate submissions
    sessionStorage.setItem("formSubmitted", "true");
    console.log("Form submission started, preventing future submissions");

    try {
      const legalCheckbox = document.querySelector("#legal-checkbox");
      legalCheckbox.dataset.touched = true;

      // Gather user data from Step 2
      const formattedPhone = document.querySelector(
        '[data-input="phone"]'
      ).value;
      const unformattedPhone = formattedPhone.replace(/\D/g, "");
      appState.userData = {
        firstName: document
          .querySelector('[data-input="first-name"]')
          .value.trim(),
        lastName: document
          .querySelector('[data-input="last-name"]')
          .value.trim(),
        email: document.querySelector('[data-input="email"]').value.trim(),
        phone: unformattedPhone,
        brokerage: document
          .querySelector('[data-input="brokerage"]')
          .value.trim(),
      };

      // Debug: Log what we're actually capturing
      console.log(
        "🔍 DEBUG - Phone field value:",
        document.querySelector('[data-input="phone"]').value
      );
      console.log("🔍 DEBUG - Unformatted phone:", unformattedPhone);
      console.log("🔍 DEBUG - appState.userData:", appState.userData);

      if (!validateFormInput("2")) {
        // Reset flag if validation fails so user can retry
        sessionStorage.removeItem("formSubmitted");
        console.log("Form validation failed, allowing retry");
        return;
      }

      showLoading("2");
      const res = await submitDataToAPI(
        appState.propertyData,
        appState.userData
      );

      console.log("Form submitted successfully, keeping submission flag set");

      // Save the final payload to sessionStorage for success page tracking
      const finalPayload = {
        contactInfo: appState.userData,
        streetAddress: appState.propertyData?.streetAddress || "",
        city: appState.propertyData?.city || "",
        state: appState.propertyData?.state || "",
        zipCode: appState.propertyData?.zipCode || "",
        homeProfile: appState.propertyData?.homeProfile || [],
        locationProfile: appState.propertyData?.locationProfile || {},
        isQualified: appState.propertyData?.isQualified || false,
        // Add missing fields for complete Segment tracking
        source: "", // Agent forms don't have discovery source
        brokerage: appState.userData.brokerage || "", // Ensure brokerage is at top level
        // Add UTM parameters if available
        utmParams: appState.utmParams || {},
      };
      sessionStorage.setItem("finalBasePayload", JSON.stringify(finalPayload));
      console.log(
        "✅ Saved finalBasePayload to sessionStorage for success page tracking"
      );

      // Segment tracking removed - now handled on final submission pages only

      sessionStorage.setItem("responseData", JSON.stringify(res));
      const queryParams = new URLSearchParams({
        success: res.success,
        leadId: res.leadId,
      });
      // Add address to query params
      const addressInput = document.querySelector('[data-input="address"]');
      if (addressInput && addressInput.value.trim()) {
        queryParams.set("address", addressInput.value.trim());
      }
      window.location.href = `/submit-agent-success?${queryParams.toString()}`;
    } catch (err) {
      // Reset flag on error so user can retry
      sessionStorage.removeItem("formSubmitted");
      removeLoading("2");
      console.log("Error submitting lead:", err);
      console.log("Form submission failed, allowing retry");
    }
  });
}

function validateAndBuildHomeProfile(propertyData) {
  let allPassed = true;
  const checks = [];

  // HOME_TYPE: Must be "Single Family"
  // let homeTypeTransformed = propertyData.homeType; // Default to the original value
  // let homeTypeTransformed = propertyData.homeType ?? ""; // Use an empty string if null

  // if (propertyData.homeType?.toLowerCase() === "singlefamily") {
  //   homeTypeTransformed = "Single-Family Detached Home";
  // }

  let homeTypeTransformed = propertyData?.homeType ?? ""; // Now safely handles propertyData being null
  if (propertyData?.homeType?.toLowerCase() === "singlefamily") {
    homeTypeTransformed = "Single-Family Detached Home";
  }

  const homeTypePassed =
    homeTypeTransformed === "Single-Family Detached Home" ? "Passed" : "Failed";

  if (homeTypePassed === "Failed") allPassed = false;

  checks.push({
    id: "HOME_TYPE",
    value: homeTypeTransformed, // Use the transformed value here
    eligibilityCheck: homeTypePassed,
  });

  // BEDS: Handle undefined propertyData.numOfBeds
  const bedValue = propertyData?.numOfBeds ?? ""; // Default to empty string if undefined
  const bedPassed =
    bedValue === 0 ? "Passed" : bedValue >= 3 ? "Passed" : "Failed";
  if (bedPassed === "Failed") allPassed = false;
  checks.push({
    id: "BEDS",
    value: bedValue,
    eligibilityCheck: bedPassed,
  });

  // BATHS: Handle undefined propertyData.numOfBaths
  const bathValue = propertyData?.numOfBaths ?? ""; // Default to empty string if undefined
  const bathPassed =
    bathValue === 0 ? "Passed" : bathValue >= 2 ? "Passed" : "Failed";
  if (bathPassed === "Failed") allPassed = false;
  checks.push({
    id: "BATHS",
    value: bathValue,
    eligibilityCheck: bathPassed,
  });

  // ACRES: Must be <= 0.5
  // const acreageValue = parseFloat(propertyData.acreage); // Ensure it's a number
  // console.log("ACRES Value:", acreageValue);
  // console.log("Type of ACRES Value:", typeof acreageValue);

  // const acreagePassed = acreageValue <= 0.5 ? "Passed" : "Failed";

  // // Determine the value to submit
  // const finalAcreageValue = acreageValue > 0.5 ? "> .5" : "< .5";

  // checks.push({
  //   id: "ACRES",
  //   value: finalAcreageValue, // Use the modified value
  //   eligibilityCheck: acreagePassed,
  // });

  // ACRES: Must be <= 0.5
  const acreageValue = propertyData?.acreage
    ? parseFloat(propertyData.acreage)
    : "";
  console.log("ACRES Value:", acreageValue);
  console.log("Type of ACRES Value:", typeof acreageValue);

  // If acreageValue is an empty string, we'll use that; otherwise, evaluate the eligibility.
  if (acreageValue === "") {
    checks.push({
      id: "ACRES",
      value: "", // Blank string since no value was provided
      eligibilityCheck: "Ignored", // or you could choose "Failed" if that fits your logic
    });
  } else {
    const acreagePassed = acreageValue <= 0.333 ? "Passed" : "Failed";
    const finalAcreageValue =
      acreageValue > 0.333 ? "> 1/3 acre" : "< 1/3 acre";
    checks.push({
      id: "ACRES",
      value: finalAcreageValue,
      eligibilityCheck: acreagePassed,
    });
  }

  // const squareFootagePassed =
  //   propertyData.squareFootage >= 1200 && propertyData.squareFootage <= 3500
  //     ? "Passed"
  //     : "Failed";

  // if (squareFootagePassed === "Failed") allPassed = false;

  // checks.push({
  //   id: "SQUARE_FOOTAGE",
  //   value: propertyData.squareFootage,
  //   eligibilityCheck: squareFootagePassed,
  // });

  // Safely get squareFootage using optional chaining, fallback to ""
  const rawSquareFootage = propertyData?.squareFootage ?? "";
  let squareFootagePassed = "Ignored"; // Default value if no square footage is provided

  if (rawSquareFootage !== "") {
    // If square footage exists, ensure it is treated as a number
    const squareFootage = Number(rawSquareFootage);
    squareFootagePassed =
      squareFootage >= 1200 && squareFootage <= 3200 ? "Passed" : "Failed";
  }

  // Push the check, using an empty string if there's no square footage
  checks.push({
    id: "SQUARE_FOOTAGE",
    value: rawSquareFootage, // Will be a number or "" if null
    eligibilityCheck: squareFootagePassed,
  });

  // MORTGAGE_TYPE: Handle cases where mortgages might be undefined
  // const mortgageTypeValue =
  //   propertyData.mortgages && propertyData.mortgages.length > 0
  //     ? propertyData.mortgages[0].mortgageType
  //     : "";
  const mortgageTypeValue =
    propertyData?.mortgages?.length > 0
      ? propertyData.mortgages[0].mortgageType
      : "";
  const mortgageTypePassed =
    mortgageTypeValue && mortgageTypeValue.trim() !== "" ? "Passed" : "Failed";

  if (mortgageTypePassed === "Failed") {
    allPassed = false;
  }

  checks.push({
    id: "MORTGAGE_TYPE",
    value: mortgageTypeValue,
    eligibilityCheck: mortgageTypePassed,
  });

  // MORTGAGE_INTEREST_RATE: Handle undefined mortgages
  // const rateVal =
  //   propertyData.mortgages && propertyData.mortgages.length > 0
  //     ? parseFloat(propertyData.mortgages[0].interestRate) || 0
  //     : 0; // Default to 0 if mortgages is undefined
  // const ratePassed = rateVal > 0 && rateVal <= 4.25 ? "Passed" : "Failed";

  // if (ratePassed === "Failed") allPassed = false;

  // checks.push({
  //   id: "MORTGAGE_INTEREST_RATE",
  //   value:
  //     propertyData.mortgages && propertyData.mortgages.length > 0
  //       ? propertyData.mortgages[0].interestRate
  //       : "",
  //   eligibilityCheck: ratePassed,
  // });

  // const rateVal =
  //   propertyData.mortgages && propertyData.mortgages.length > 0
  //     ? parseFloat(propertyData.mortgages[0].interestRate) || 0
  //     : 0; // Default to 0 if mortgages is undefined
  const rateVal =
    propertyData?.mortgages?.length > 0
      ? parseFloat(propertyData.mortgages[0].interestRate) || 0
      : 0;

  const ratePassed = rateVal > 0 && rateVal <= 4 ? "Passed" : "Failed";

  if (ratePassed === "Failed") allPassed = false;

  // Ensure value has "%" appended
  const formattedRate =
    propertyData.mortgages && propertyData.mortgages.length > 0
      ? `${parseFloat(propertyData.mortgages[0].interestRate).toFixed(2)}%`
      : "";

  checks.push({
    id: "MORTGAGE_INTEREST_RATE",
    value: formattedRate, // Ensuring a formatted value with "%"
    eligibilityCheck: ratePassed,
  });

  // MORTGAGE_LOAN_TYPE: Handle undefined mortgages
  const loanTypeValue =
    propertyData.mortgages && propertyData.mortgages.length > 0
      ? propertyData.mortgages[0]?.loanType || "Unknown"
      : "Unknown"; // Default to "Unknown"
  const loanTypePassed =
    loanTypeValue.toUpperCase() !== "ARM" ? "Passed" : "Failed";

  if (loanTypePassed === "Failed") {
    allPassed = false;
  }

  checks.push({
    id: "MORTGAGE_LOAN_TYPE",
    value: loanTypeValue,
    eligibilityCheck: loanTypePassed,
  });

  // MORTGAGE_TERM: Handle undefined mortgages
  const termValue =
    propertyData.mortgages && propertyData.mortgages.length > 0
      ? parseInt(propertyData.mortgages[0].term) || 0
      : 0; // Default to 0
  const termPassed = termValue === 30 ? "Passed" : "Failed";

  if (termPassed === "Failed") allPassed = false;

  checks.push({
    id: "MORTGAGE_TERM",
    value: termPassed === "Passed" ? `${termValue} years` : `${termValue}`,
    eligibilityCheck: termPassed,
  });

  // ESTIMATED_VALUE: Handle undefined valueEstimates
  const estimate =
    propertyData.valueEstimates && propertyData.valueEstimates.length > 0
      ? parseInt(propertyData.valueEstimates[0].estimate, 10) || 0
      : 0; // Default to 0
  const estimatePassed = estimate < 500000 ? "Passed" : "Failed";
  if (estimatePassed === "Failed") allPassed = false;

  // Format the estimate with commas for thousands separators
  const formattedEstimate = estimate.toLocaleString("en-US");

  checks.push({
    id: "ESTIMATED_VALUE",
    value: formattedEstimate, // Use the formatted value here
    eligibilityCheck: estimatePassed,
  });

  return { allPassed, homeProfile: checks };
}

// The actual function that sends data to your final "submit" API
async function submitDataToAPI(propertyData, userData) {
  const { allPassed, homeProfile } = validateAndBuildHomeProfile(propertyData);

  // Get struct_address from sessionStorage
  const structAddress = JSON.parse(sessionStorage.getItem("struct_address"));

  // Prioritize structAddress for state, then propertyData, then addressData
  const finalState = structAddress
    ? transformStateToAbbrev(structAddress.components.state)
    : propertyData.state
    ? transformStateToAbbrev(propertyData.state)
    : addressData.state; // Make sure this uses the transformed state if others are not available

  function determineLocationEligibility(data) {
    // Only pass if zip code is preferred - no MSA or State fallback
    if (data && data.isInPreferredZipCode === true) {
      return "Passed";
    }
    return "Failed";
  }

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

  const payload = {
    streetAddress: propertyData.streetAddress, // Still use streetAddress from propertyData if available
    city: structAddress
      ? structAddress.components.city
      : propertyData.city || addressData.city,
    state: finalState, // Use the prioritized state value here
    zipCode: structAddress
      ? structAddress.components.zip
      : propertyData.zipCode || addressData.zipCode,
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
      isInPreferredZipCode:
        propertyData.locationProfile?.isInPreferredZipCode || false,
      isInOperatedMSA: propertyData.locationProfile?.isInOperatedMSA || false,
      isInOperatedState:
        propertyData.locationProfile?.isInOperatedState || false,
      // eligibilityCheck: allPassed ? "Passed" : "Failed",
      eligibilityCheck: determineLocationEligibility(
        propertyData.locationProfile
      ),
    },
    homeProfile,
    utmParams,
  };

  // If any check fails, set isQualified to false and add reasonUnqualified
  if (!allPassed) {
    payload.reasonUnqualified = "FailedFeaturesCheck";
  }

  console.log(
    "Final Payload being sent to the API:",
    JSON.stringify(payload, null, 2)
  );
  // bonus api https://vyki8z4pia.execute-api.us-west-1.amazonaws.com/prod/submitAgentWebsiteLead
  // shane api https://6mkwa74oj8.execute-api.us-east-2.amazonaws.com/submit
  try {
    const response = await fetch(
      "https://vyki8z4pia.execute-api.us-west-1.amazonaws.com/prod/submitAgentWebsiteLead",
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

//////////////////////////////////////////////
// Step 2 (User info) Validation
//////////////////////////////////////////////

function setupUserFormValidation() {
  const submitButton = document.querySelector('[data-alt="submit"]');
  if (!submitButton) return;

  const firstNameInput = document.querySelector('[data-input="first-name"]');
  const lastNameInput = document.querySelector('[data-input="last-name"]');
  const emailInput = document.querySelector('[data-input="email"]');
  const phoneInput = document.querySelector('[data-input="phone"]');
  const brokerageInput = document.querySelector('[data-input="brokerage"]');
  const legalCheckbox = document.querySelector("#legal-checkbox");

  // If any of these don't exist, skip
  if (
    !firstNameInput ||
    !lastNameInput ||
    !emailInput ||
    !phoneInput ||
    !brokerageInput ||
    !legalCheckbox
  ) {
    return;
  }

  // Disable submit initially
  // submitButton.disabled = true;

  // Add listeners
  [
    firstNameInput,
    lastNameInput,
    emailInput,
    phoneInput,
    brokerageInput,
  ].forEach((input) => {
    // Mark them as touched on focus
    input.addEventListener("focus", () => {
      input.dataset.touched = true;
    });
    // Validate on input
    input.addEventListener("input", () => {
      if (input === phoneInput) {
        handlePhoneInputFormat(phoneInput);
      }
      validateInputs();
    });
  });

  // legalCheckbox.addEventListener("change", validateInputs);

  if (legalCheckbox) {
    legalCheckbox.addEventListener("change", () => {
      // Mark the checkbox as touched.
      legalCheckbox.dataset.touched = true;
      // Toggle classes based on its checked state.
      if (legalCheckbox.checked) {
        legalCheckbox.classList.remove("is-invalid");
        legalCheckbox.classList.add("is-valid");
      } else {
        legalCheckbox.classList.remove("is-valid");
        legalCheckbox.classList.add("is-invalid");
      }
      // Then run overall validation
      validateInputs();
    });
  }

  // Restrict phone input to 10 digits max
  phoneInput.addEventListener("keydown", (event) => {
    const numericLength = event.target.value.replace(/\D/g, "").length;
    if (
      numericLength >= 10 &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }
  });

  // Main validation function for Step 2
  function validateInputs() {
    let allValid = true;

    // Check name fields
    [firstNameInput, lastNameInput].forEach((input) => {
      if (!input.value.trim()) {
        markInvalid(input);
        allValid = false;
      } else {
        markValid(input);
      }
    });

    // Validate email
    if (!validateEmail(emailInput.value)) {
      markInvalid(emailInput);
      allValid = false;
    } else {
      markValid(emailInput);
    }

    // Validate phone (10 digits)
    const phoneValue = phoneInput.value.replace(/\D/g, "");
    if (phoneValue.length !== 10) {
      markInvalid(phoneInput);
      allValid = false;
    } else {
      markValid(phoneInput);
    }

    // Validate brokerage
    if (!brokerageInput.value.trim()) {
      markInvalid(brokerageInput);
      allValid = false;
    } else {
      markValid(brokerageInput);
    }

    // Validate checkbox
    if (!legalCheckbox.checked) {
      markInvalid(legalCheckbox);
      allValid = false;
    } else {
      markValid(legalCheckbox);
    }

    // Final toggle of the Submit button
    // if (allValid) {
    //   submitButton.removeAttribute("disabled");
    // } else {
    //   submitButton.setAttribute("disabled", "disabled");
    // }
  }

  function markValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function markInvalid(input) {
    if (input.dataset.touched) {
      input.classList.add("is-invalid");
    }
    input.classList.remove("is-valid");
  }
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // function handlePhoneInputFormat(phoneInputField) {
  //   const numericPhone = phoneInputField.value.replace(/\D/g, "");

  //   if (numericPhone.length > 10) {
  //     phoneInputField.value = formatPhoneNumber(numericPhone.slice(0, 10));
  //   } else if (numericPhone.length === 10) {
  //     phoneInputField.value = formatPhoneNumber(numericPhone);
  //   } else {
  //     phoneInputField.value = numericPhone;
  //   }
  // }

  // function formatPhoneNumber(phone) {
  //   const cleaned = phone.replace(/\D/g, "");
  //   if (cleaned.length === 10) {
  //     return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
  //       6
  //     )}`;
  //   }
  //   return cleaned;
  // }
}
// Global definitions for phone formatting:
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return cleaned;
}

function handlePhoneInputFormat(phoneInputField) {
  const numericPhone = phoneInputField.value.replace(/\D/g, "");

  if (numericPhone.length > 10) {
    phoneInputField.value = formatPhoneNumber(numericPhone.slice(0, 10));
  } else if (numericPhone.length === 10) {
    phoneInputField.value = formatPhoneNumber(numericPhone);
  } else {
    phoneInputField.value = numericPhone;
  }
}
// Test comment
