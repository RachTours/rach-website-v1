class PhoneInput {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`Container not found: ${containerSelector}`);
      return;
    }

    this.options = {
      defaultCountry: "MA", // Morocco
      placeholder: "Enter your phone number",
      ...options,
    };

    this.countries = window.countryData || [];
    this.selectedCountry =
      this.countries.find((c) => c.code === this.options.defaultCountry) ||
      this.countries[0];

    this.isOpen = false;
    this.value = ""; // Raw numeric value
    this.activeIndex = -1; // For keyboard navigation

    this.render();
    this.attachListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="phone-input-container" role="group" aria-labelledby="phone-input-label">
        <div class="phone-input-wrapper">
          <!-- Country Selector -->
          <div class="country-selector" id="country-selector">
            <button type="button" 
                    class="selected-country" 
                    aria-haspopup="listbox" 
                    aria-expanded="false" 
                    aria-label="Select Country (${this.selectedCountry.name} ${
      this.selectedCountry.dial_code
    })">
              <span class="flag-emoji">${this.selectedCountry.flag}</span>
              <span class="dial-code">${this.selectedCountry.dial_code}</span>
            </button>
            
            <!-- Dropdown -->
            <div class="country-dropdown" id="country-dropdown-list" role="listbox">
              <div class="dropdown-search">
                <input type="text" 
                       placeholder="Search country..." 
                       id="country-search" 
                       role="searchbox" 
                       aria-label="Search countries">
              </div>
              <ul class="country-list" id="country-list">
                <!-- Items populated by JS -->
              </ul>
            </div>
          </div>

          <!-- Phone Input -->
          <div class="phone-field-wrapper">
            <input 
              type="tel" 
              id="phone-input-field" 
              placeholder="${
                this.selectedCountry.placeholder || this.options.placeholder
              }"
              autocomplete="tel"
              aria-label="Phone Number"
              aria-required="true"
              required
            >
            <div class="validation-message" aria-live="polite">Please enter a valid phone number.</div>
          </div>
          <input type="hidden" id="phone" name="phone" required>
        </div>
      </div>
    `;

    this.renderCountries(this.countries);
  }



  renderCountries(list) {
    const listEl = this.container.querySelector("#country-list");
    listEl.innerHTML = "";

    if (list.length === 0) {
      listEl.innerHTML =
        '<li class="country-option disabled" role="option" aria-disabled="true">No results found</li>';
      return;
    }

    list.forEach((country, index) => {
      const li = document.createElement("li");
      li.className = "country-option";
      if (country.code === this.selectedCountry.code)
        li.classList.add("active");

      li.setAttribute("role", "option");
      li.setAttribute(
        "aria-selected",
        country.code === this.selectedCountry.code
      );
      li.dataset.code = country.code;
      li.dataset.index = index;

      li.innerHTML = `
        <span class="flag-emoji">${country.flag}</span>
        <span class="country-name">${country.name}</span>
        <span class="country-dial-code">${country.dial_code}</span>
        ${
          country.code === this.selectedCountry.code
            ? '<i class="fas fa-check check-icon"></i>'
            : ""
        }
      `;

      li.addEventListener("click", () => this.selectCountry(country.code));
      listEl.appendChild(li);
    });
  }

  attachListeners() {
    const selector = this.container.querySelector(".selected-country");
    const searchInput = this.container.querySelector("#country-search");
    const phoneInput = this.container.querySelector("#phone-input-field");

    selector.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleDropdown();
    });

    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) this.closeDropdown();
    });

    searchInput.addEventListener("input", (e) =>
      this.filterCountries(e.target.value)
    );

    // Keyboard Navigation for Search and Selection
    searchInput.addEventListener("keydown", (e) => {
      const items = Array.from(
        this.container.querySelectorAll(".country-option:not(.disabled)")
      );
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % items.length;
        this.highlightItem(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + items.length) % items.length;
        this.highlightItem(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.activeIndex >= 0 && items[this.activeIndex]) {
          this.selectCountry(items[this.activeIndex].dataset.code);
        }
      } else if (e.key === "Escape") {
        this.closeDropdown();
      }
    });

    phoneInput.addEventListener("input", (e) => this.handlePhoneInput(e));

    // Support for form reset
    const form = this.container.closest("form");
    if (form) {
      form.addEventListener("reset", () => setTimeout(() => this.reset(), 0));
    }
  }

  filterCountries(query) {
    const q = query.toLowerCase();
    const filtered = this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial_code.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
    this.renderCountries(filtered);
    this.activeIndex = -1;
  }

  highlightItem(items) {
    items.forEach((item, i) => {
      item.classList.toggle("highlight", i === this.activeIndex);
      if (i === this.activeIndex) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  handlePhoneInput(e) {
    const input = e.target;
    let raw = input.value.replace(/\D/g, "");

    // Automatically strip redundant country codes if pasted
    if (this.selectedCountry) {
        let bareDialCode = this.selectedCountry.dial_code.replace(/\D/g, ""); // e.g. "212"
        let fullLocalCode = input.value; // The exact string they pasted

        // Check if the pasted string effectively starts with the country code +212, 00212, or just 212
        let startsWithPlusCode = fullLocalCode.startsWith(this.selectedCountry.dial_code);
        let startsWithZeroZeroCode = fullLocalCode.startsWith("00" + bareDialCode);
        let startsWithBareCode = fullLocalCode.startsWith(bareDialCode);

        if (startsWithPlusCode || startsWithZeroZeroCode || startsWithBareCode) {
           // We remove it from 'raw', which is just the digits
           if (raw.startsWith(bareDialCode)) {
               raw = raw.substring(bareDialCode.length);
           } else if (raw.startsWith("00" + bareDialCode)) {
               raw = raw.substring(bareDialCode.length + 2);
           }
        }
    }

    // Auto-formatting based on country pattern
    const formatted = this.formatNumber(raw, this.selectedCountry.format);

    input.value = formatted;
    this.value = raw;
    this.validate();
    this.emitChange();
  }

  formatNumber(digits, pattern) {
    if (!pattern || pattern === "###############") return digits;

    let formatted = "";
    let digitIdx = 0;

    for (let i = 0; i < pattern.length && digitIdx < digits.length; i++) {
      if (pattern[i] === "#") {
        formatted += digits[digitIdx++];
      } else {
        formatted += pattern[i];
      }
    }

    // Append remaining digits if any (overflow)
    if (digitIdx < digits.length) {
      formatted += digits.slice(digitIdx);
    }

    return formatted;
  }

  selectCountry(code) {
    const country = this.countries.find((c) => c.code === code);
    if (!country) return;

    this.selectedCountry = country;
    const selector = this.container.querySelector(".selected-country");
    selector.innerHTML = `
      <span class="flag-emoji">${country.flag}</span>
      <span class="dial-code">${country.dial_code}</span>
      <span class="arrow"><i class="fas fa-chevron-down"></i></span>
    `;
    selector.setAttribute(
      "aria-label",
      `Select Country (${country.name} ${country.dial_code})`
    );

    const phoneField = this.container.querySelector("#phone-input-field");
    phoneField.placeholder = country.placeholder;

    // Re-format existing value with new country pattern
    phoneField.value = this.formatNumber(this.value, country.format);

    this.closeDropdown();
    this.renderCountries(this.countries);
    this.validate();
    this.emitChange();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    const dropdown = this.container.querySelector(".country-dropdown");
    const selector = this.container.querySelector(".selected-country");
    const countrySelector = this.container.querySelector(".country-selector");

    dropdown.classList.toggle("show", this.isOpen);
    selector.setAttribute("aria-expanded", this.isOpen);

    // Add/remove 'open' class for z-index boost
    if (this.isOpen) {
      countrySelector.classList.add("open");
      this.container.querySelector("#country-search").focus();
      this.activeIndex = -1;
    } else {
      countrySelector.classList.remove("open");
    }
  }

  closeDropdown() {
    this.isOpen = false;
    const countrySelector = this.container.querySelector(".country-selector");
    this.container.querySelector(".country-dropdown").classList.remove("show");
    this.container
      .querySelector(".selected-country")
      .setAttribute("aria-expanded", "false");
    countrySelector.classList.remove("open");
  }

  validate() {
    const input = this.container.querySelector("#phone-input-field");
    const pattern = this.selectedCountry.format;
    const requiredLength = (pattern.match(/#/g) || []).length;

    // Fallback validation if no pattern
    const isValid =
      requiredLength > 0
        ? this.value.length === requiredLength
        : this.value.length >= 8 && this.value.length <= 15;

    if (this.value.length > 0) {
      input.classList.toggle("valid", isValid);
      input.classList.toggle("invalid", !isValid);
    } else {
      input.classList.remove("valid", "invalid");
    }

    return isValid;
  }

  reset() {
    this.value = "";
    this.selectedCountry =
      this.countries.find((c) => c.code === this.options.defaultCountry) ||
      this.countries[0];
    this.render();
    this.attachListeners();
    this.updateHiddenInput();
  }

  updateHiddenInput() {
    const hidden = this.container.querySelector("#phone");
    if (hidden) hidden.value = this.getFullNumber();
  }

  getFullNumber() {
    return this.value ? `${this.selectedCountry.dial_code}${this.value}` : "";
  }

  getData() {
    return {
      country: this.selectedCountry,
      number: this.value,
      fullNumber: this.getFullNumber(),
      isValid: this.validate(),
    };
  }

  emitChange() {
    this.updateHiddenInput();
    const event = new CustomEvent("phone-change", { detail: this.getData() });
    this.container.dispatchEvent(event);
  }
}

window.PhoneInput = PhoneInput;
