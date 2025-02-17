//// homepage JS start
console.log("homepage.js loaded");
//// hero tab change js

document.addEventListener("DOMContentLoaded", function () {
  (function () {
    if (window.tabSwitcherInitialized) return;
    window.tabSwitcherInitialized = true;

    const homeTrigger = document.querySelector('[data-tag="home-tab"]');
    const agentTrigger = document.querySelector('[data-tag="agent-tab"]');
    const homeContent = {
      heading: document.querySelector('[data-tag="home-heading"]'),
      paragraph: document.querySelector('[data-tag="home-p"]'),
    };
    const agentContent = {
      heading: document.querySelector('[data-tag="agent-heading"]'),
      paragraph: document.querySelector('[data-tag="agent-p"]'),
    };

    if (!document.querySelector("#tab-switcher-styles")) {
      const style = document.createElement("style");
      style.id = "tab-switcher-styles";
      style.textContent = `
            /* Base styles with transition */
            [data-tag="home-heading"],
            [data-tag="agent-heading"],
            [data-tag="home-p"],
            [data-tag="agent-p"] {
                transition: opacity 500ms ease-in-out !important;
                opacity: 0 !important;
            }

            /* Active state */
            .text-show {
                opacity: 1 !important;
            }
        `;
      document.head.appendChild(style);
    }

    function updateContent() {
      const isHomeActive = homeTrigger.classList.contains("w--current");

      // Ensure only home content is visible when Home is active
      [homeContent.heading, homeContent.paragraph].forEach((element) => {
        if (element) {
          element.classList.toggle("text-show", isHomeActive);
          element.classList.toggle("text-hide", !isHomeActive);
        }
      });

      // Ensure only agent content is visible when Agent is active
      [agentContent.heading, agentContent.paragraph].forEach((element) => {
        if (element) {
          element.classList.toggle("text-show", !isHomeActive);
          element.classList.toggle("text-hide", isHomeActive);
        }
      });
    }

    updateContent();

    homeTrigger.addEventListener("click", () => {
      homeTrigger.classList.add("w--current");
      agentTrigger.classList.remove("w--current");
      updateContent();
    });

    agentTrigger.addEventListener("click", () => {
      agentTrigger.classList.add("w--current");
      homeTrigger.classList.remove("w--current");
      updateContent();
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateContent();
        }
      });
    });

    observer.observe(homeTrigger, { attributes: true });
    observer.observe(agentTrigger, { attributes: true });
  })();
});

///// end hero tab JS

//// this is the calculator js

// document.addEventListener("DOMContentLoaded", function () {
//   function restrictNumericInput(event) {
//     const allowedKeys = [
//       "Backspace",
//       "ArrowLeft",
//       "ArrowRight",
//       "Delete",
//       "Tab",
//     ];
//     const regex = /^[0-9.,$]*$/;

//     if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
//       event.preventDefault();
//     }
//   }

//   function formatCurrencyInput(inputElement) {
//     let value = inputElement.value.replace(/[^0-9.]/g, "");
//     if (value) {
//       value = parseFloat(value).toLocaleString("en-US", {
//         style: "currency",
//         currency: "USD",
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       });
//     }
//     inputElement.value = value;
//   }

//   const homeValueInput = document.querySelector('[data-tag="homeValue"]');
//   const remainingBalanceInput = document.querySelector(
//     '[data-tag="remainingBalance"]'
//   );

//   homeValueInput.addEventListener("keydown", restrictNumericInput);
//   remainingBalanceInput.addEventListener("keydown", restrictNumericInput);

//   homeValueInput.addEventListener("input", () =>
//     formatCurrencyInput(homeValueInput)
//   );
//   remainingBalanceInput.addEventListener("input", () =>
//     formatCurrencyInput(remainingBalanceInput)
//   );

//   const calculateButton = document.querySelector('[data-tag="calculate"]');
//   let isResetMode = false;

//   calculateButton.addEventListener("click", function () {
//     if (isResetMode) {
//       homeValueInput.value = "";
//       remainingBalanceInput.value = "";
//       calculateButton.innerText = "Calculate";
//       isResetMode = false;
//     } else {
//       if (calculateAndDisplayResults()) {
//         calculateButton.innerText = "Reset";
//         isResetMode = true;
//       }
//     }
//   });

//   function calculateAndDisplayResults() {
//     function parseCurrency(value) {
//       return parseFloat(value.replace(/[^0-9.-]+/g, ""));
//     }

//     function formatNumberWithCommas(value) {
//       return value.toLocaleString("en-US", {
//         style: "currency",
//         currency: "USD",
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       });
//     }

//     const homeValue = parseCurrency(homeValueInput.value);
//     const remainingBalance = parseCurrency(remainingBalanceInput.value);

//     if (isNaN(homeValue) || isNaN(remainingBalance)) {
//       alert("Please enter valid numbers for all inputs.");
//       return false;
//     }

//     const grossCashProceedsToday = homeValue - remainingBalance;
//     document.querySelector('[data-tag="grossCashProceedsToday"]').innerText =
//       formatNumberWithCommas(Math.round(grossCashProceedsToday));

//     const futureHomeValue = homeValue * Math.pow(1.05, years);
//     const totalFutureGains = futureHomeValue - homeValue;
//     const adjustedFutureGains = totalFutureGains * 0.35; // Calculate 35% of future gains
//     document.querySelector(
//       '[data-tag="futureGains"]'
//     ).innerText = `${formatNumberWithCommas(Math.round(adjustedFutureGains))}`;

//     // Calculate total proceeds using the adjusted future gains
//     const totalProceeds = adjustedFutureGains + grossCashProceedsToday;
//     document.querySelector('[data-tag="totalProceeds"]').innerText =
//       formatNumberWithCommas(Math.round(totalProceeds));

//     return true;
//   }

//   const sliderPoints = Array.from(
//     document.querySelectorAll(".calculator_slider_point")
//   );
//   const draggable = document.querySelector('[data="icon"]');
//   const yearsDisplay = document.querySelector('[data-tag="years-display"]');
//   let years = 10;

//   gsap.set(draggable, { x: sliderPoints[1].offsetLeft });

//   yearsDisplay.innerText = `${years} years`;

//   gsap.registerPlugin(Draggable);
//   Draggable.create(draggable, {
//     type: "x",
//     bounds: ".calculator_slider_line",
//     onDragEnd: function () {
//       let closestPoint = null;
//       let minDistance = Infinity;

//       sliderPoints.forEach((point, index) => {
//         const distance = Math.abs(point.offsetLeft - this.x);
//         if (distance < minDistance) {
//           minDistance = distance;
//           closestPoint = point;
//           years = (index + 1) * 5;
//         }
//       });

//       gsap.to(draggable, { x: closestPoint.offsetLeft, duration: 0.2 });

//       yearsDisplay.innerText = `${years} years`;

//       calculateAndDisplayResults();
//     },
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  function restrictNumericInput(event) {
    const allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Tab",
    ];
    const regex = /^[0-9.,$]*$/;

    if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  function formatCurrencyInput(inputElement) {
    let value = inputElement.value.replace(/[^0-9.]/g, "");
    if (value) {
      value = parseFloat(value).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    inputElement.value = value;
  }

  const homeValueInput = document.querySelector('[data-tag="homeValue"]');
  const remainingBalanceInput = document.querySelector(
    '[data-tag="remainingBalance"]'
  );

  homeValueInput.addEventListener("keydown", restrictNumericInput);
  remainingBalanceInput.addEventListener("keydown", restrictNumericInput);

  homeValueInput.addEventListener("input", () =>
    formatCurrencyInput(homeValueInput)
  );
  remainingBalanceInput.addEventListener("input", () =>
    formatCurrencyInput(remainingBalanceInput)
  );

  const calculateButton = document.querySelector('[data-tag="calculate"]');
  let isResetMode = false;

  calculateButton.addEventListener("click", function () {
    if (isResetMode) {
      homeValueInput.value = "";
      remainingBalanceInput.value = "";
      calculateButton.innerText = "Calculate";
      isResetMode = false;
    } else {
      if (calculateAndDisplayResults()) {
        calculateButton.innerText = "Reset";
        isResetMode = true;
      }
    }
  });

  function calculateAndDisplayResults() {
    function parseCurrency(value) {
      return parseFloat(value.replace(/[^0-9.-]+/g, ""));
    }

    function formatNumberWithCommas(value) {
      return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    const homeValue = parseCurrency(homeValueInput.value);
    const remainingBalance = parseCurrency(remainingBalanceInput.value);

    if (isNaN(homeValue) || isNaN(remainingBalance)) {
      alert("Please enter valid numbers for all inputs.");
      return false;
    }

    const grossCashProceedsToday = homeValue - remainingBalance;
    document.querySelector('[data-tag="grossCashProceedsToday"]').innerText =
      formatNumberWithCommas(Math.round(grossCashProceedsToday));

    const futureHomeValue = homeValue * Math.pow(1.05, years);
    const totalFutureGains = futureHomeValue - homeValue;
    const adjustedFutureGains = totalFutureGains * 0.35; // Calculate 35% of future gains
    document.querySelector(
      '[data-tag="futureGains"]'
    ).innerText = `${formatNumberWithCommas(
      Math.round(adjustedFutureGains)
    )} (35% of ${formatNumberWithCommas(Math.round(totalFutureGains))})`;

    // Calculate total proceeds using the adjusted future gains
    const totalProceeds = adjustedFutureGains + grossCashProceedsToday;
    document.querySelector('[data-tag="totalProceeds"]').innerText =
      formatNumberWithCommas(Math.round(totalProceeds));

    return true;
  }

  const sliderPoints = Array.from(
    document.querySelectorAll(".calculator_slider_point")
  );
  const draggable = document.querySelector('[data="icon"]');
  const yearsDisplay = document.querySelector('[data-tag="years-display"]');
  let years = 10;

  gsap.set(draggable, { x: sliderPoints[1].offsetLeft });

  yearsDisplay.innerText = `${years} years`;

  gsap.registerPlugin(Draggable);
  Draggable.create(draggable, {
    type: "x",
    bounds: ".calculator_slider_line",
    onDragEnd: function () {
      let closestPoint = null;
      let minDistance = Infinity;

      sliderPoints.forEach((point, index) => {
        const distance = Math.abs(point.offsetLeft - this.x);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
          years = (index + 1) * 5;
        }
      });

      gsap.to(draggable, { x: closestPoint.offsetLeft, duration: 0.2 });

      yearsDisplay.innerText = `${years} years`;

      calculateAndDisplayResults();
    },
  });
});

//// end homepage js
