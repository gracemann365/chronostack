// Store session data
const sessionData = [];

// Function to calculate worked minutes between login and logout times
function calculateWorkedMinutes(loginTime, logoutTime) {
  const loginDate = new Date(`1970-01-01T${convertTo24Hour(loginTime)}`);
  const logoutDate = new Date(`1970-01-01T${convertTo24Hour(logoutTime)}`);
  const diffInMillis = logoutDate - loginDate;

  return Math.max(0, Math.floor(diffInMillis / 60000)); // Return 0 minutes if logout is before login
}

// Function to calculate break duration between two times
function calculateBreakDuration(logoutTime, nextLoginTime) {
  const logoutDate = new Date(`1970-01-01T${convertTo24Hour(logoutTime)}`);
  const nextLoginDate = new Date(
    `1970-01-01T${convertTo24Hour(nextLoginTime)}`
  );
  const diffInMillis = nextLoginDate - logoutDate;

  return Math.max(0, Math.floor(diffInMillis / 60000)); // Return 0 minutes if next login is before logout
}

// Function to convert 12-hour time format to 24-hour time format
function convertTo24Hour(time) {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");

  if (hours === "12") {
    hours = "00"; // Change 12 AM to 00
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12; // Convert PM hours to 24-hour format
  }

  return `${pad(hours)}:${minutes}`; // Return in 24-hour format
}

// Function to pad numbers with leading zeros
function pad(num) {
  return num.toString().padStart(2, "0");
}

// Function to update remaining work time display
function updateRemainingTime(totalWorkedMinutes) {
  const totalWorkMinutes = 8 * 60; // 8 hours in minutes
  const remainingMinutes = totalWorkMinutes - totalWorkedMinutes;

  const remainingHours = Math.max(0, Math.floor(remainingMinutes / 60)); // Ensure hours don't go below 0
  const remainingMins = Math.max(0, remainingMinutes % 60); // Ensure minutes don't go below 0

  // Update total left display
  document.getElementById("total-left").innerText = `${pad(
    remainingHours
  )}:${pad(remainingMins)}`;
}

// Event listener for calculate button
document.getElementById("calculate-btn").addEventListener("click", function () {
  const input = document.getElementById("input-times").value.trim();
  if (!input) {
    alert("Please enter login and logout times!");
    return;
  }

  // Extract only time entries from the input
  const timeEntries = input.match(/([01]?[0-9]:[0-5][0-9]\s?(AM|PM))/gi);

  if (!timeEntries || timeEntries.length % 2 !== 0) {
    alert("Each login should have a matching logout!");
    return;
  }

  const tableBody = document.querySelector("#hours-table tbody");
  tableBody.innerHTML = ""; // Clear previous entries

  let totalWorkedMinutes = 0;

  // Process each login/logout pair
  for (let i = 0; i < timeEntries.length; i += 2) {
    const loginTime = timeEntries[i];
    const logoutTime = timeEntries[i + 1];

    // Calculate worked minutes
    const workedMinutes = calculateWorkedMinutes(loginTime, logoutTime);
    totalWorkedMinutes += workedMinutes;

    // Store session data for display
    sessionData.push({ loginTime, logoutTime, workedMinutes });

    // Add row to table
    const workedHours = Math.floor(workedMinutes / 60);
    const workedMins = workedMinutes % 60;
    const workedDisplay = `${pad(workedHours)}:${pad(workedMins)}`;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${Math.floor(i / 2) + 1}</td>
            <td>${loginTime}</td>
            <td>${logoutTime}</td>
            <td>${workedDisplay}</td>
        `;
    tableBody.appendChild(row);

    // Calculate and display the break after each session if it's not the last session
    if (i + 2 < timeEntries.length) {
      const nextLoginTime = timeEntries[i + 2];
      const breakDuration = calculateBreakDuration(logoutTime, nextLoginTime);

      if (breakDuration > 0) {
        const breakHours = Math.floor(breakDuration / 60);
        const breakMins = breakDuration % 60;

        const breakRow = document.createElement("tr");
        breakRow.classList.add("break"); // This adds the break class for styling
        breakRow.innerHTML = `
                <td>Break after Session ${Math.floor(i / 2) + 1}</td>
                <td colspan="2">Break Time</td>
                <td>${pad(breakHours)}:${pad(breakMins)}</td>
            `;
        tableBody.appendChild(breakRow);
      }
    }
  }

  // Display total worked hours
  const totalHours = Math.floor(totalWorkedMinutes / 60);
  const totalMins = totalWorkedMinutes % 60;
  document.getElementById("total-worked").innerText = `${pad(totalHours)}:${pad(
    totalMins
  )}`;

  // Update remaining work time display
  updateRemainingTime(totalWorkedMinutes);
});

// Event listener for range total calculation
document
  .getElementById("calculate-range-btn")
  .addEventListener("click", function () {
    const startSession = parseInt(
      document.getElementById("start-session").value
    );
    const endSession = parseInt(document.getElementById("end-session").value);

    if (
      isNaN(startSession) ||
      isNaN(endSession) ||
      startSession > endSession ||
      startSession < 1 ||
      endSession > sessionData.length
    ) {
      alert("Invalid session range!");
      return;
    }

    let rangeTotalMinutes = 0;

    for (let i = startSession - 1; i < endSession; i++) {
      rangeTotalMinutes += sessionData[i].workedMinutes;
    }

    const rangeTotalHours = Math.floor(rangeTotalMinutes / 60);
    const rangeTotalMins = rangeTotalMinutes % 60;
    document.getElementById("range-total-worked").innerText = `${pad(
      rangeTotalHours
    )}:${pad(rangeTotalMins)}`;
  });
