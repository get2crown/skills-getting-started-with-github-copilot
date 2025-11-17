document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        const participantsHTML = details.participants.length
          ? `<div class="participants-list">
                ${details.participants.map(email => `
                  <span class="participant-item">
                    <span class="participant-email">${email}</span>
                    <span class="delete-icon" title="Remove" data-activity="${name}" data-email="${email}">&#128465;</span>
                  </span>`).join("")}
             </div>`
          : `<p style="color:#6b7280;">No participants yet.</p>`;
      // Add event listeners for delete icons
      document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
          const activity = icon.getAttribute('data-activity');
          const email = icon.getAttribute('data-email');
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
              method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || 'Participant removed.';
              messageDiv.className = 'success';
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || 'Failed to remove participant.';
              messageDiv.className = 'error';
            }
            messageDiv.classList.remove('hidden');
            setTimeout(() => {
              messageDiv.classList.add('hidden');
            }, 5000);
          } catch (error) {
            messageDiv.textContent = 'Error removing participant.';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
            setTimeout(() => {
              messageDiv.classList.add('hidden');
            }, 5000);
          }
        });
      });

        activityCard.innerHTML = `
          <div class="activity-title">${name}</div>
          <div class="activity-description">${details.description}</div>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h4>Participants</h4>
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
