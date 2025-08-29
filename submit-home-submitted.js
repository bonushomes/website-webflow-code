// Submit Home Submitted Page Handler
// This script runs on the /submit-home-submitted page to display the submitted address

(function () {
  "use strict";

  console.log("🚀 submit-home-submitted.js loaded");

  function updateDisplayAddress() {
    // Try to get address from multiple sources in order of preference
    let address = null;

    // 1. Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get("address");
    if (addressParam) {
      address = decodeURIComponent(addressParam);
      console.log("Address from URL params:", address);
    }

    // 2. Try to get from sessionStorage (struct_address)
    if (!address) {
      const structAddress = sessionStorage.getItem("struct_address");
      if (structAddress) {
        try {
          const parsed = JSON.parse(structAddress);
          if (parsed.formattedAddress) {
            address = parsed.formattedAddress;
            console.log("Address from struct_address:", address);
          }
        } catch (e) {
          console.warn("Failed to parse struct_address:", e);
        }
      }
    }

    // 3. Try to get from saved_address in sessionStorage
    if (!address) {
      const savedAddress = sessionStorage.getItem("saved_address");
      if (savedAddress) {
        address = savedAddress;
        console.log("Address from saved_address:", address);
      }
    }

    // 4. Try to get from finalBasePayload in sessionStorage
    if (!address) {
      const finalBasePayload = sessionStorage.getItem("finalBasePayload");
      if (finalBasePayload) {
        try {
          const parsed = JSON.parse(finalBasePayload);
          if (parsed.streetAddress) {
            // Construct full address from components
            const components = [];
            if (parsed.streetAddress) components.push(parsed.streetAddress);
            if (parsed.city) components.push(parsed.city);
            if (parsed.state) components.push(parsed.state);
            if (parsed.zipCode) components.push(parsed.zipCode);

            address = components.join(", ");
            console.log("Address from finalBasePayload:", address);
          }
        } catch (e) {
          console.warn("Failed to parse finalBasePayload:", e);
        }
      }
    }

    // Update all display-address elements
    if (address) {
      const addressDisplayElements = document.querySelectorAll(
        '[data-tag="display-address"]'
      );
      console.log(
        `Found ${addressDisplayElements.length} display-address elements`
      );

      addressDisplayElements.forEach(function (element) {
        element.textContent = address;
        console.log("Updated display-address element:", element);
      });
    } else {
      console.warn("No address found to display");
    }
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      updateDisplayAddress();
      trackLeadEvent();
    });
  } else {
    updateDisplayAddress();
    trackLeadEvent();
  }

  // Track Facebook Pixel event based on page
  function trackLeadEvent() {
    const currentPath = window.location.pathname;
    const isQualifiedPage = currentPath === "/submit-home-submitted";
    const isUnqualifiedPage = currentPath === "/submit-home-submitted-u";

    console.log("🎯 Tracking Lead event for page:", currentPath);
    console.log("🎯 Is qualified page:", isQualifiedPage);
    console.log("🎯 Is unqualified page:", isUnqualifiedPage);

    if (typeof fbq === "function") {
      // Get data from sessionStorage
      const finalBasePayload = sessionStorage.getItem("finalBasePayload");
      let userData = {};
      let homeData = {};

      if (finalBasePayload) {
        try {
          const parsed = JSON.parse(finalBasePayload);
          userData = {
            email: parsed.contactInfo?.email || "",
            phone: parsed.contactInfo?.phoneNumber || "",
            firstName: parsed.contactInfo?.firstName || "",
            lastName: parsed.contactInfo?.lastName || "",
          };
          homeData = {
            home_address: parsed.streetAddress || "",
            home_type:
              parsed.homeProfile?.find((item) => item.id === "HOME_TYPE")
                ?.value || "",
            interest_rate:
              parsed.homeProfile?.find(
                (item) => item.id === "MORTGAGE_INTEREST_RATE"
              )?.value || "",
            home_value:
              parsed.homeProfile?.find((item) => item.id === "ESTIMATED_VALUE")
                ?.value || "",
          };
        } catch (e) {
          console.warn("Failed to parse finalBasePayload for FB tracking:", e);
        }
      }

      const eventName = isQualifiedPage ? "Qualified Lead" : "Unqualified Lead";
      const formType = isQualifiedPage
        ? "homeowner_qualified"
        : "homeowner_unqualified";
      const qualificationStatus = isQualifiedPage ? "qualified" : "unqualified";

      const fbPayload = {
        action_source: "website",
        event_name: eventName,
        event_time: new Date().toISOString(),
        user_data: {
          email: userData.email,
          phone: userData.phone,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        app_data_field: {
          home_address: homeData.home_address,
          form_type: formType,
          qualification_status: qualificationStatus,
        },
        event_source_url: window.location.href,
      };

      console.log("🎯 FB Lead Payload:", fbPayload);
      fbq("track", eventName, fbPayload);
      console.log("✅ Lead event sent to Facebook Pixel:", eventName);
    } else {
      console.warn("Meta Pixel (fbq) not available for Lead tracking");
    }
  }

  // Debug function
  window.checkSubmittedAddress = function () {
    console.log("=== Address Debug Info ===");
    console.log(
      "URL params:",
      new URLSearchParams(window.location.search).toString()
    );
    console.log("struct_address:", sessionStorage.getItem("struct_address"));
    console.log("saved_address:", sessionStorage.getItem("saved_address"));
    console.log(
      "finalBasePayload:",
      sessionStorage.getItem("finalBasePayload")
    );
    console.log(
      "display-address elements:",
      document.querySelectorAll('[data-tag="display-address"]').length
    );
  };
})();
