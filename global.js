console.log("global js loaded");

// UTM Capture and Storage (runs on every page load)
function saveUtmsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_keyword",
    "utm_content",
    "utm_term",
  ];

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      sessionStorage.setItem(key, value);
    }
  });
}

// Initialize UTM capture immediately
saveUtmsFromUrl();

// function validateUserInput(event) {
//   const inputElement = event.target;
//   const value = inputElement.value.trim();

//   let isValid = true;

//   // For text and other inputs, check if the value is empty
//   if (value === "") {
//     alert("This field cannot be empty!");
//     inputElement.focus();
//     isValid = false;
//   }

//   // For select inputs, check if a valid option is selected
//   else if (
//     inputElement.tagName === "SELECT" &&
//     (inputElement.value === "" ||
//       inputElement.value == "Select One..." ||
//       inputElement.value == "Select one...")
//   ) {
//     alert("Please select an option!");
//     inputElement.focus();
//     isValid = false;
//   }

//   // Toggle validity classes based on isValid value
//   if (isValid) {
//     inputElement.classList.add("is-valid");
//     inputElement.classList.remove("is-invalid");
//   } else {
//     inputElement.classList.add("is-invalid");
//     inputElement.classList.remove("is-valid");
//   }

//   return isValid;
// }

function initAutocomplete() {
  // Select all inputs with data-input="address"
  const addressInputs = document.querySelectorAll('[data-input="address"]');
  console.log(
    `Initializing autocomplete for ${addressInputs.length} address input(s).`,
    addressInputs
  );

  // Select all validation button containers
  const validationButtonContainers = document.querySelectorAll(
    ".validation-button-container"
  );

  /**
   * Ensures that common unit designators are preceded by a comma.
   * @param {string} address - The address string to format.
   * @returns {string} - The formatted address with commas inserted where necessary.
   */
  function ensureCommaBeforeUnit(address) {
    return address.replace(
      /([^,])\s+(Unit|Apt|Apartment|Suite|Ste|#)\b/gi,
      "$1, $2"
    );
  }

  // Attach click event listeners to each validation button container
  validationButtonContainers.forEach((container) => {
    container.addEventListener("click", (event) => {
      const button = container.querySelector(
        '[data-trigger="address-validation"]'
      );
      if (!button) return;

      if (button.disabled) {
        event.preventDefault();
        showPopUp();
      } else {
        console.log("Validation button clicked and enabled:", button);
      }
    });
  });

  // // Attach click event listeners to each validation button container
  // validationButtonContainers.forEach((container) => {
  //   container.addEventListener("click", (event) => {
  //     const button = container.querySelector(
  //       '[data-trigger="address-validation"]'
  //     );
  //     if (!button) return;

  //     // Find the address input associated with this container.
  //     // (Adjust this selector as needed if your markup structure is different.)
  //     const parentContainer = container.closest("[data-tag]");
  //     const addressInput = parentContainer
  //       ? parentContainer.querySelector('[data-input="address"]')
  //       : null;

  //     if (!addressInput) {
  //       console.error("Address input not found in the container.");
  //       return;
  //     }

  //     // Check if the user has selected an address from the dropdown
  //     if (addressInput.dataset.selected !== "true") {
  //       event.preventDefault();
  //       alert("Please select an address from the dropdown suggestions.");
  //       addressInput.focus();
  //       return;
  //     }

  //     // If the button is disabled (for example, to prevent multiple submissions), show a pop-up.
  //     if (button.disabled) {
  //       event.preventDefault();
  //       showPopUp();
  //     } else {
  //       console.log("Validation button clicked and enabled:", button);
  //     }
  //   });
  // });

  const autocompleteService = new google.maps.places.AutocompleteService();

  addressInputs.forEach((addressInput, index) => {
    addressInput.dataset.selected = "false";
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ["address"],
    });

    const container = validationButtonContainers[index];
    const validationButton = container?.querySelector(
      '[data-trigger="address-validation"]'
    );

    let currentPredictions = [];

    // Disable the button initially
    if (validationButton) {
      validationButton.disabled = true;
    }

    // ======= 2) On each input keystroke, disable the button, format address, & fetch predictions =======
    addressInput.addEventListener("input", () => {
      addressInput.dataset.selected = "false";
      if (validationButton) validationButton.disabled = true;

      let typedVal = addressInput.value.trim();

      if (!typedVal) {
        currentPredictions = [];
        return;
      }

      // Insert comma before unit if missing
      const formattedVal = ensureCommaBeforeUnit(typedVal);
      if (formattedVal !== typedVal) {
        addressInput.value = formattedVal;
        typedVal = formattedVal;
      }

      autocompleteService.getPlacePredictions(
        { input: typedVal, types: ["address"] },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            // Save the actual suggestions (the string a user would see in the dropdown)
            currentPredictions = predictions.map((p) => p.description);
          } else {
            currentPredictions = [];
          }
        }
      );
    });

    // ======= 3) On place_changed, parse the selected address & enable the button =======
    autocomplete.addListener("place_changed", () => {
      addressInput.dataset.selected = "true";
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.place_id) {
        console.warn("User did not select an official suggestion; ignoring.");
        return;
      }

      let streetNumber = "";
      let street = "";
      let city = "";
      let state = "";
      let zip = "";
      let unit = "";

      console.log("Address components received:", place.address_components);

      // // Extract address components
      // place.address_components.forEach((component) => {
      //   const types = component.types;
      //   const value = component.long_name;

      //   if (types.includes("street_number")) {
      //     streetNumber = value;
      //   }
      //   if (types.includes("route")) {
      //     street = value;
      //   }
      //   if (types.includes("locality")) {
      //     city = value;
      //   }
      //   if (types.includes("administrative_area_level_1")) {
      //     state = value;
      //   }
      //   if (types.includes("postal_code")) {
      //     zip = value;
      //   }
      //   if (types.includes("subpremise")) {
      //     unit = value;
      //   }
      // });

      // Declare a variable to hold the township (or county) value.
      let township = "";

      // Extract address components
      place.address_components.forEach((component) => {
        const types = component.types;
        const value = component.long_name;

        if (types.includes("street_number")) {
          streetNumber = value;
        }
        if (types.includes("route")) {
          street = value;
        }
        // New: extract township (often returned as administrative_area_level_2)
        if (types.includes("administrative_area_level_2")) {
          township = value;
        }
        if (types.includes("locality")) {
          city = value;
        }
        if (types.includes("administrative_area_level_1")) {
          state = value;
        }
        if (types.includes("postal_code")) {
          zip = value;
        }
        if (types.includes("subpremise")) {
          unit = value;
        }
      });

      // Attempt to parse unit from the typed string if subpremise not found
      if (!unit) {
        const addressInputValue = addressInput.value;
        const unitMatch = addressInputValue.match(
          /(?:unit|apt|suite)\s*#?\s*(\w+)/i
        );
        if (unitMatch) {
          unit = unitMatch[1];
        }
      }

      // // Format the address
      // let formattedAddress = "";
      // if (unit) {
      //   formattedAddress = `${streetNumber} ${street} ${unit}, ${city}, ${state} ${zip}`;
      // } else {
      //   formattedAddress = `${streetNumber} ${street}, ${city}, ${state} ${zip}`;
      // }

      // // Format the address and include township if available.
      // let formattedAddress = "";
      // if (unit) {
      //   formattedAddress = `${streetNumber} ${street} ${unit}, ${
      //     township ? township + ", " : ""
      //   }${city}, ${state} ${zip}`;
      // } else {
      //   formattedAddress = `${streetNumber} ${street}, ${
      //     township ? township + ", " : ""
      //   }${city}, ${state} ${zip}`;
      // }

      // Determine if township should be included (only include if city is missing)
      let townshipPart = "";
      if (!city && township) {
        townshipPart = township + ", ";
      }

      // Format the address and include township only if city is missing.
      // let formattedAddress = "";
      // if (unit) {
      //   formattedAddress = `${streetNumber} ${street} ${unit}, ${townshipPart}${city}, ${state} ${zip}`;
      // } else {
      //   formattedAddress = `${streetNumber} ${street}, ${townshipPart}${city}, ${state} ${zip}`;
      // }

      let formattedAddress = "";
      if (unit) {
        formattedAddress = `${streetNumber} ${street} ${unit}, `;
      } else {
        formattedAddress = `${streetNumber} ${street}, `;
      }

      // Conditionally append city or township (if city is missing) and then state & zip.
      if (city && city.trim()) {
        // City is available: use it.
        formattedAddress += `${city}, ${state} ${zip}`;
      } else if (township && township.trim()) {
        // City is missing but township is available: use township.
        formattedAddress += `${township}, ${state} ${zip}`;
      } else {
        // Neither city nor township: just state & zip.
        formattedAddress += `${state} ${zip}`;
      }

      console.log(`Formatted address: ${formattedAddress}`);

      // Update the input field
      addressInput.value = formattedAddress;

      // Log structured data
      const addressData = {
        fullAddress: place.formatted_address,
        formattedAddress: formattedAddress,
        components: {
          streetNumber,
          street,
          unit,
          city,
          state,
          zip,
        },
      };
      console.log("Structured address data:", addressData);
      sessionStorage.setItem("struct_address", JSON.stringify(addressData));
      // Mark the input as valid
      addressInput.classList.add("is-valid");
      addressInput.classList.remove("is-invalid");
      // Enable button because user definitely chose from the dropdown
      if (validationButton) {
        validationButton.disabled = false;
        console.log(
          `Enabled validation button for input ${index + 1}:`,
          validationButton
        );
      }
    });
  });
}

function validateUserInput(event) {
  const inputElement = event.target;
  const value = inputElement.value.trim();

  let isValid = true;

  // For text and other inputs, check if the value is empty
  if (value === "") {
    alert("This field cannot be empty!");
    inputElement.focus();
    isValid = false;
  }

  // For select inputs, check if a valid option is selected
  else if (
    inputElement.tagName === "SELECT" &&
    (inputElement.value === "" ||
      inputElement.value == "Select One..." ||
      inputElement.value == "Select one...")
  ) {
    alert("Please select an option!");
    inputElement.focus();
    isValid = false;
  }

  // Toggle validity classes based on isValid value
  if (isValid) {
    inputElement.classList.add("is-valid");
    inputElement.classList.remove("is-invalid");
  } else {
    inputElement.classList.add("is-invalid");
    inputElement.classList.remove("is-valid");
  }

  return isValid;
}

// document.addEventListener("click", function (event) {
//   const clickedElement = event.target;

//   const submitElement = clickedElement.closest("[data-submit]");
//   if (!submitElement) return;

//   const submitType = submitElement.getAttribute("data-submit");

//   const parentContainer = clickedElement.closest(
//     '[data-tag="home-page-input"]'
//   );
//   if (!parentContainer) return;

//   // Only proceed if data-submit is exactly "homeowner" or "agent"
//   if (submitType !== "homeowner" && submitType !== "agent") return;

//   let addressInput;
//   let alertMessage = "Please enter an address";
//   let addressValue;

//   if (submitType === "homeowner") {
//     addressInput = parentContainer.querySelector("#address-h");
//     console.log("Homeowner address input", addressInput);

//     if (!addressInput || !addressInput.value.trim()) {
//       alert(alertMessage);
//       return;
//     }

//     addressValue = encodeURIComponent(addressInput.value.trim());
//     window.location.href = `/form?loading=true&address=${addressValue}`;
//   } else if (submitType === "agent") {
//     addressInput = parentContainer.querySelector("#address-a");
//     console.log("Agent address input", addressInput);

//     if (!addressInput || !addressInput.value.trim()) {
//       alert(alertMessage);
//       return;
//     }

//     addressValue = encodeURIComponent(addressInput.value.trim());
//     window.location.href = `/form-agent?address=${addressValue}`;
//   }
// });

document.addEventListener("click", function (event) {
  const clickedElement = event.target;

  // Support both new and old attributes:
  // - new: [data-cta="address-submit"] (should be on a button/link, NOT the input)
  // - old: [data-submit="home-address"]
  const ctaElement = clickedElement.closest('[data-cta="address-submit"]');
  const submitElement = clickedElement.closest("[data-submit]");

  // If the attribute was mistakenly placed on the address input itself,
  // ignore clicks so users can type without being blocked.
  if (
    ctaElement &&
    (ctaElement.matches("input, textarea") ||
      ctaElement.hasAttribute("data-input"))
  ) {
    return;
  }

  if (!ctaElement && !submitElement) return;

  const submitType = submitElement
    ? submitElement.getAttribute("data-submit")
    : "home-address";

  const parentContainer = clickedElement.closest("[data-tag]");

  if (!parentContainer) return;

  // NEW: Handle the simplified form structure
  // Check if this is the new single address form
  if (submitType === "home-address") {
    const addressInput = parentContainer.querySelector(
      '[data-input="address"]'
    );

    // Log an error if the address input is not found
    if (!addressInput) {
      console.error(
        "Address input not found within the container:",
        parentContainer
      );
      return;
    }

    if (addressInput.dataset.selected !== "true") {
      alert("Please select an address from the dropdown suggestions.");
      addressInput.focus();
      return;
    }

    const addressValue = encodeURIComponent(addressInput.value.trim());
    const redirectUrl = `/form?address=${addressValue}`;
    window.location.href = redirectUrl;
    return;
  }

  // Legacy support for old homeowner/agent structure
  if (submitType === "homeowner") {
    // Try both old (#address-h) and new ([data-input="address"]) selectors
    const addressInput =
      parentContainer.querySelector("#address-h") ||
      parentContainer.querySelector('[data-input="address"]');
    console.log("Homeowner address input", addressInput);

    if (!addressInput || !addressInput.value.trim()) {
      alert("Please enter an address");
      return;
    }

    if (addressInput.dataset.selected !== "true") {
      alert("Please select an address from the dropdown suggestions.");
      addressInput.focus();
      return;
    }

    const addressValue = encodeURIComponent(addressInput.value.trim());
    window.location.href = `/form?loading=true&address=${addressValue}`;
  } else if (submitType === "agent") {
    // Try both old (#address-a) and new ([data-input="address"]) selectors
    const addressInput =
      parentContainer.querySelector("#address-a") ||
      parentContainer.querySelector('[data-input="address"]');
    console.log("Agent address input", addressInput);

    if (!addressInput || !addressInput.value.trim()) {
      alert("Please enter an address");
      return;
    }

    if (addressInput.dataset.selected !== "true") {
      alert("Please select an address from the dropdown suggestions.");
      addressInput.focus();
      return;
    }

    const addressValue = encodeURIComponent(addressInput.value.trim());
    window.location.href = `/form-agent?address=${addressValue}`;
  }
});
