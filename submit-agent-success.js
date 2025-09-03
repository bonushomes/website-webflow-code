// Submit Agent Success Page Handler
// This script runs on the /submit-agent-success page to handle successful agent submissions

(function () {
  "use strict";

  console.log("🚀 submit-agent-success.js loaded");

  // Track Segment event for successful agent submissions
  function trackSegmentEvent() {
    if (typeof analytics !== "undefined") {
      // Get UTM parameters
      const utms = {};
      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_keyword",
        "utm_content",
        "utm_term",
      ].forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          utms[key] = value;
        }
      });

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
          };

          // Use the same robust address handling as other pages
          let finalAddress = "";

          // 1. FIRST PRIORITY: URL parameters (NEW address user is actually on page for)
          const urlParams = new URLSearchParams(window.location.search);
          const addressParam = urlParams.get("address");
          if (addressParam) {
            finalAddress = decodeURIComponent(addressParam);
            console.log("📍 Using URL address parameter:", finalAddress);
          }

          // 2. Fallback to streetAddress from finalBasePayload
          if (!finalAddress && parsed.streetAddress) {
            const components = [];
            if (parsed.streetAddress) components.push(parsed.streetAddress);
            if (parsed.city) components.push(parsed.city);
            if (parsed.state) components.push(parsed.state);
            if (parsed.zipCode) components.push(parsed.zipCode);
            finalAddress = components.join(", ");
            console.log("📍 Using finalBasePayload address:", finalAddress);
          }

          // 3. Fallback to struct_address from sessionStorage
          if (!finalAddress) {
            const structAddress = sessionStorage.getItem("struct_address");
            if (structAddress) {
              try {
                const parsedStruct = JSON.parse(structAddress);
                if (parsedStruct.formattedAddress) {
                  finalAddress = parsedStruct.formattedAddress;
                  console.log("📍 Using struct_address:", finalAddress);
                }
              } catch (e) {
                console.warn("Failed to parse struct_address:", e);
              }
            }
          }

          // 4. Fallback to saved_address from sessionStorage
          if (!finalAddress) {
            const savedAddress = sessionStorage.getItem("saved_address");
            if (savedAddress) {
              finalAddress = savedAddress;
              console.log("📍 Using saved_address:", finalAddress);
            }
          }

          // This page is only for agents
          const formType = "agent";
          const source = ""; // Agent forms don't have discovery source
          const brokerage = parsed.contactInfo?.brokerage || ""; // Fixed: use 'brokerage' not 'agentBrokerage'

          // Debug: Log what we're actually reading
          console.log("🔍 DEBUG - userData:", userData);
          console.log("🔍 DEBUG - parsed.contactInfo:", parsed.contactInfo);

          const segmentData = {
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            source: source,
            brokerage: brokerage,
            home_address: finalAddress,
            form_type: formType,
            page_url: window.location.href,
            ...utms,
            event_id: "lead-" + Date.now(),
          };

          // Only send on production domains
          if (
            window.location.hostname === "bonushomes.com" ||
            window.location.hostname === "www.bonushomes.com"
          ) {
            console.log(
              "✅ Sending Lead Submitted to Segment for Agent Success:",
              segmentData
            );
            analytics.track("Lead Submitted", segmentData);
          }
        } catch (e) {
          console.warn(
            "Failed to parse finalBasePayload for Segment tracking:",
            e
          );
        }
      } else {
        console.warn("No finalBasePayload found for Segment tracking");
      }
    } else {
      console.warn("⚠️ Segment analytics not available");
    }
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      trackSegmentEvent();
    });
  } else {
    trackSegmentEvent();
  }

  // Debug function
  window.checkAgentSuccessData = function () {
    console.log("=== Agent Success Debug Info ===");
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
  };
})();
