/**
 * Booking Widget - Embeddable calendar booking script
 * Insert via: <script src="https://book.scottmagnacca.com/widget.js"></script>
 *            <div id="scott-booking-widget" data-type="discovery" data-source="salesforlife"></div>
 */

(function () {
  const WIDGET_HOST = 'https://book.scottmagnacca.com';
  const AVAILABILITY_ENDPOINT = `${WIDGET_HOST}/api/availability`;
  const BOOKING_ENDPOINT = `${WIDGET_HOST}/api/book`;

  // Find widget containers
  const containers = document.querySelectorAll('[id^="scott-booking-widget"]');

  containers.forEach((container) => {
    initializeWidget(container);
  });

  function initializeWidget(container) {
    const meetingType = container.dataset.type || '30'; // 15 or 30
    const theme = container.dataset.theme || 'light'; // light or dark
    const source = container.dataset.source || 'direct';

    // Detect visitor timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create widget DOM
    const widget = document.createElement('div');
    widget.className = `booking-widget booking-widget--${theme}`;
    widget.innerHTML = `
      <div class="booking-widget__header">
        <h3>Book a Meeting</h3>
        <p>${meetingType}-minute call with Scott</p>
      </div>

      <div class="booking-widget__content">
        <div class="booking-widget__step" id="step-slots">
          <label>Select a Time</label>
          <div class="booking-widget__loading">
            <div class="spinner"></div> Loading available times...
          </div>
          <div class="booking-widget__slots" id="slots-container"></div>
        </div>

        <div class="booking-widget__step hidden" id="step-details">
          <label>Your Details</label>
          <input
            type="text"
            id="visitor-name"
            placeholder="Full Name"
            class="booking-widget__input"
          />
          <input
            type="email"
            id="visitor-email"
            placeholder="Email Address"
            class="booking-widget__input"
          />
          <div class="booking-widget__selected-slot" id="selected-slot-display"></div>
          <button id="confirm-booking" class="booking-widget__button">Confirm Booking</button>
          <button id="back-to-slots" class="booking-widget__button booking-widget__button--secondary">Back</button>
        </div>

        <div class="booking-widget__step hidden" id="step-confirmation">
          <div class="booking-widget__success">
            <div class="checkmark">✓</div>
            <h4>Meeting Confirmed!</h4>
            <p id="confirmation-message"></p>
            <p class="booking-widget__small">Check your email for details and calendar invite.</p>
          </div>
        </div>
      </div>
    `;

    // Inject CSS
    injectStyles(theme);

    // Append to container
    container.appendChild(widget);

    // Bind event listeners
    let selectedSlot = null;

    // Fetch available slots
    fetchAvailableSlots(timezone, meetingType).then((slots) => {
      renderSlots(slots, (slot) => {
        selectedSlot = slot;
        showStep('step-details');
        document.getElementById('selected-slot-display').textContent =
          `Selected: ${new Date(slot.isoTime).toLocaleString()}`;
      });
    });

    // Back button
    document.getElementById('back-to-slots')?.addEventListener('click', () => {
      showStep('step-slots');
      selectedSlot = null;
    });

    // Confirm booking
    document.getElementById('confirm-booking')?.addEventListener('click', async () => {
      const name = document.getElementById('visitor-name').value;
      const email = document.getElementById('visitor-email').value;

      if (!name || !email) {
        alert('Please enter your name and email.');
        return;
      }

      if (!selectedSlot) {
        alert('Please select a time slot.');
        return;
      }

      // Calculate end time
      const startTime = new Date(selectedSlot.isoTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(meetingType));

      const bookingData = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        visitorName: name,
        visitorEmail: email,
        meetingType,
        source,
        timezone,
      };

      try {
        document.getElementById('confirm-booking').disabled = true;
        const response = await fetch(BOOKING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById('confirmation-message').innerHTML =
            `Your meeting is confirmed for <strong>${startTime.toLocaleString()}</strong>.<br/>A confirmation email has been sent to ${email}.`;
          showStep('step-confirmation');
        } else {
          alert('Failed to create booking. Please try again.');
          document.getElementById('confirm-booking').disabled = false;
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Error creating booking. Please try again.');
        document.getElementById('confirm-booking').disabled = false;
      }
    });

    function showStep(stepId) {
      widget.querySelectorAll('.booking-widget__step').forEach((step) => {
        step.classList.add('hidden');
      });
      document.getElementById(stepId)?.classList.remove('hidden');
    }
  }

  async function fetchAvailableSlots(timezone, meetingType) {
    try {
      const response = await fetch(
        `${AVAILABILITY_ENDPOINT}?timezone=${encodeURIComponent(timezone)}&meetingType=${meetingType}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching slots:', error);
      return { slots: [] };
    }
  }

  function renderSlots(data, onSelectSlot) {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';

    if (!data.slots || data.slots.length === 0) {
      container.innerHTML = '<p class="booking-widget__error">No availability. Please try again later.</p>';
      return;
    }

    const slotsByDate = {};
    data.slots.forEach((slot) => {
      if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
      slotsByDate[slot.date].push(slot);
    });

    Object.entries(slotsByDate).forEach(([date, slots]) => {
      const dateGroup = document.createElement('div');
      dateGroup.className = 'booking-widget__date-group';

      const dateLabel = document.createElement('div');
      dateLabel.className = 'booking-widget__date-label';
      dateLabel.textContent = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      dateGroup.appendChild(dateLabel);

      const timesContainer = document.createElement('div');
      timesContainer.className = 'booking-widget__times';

      slots.forEach((slot) => {
        const button = document.createElement('button');
        button.className = 'booking-widget__time-slot';
        button.textContent = slot.time;
        button.addEventListener('click', () => onSelectSlot(slot));
        timesContainer.appendChild(button);
      });

      dateGroup.appendChild(timesContainer);
      container.appendChild(dateGroup);
    });

    // Remove loading state
    document.querySelector('.booking-widget__loading')?.remove();
  }

  function injectStyles(theme) {
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const borderColor = isDark ? '#333333' : '#dddddd';
    const accentColor = '#f5a623';
    const hoverColor = isDark ? '#2a2a2a' : '#f9f9f9';

    const styles = `
      .booking-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 12px;
        padding: 24px;
        max-width: 480px;
        margin: 0 auto;
        color: ${textColor};
      }

      .booking-widget--dark {
        background: ${bgColor};
        color: ${textColor};
      }

      .booking-widget__header {
        text-align: center;
        margin-bottom: 24px;
      }

      .booking-widget__header h3 {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
      }

      .booking-widget__header p {
        margin: 0;
        font-size: 14px;
        opacity: 0.7;
      }

      .booking-widget__content {
        min-height: 300px;
      }

      .booking-widget__step {
        animation: fadeIn 0.3s ease-in;
      }

      .booking-widget__step.hidden {
        display: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .booking-widget__loading {
        text-align: center;
        padding: 40px 20px;
        opacity: 0.6;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid ${borderColor};
        border-top-color: ${accentColor};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .booking-widget__slots {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .booking-widget__date-group {
        border-bottom: 1px solid ${borderColor};
        padding-bottom: 16px;
      }

      .booking-widget__date-group:last-child {
        border-bottom: none;
      }

      .booking-widget__date-label {
        font-size: 12px;
        font-weight: 600;
        color: ${accentColor};
        margin-bottom: 8px;
        text-transform: uppercase;
      }

      .booking-widget__times {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .booking-widget__time-slot {
        padding: 8px 12px;
        font-size: 13px;
        background: ${hoverColor};
        border: 1px solid ${borderColor};
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .booking-widget__time-slot:hover {
        border-color: ${accentColor};
        background: ${accentColor};
        color: ${bgColor};
      }

      .booking-widget__input {
        width: 100%;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid ${borderColor};
        border-radius: 6px;
        font-size: 14px;
        background: ${bgColor};
        color: ${textColor};
        box-sizing: border-box;
      }

      .booking-widget__input:focus {
        outline: none;
        border-color: ${accentColor};
        box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
      }

      .booking-widget__selected-slot {
        padding: 12px;
        background: ${hoverColor};
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 13px;
        text-align: center;
        opacity: 0.8;
      }

      .booking-widget__button {
        width: 100%;
        padding: 12px;
        background: ${accentColor};
        color: ${bgColor};
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .booking-widget__button:hover {
        background: #e08800;
        transform: translateY(-2px);
      }

      .booking-widget__button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .booking-widget__button--secondary {
        background: ${hoverColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        margin-top: 8px;
      }

      .booking-widget__button--secondary:hover {
        background: ${borderColor};
      }

      .booking-widget__success {
        text-align: center;
        padding: 40px 20px;
      }

      .booking-widget__success .checkmark {
        width: 60px;
        height: 60px;
        background: ${accentColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: ${bgColor};
        margin: 0 auto 20px;
      }

      .booking-widget__success h4 {
        margin: 0 0 8px;
        font-size: 18px;
      }

      .booking-widget__success p {
        margin: 0 0 12px;
        font-size: 14px;
      }

      .booking-widget__small {
        opacity: 0.7;
        font-size: 12px !important;
      }

      .booking-widget__error {
        text-align: center;
        padding: 20px;
        color: #e74c3c;
      }

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 12px;
        text-transform: uppercase;
      }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
})();
