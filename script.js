const sessionData = [];

document.getElementById("calculate-btn").addEventListener("click", function () {
  const input = document.getElementById("input-times").value.trim();
  if (!input) {
    alert("Please enter login and logout times!");
    return;
  }

  // Use regex to match valid time formats and extract them
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

    const workedMinutes = calculateWorkedMinutes(loginTime, logoutTime);
    totalWorkedMinutes += workedMinutes;

    // Store session data
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
});

// Function to calculate the difference in minutes between two times
function calculateWorkedMinutes(loginTime, logoutTime) {
  const loginDate = new Date(`01/01/2000 ${loginTime}`);
  const logoutDate = new Date(`01/01/2000 ${logoutTime}`);
  return Math.floor((logoutDate - loginDate) / 60000); // Convert milliseconds to minutes
}

// Function to calculate break duration between two times
function calculateBreakDuration(logoutTime, nextLoginTime) {
  const logoutDate = new Date(`01/01/2000 ${logoutTime}`);
  const nextLoginDate = new Date(`01/01/2000 ${nextLoginTime}`);
  return Math.floor((nextLoginDate - logoutDate) / 60000); // Convert milliseconds to minutes
}

// Function to add leading zeros to single-digit numbers
function pad(num) {
  return String(num).padStart(2, "0");
}

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
