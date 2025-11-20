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

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
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

(function () {
  const listEl = document.getElementById('activities-list');
  const tpl = document.getElementById('activity-card-template');
  const selectEl = document.getElementById('activity');
  const signupContainer = document.getElementById('signup-container');

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function makeParticipantItem(email) {
    const li = document.createElement('li');
    li.className = 'participant';
    li.textContent = email;
    return li;
  }

  function renderActivity(name, data) {
    const clone = tpl.content.cloneNode(true);
    clone.querySelector('.activity-title').textContent = name;
    clone.querySelector('.activity-desc').textContent = data.description || '';
    clone.querySelector('.activity-schedule').textContent = data.schedule || '';
    clone.querySelector('.activity-capacity').textContent = `(${(data.participants||[]).length}/${data.max_participants || '—'})`;
    clone.querySelector('.participants-count').textContent = (data.participants || []).length;

    const list = clone.querySelector('.participants-list');
    if (Array.isArray(data.participants) && data.participants.length) {
      data.participants.forEach(p => list.appendChild(makeParticipantItem(p)));
    } else {
      const li = document.createElement('li');
      li.className = 'participants-empty';
      li.textContent = 'No participants yet — be the first!';
      list.appendChild(li);
    }

    const btn = clone.querySelector('.join-btn');
    btn.addEventListener('click', () => {
      // set the select and focus email
      if (selectEl) {
        selectEl.value = name;
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.focus();
        signupContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    listEl.appendChild(clone);
  }

  function populateSelect(activities) {
    if (!selectEl) return;
    // keep the default option, append others
    Object.keys(activities).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    });
  }

  async function load() {
    let activities = {};
    try {
      const res = await fetch('/activities');
      if (res.ok) activities = await res.json();
    } catch (e) {
      // ignore, activities remains empty
    }

    clearChildren(listEl);
    populateSelect(activities);

    if (!Object.keys(activities).length) {
      const p = document.createElement('p');
      p.className = 'info';
      p.textContent = 'No activities available right now.';
      listEl.appendChild(p);
      return;
    }

    Object.entries(activities).forEach(([name, data]) => renderActivity(name, data));
  }

  document.addEventListener('DOMContentLoaded', load);
})();
