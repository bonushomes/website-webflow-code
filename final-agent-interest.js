// Store validation state in an object
const validationState = {
  "first-name": false,
  "last-name": false,
  email: false,
  phone: false,
  brokerage: false,
};

function formatPhoneNumber(phone) {
  const numericPhone = phone.replace(/\D/g, ""); // Remove non-numeric characters
  if (numericPhone.length >= 10) {
    const formattedPhone = `(${numericPhone.slice(0, 3)}) ${numericPhone.slice(
      3,
      6
    )}-${numericPhone.slice(6, 10)}`;
    return formattedPhone;
  }
  return phone;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateInput(input) {
  const type = input.dataset.input;

  // // Special handling for checkboxes:
  if (input.type === "checkbox") {
    if (input.checked) {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      validationState[type] = true;
    } else {
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");
      validationState[type] = false;
    }
    return validationState[type];
  }

  const value = input.value.trim();

  if (value === "") {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    validationState[type] = false;
    return false;
  }

  switch (type) {
    case "first-name":
    case "last-name":
    case "brokerage":
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      validationState[type] = true;
      break;
    case "email":
      if (validateEmail(value)) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        validationState[type] = true;
      } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        validationState[type] = false;
      }
      break;
    case "phone":
      const formattedPhone = formatPhoneNumber(value);
      input.value = formattedPhone;
      if (formattedPhone.length === 14) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        validationState[type] = true;
      } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        validationState[type] = false;
      }
      break;
  }

  return validationState[type];
}

// Validate all inputs on submit
function isValidForm() {
  console.log(
    "Checking form validity. Current validation state:",
    validationState
  );
  const isValid = Object.values(validationState).every((isValid) => isValid);
  console.log("Form validity result:", isValid);
  return isValid;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.querySelector(
    '[data-alt="submit-agent-interest"]'
  );
  const form = document.getElementById("agent-lead-form");
  const communicationConsent = document.querySelector("#legal-checkbox");

  if (!submitButton) {
    console.error("Submit button not found");
    return;
  }

  // Add event listeners to all inputs
  document.querySelectorAll("[data-input]").forEach((input) => {
    input.addEventListener("input", () => validateInput(input));
    input.addEventListener("blur", () => validateInput(input));
  });

  // Add this event listener to restrict input to numbers only
  const phoneInput = document.querySelector('[data-input="phone"]');
  phoneInput.addEventListener("keydown", function (e) {
    // Allow only number keys, backspace, (, ), -, and space.
    if (
      e.key.length === 1 &&
      !/\d/.test(e.key) &&
      e.key !== "(" &&
      e.key !== ")" &&
      e.key !== "-" &&
      e.key !== " "
    ) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener("input", function (e) {
    // Format the phone number immediately.
    const formattedPhone = formatPhoneNumber(e.target.value);
    e.target.value = formattedPhone;
  });

  // Modify submit button click handler
  submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Submit button clicked");

    // Re-validate all inputs on submit
    form.querySelectorAll("[data-input]").forEach(validateInput);

    if (!communicationConsent.checked) {
      console.log("Communication consent not checked");
      // showInvalidInputs();
      return;
    }

    // Check form validity and communication consent together
    if (isValidForm() && communicationConsent.checked) {
      console.log("Form is valid and consent is checked, preparing to submit");

      // Form data (make sure it's correct)
      const formData = {
        firstName: form.querySelector('[data-input="first-name"]').value,
        lastName: form.querySelector('[data-input="last-name"]').value,
        email: form.querySelector('[data-input="email"]').value,
        phone: form
          .querySelector('[data-input="phone"]')
          .value.replace(/\D/g, ""),
        brokerage: form.querySelector('[data-input="brokerage"]').value,
        communicationConsent: communicationConsent.checked,
      };

      console.log("Form data:", formData);

      submitDataToAPI(formData)
        .then((res) => {
          console.log("Lead submitted successfully:", res);
          if (
            res &&
            res.data &&
            res.data.submitWebsiteAgent &&
            res.data.submitWebsiteAgent.success
          ) {
            const queryParams = new URLSearchParams({
              success: res.data.submitWebsiteAgent.success,
              contactId: res.data.submitWebsiteAgent.contactId,
            });
            const redirectUrl = `/submit-home-submitted?${queryParams.toString()}`;
            window.location.href = redirectUrl;
          } else {
            console.error(
              "Submission successful but response format invalid:",
              res
            );
            alert(
              "There was an issue processing your request. Please try again later."
            );
          }
        })
        .catch((err) => {
          console.log("Error submitting lead:", err);
          alert(
            "There was an error submitting the form. Please try again later."
          );
        });
    } else {
      // showInvalidInputs();
    }
  });
});

async function submitDataToAPI(payload) {
  try {
    console.log(
      "Final Payload being sent to the API:",
      JSON.stringify(payload, null, 2)
    );

    console.log("Starting API submission...");
    // this removes 'hide' class to show the loader
    document.querySelector('[data-tag="loader"]').classList.remove("hide");

    const response = await fetch(
      "https://22m6ratjqi.execute-api.us-west-1.amazonaws.com/prod/submitAgentInterest",
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
  } finally {
    document.querySelector('[data-tag="loader"]').classList.add("hide");
  }
}
