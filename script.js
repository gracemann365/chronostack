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
            <td>${i / 2 + 1}</td>
            <td>${loginTime}</td>
            <td>${logoutTime}</td>
            <td>${workedDisplay}</td>
        `;
    tableBody.appendChild(row);
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
  return Math.floor((logoutDate - loginDate) / (1000 * 60)); // Difference in minutes
}

// Helper function to pad numbers with leading zeros
function pad(number) {
  return number.toString().padStart(2, "0");
}

// New function to calculate range total
document
  .getElementById("calculate-range-btn")
  .addEventListener("click", function () {
    const startSession =
      parseInt(document.getElementById("start-session").value) || 0;
    const endSession =
      parseInt(document.getElementById("end-session").value) || 0;

    if (
      startSession < 1 ||
      endSession < 1 ||
      startSession > sessionData.length ||
      endSession > sessionData.length ||
      startSession > endSession
    ) {
      alert("Please enter a valid session range!");
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

// Example function to add breaks
function addBreak(duration) {
  const breaksTableBody = document
    .getElementById("breaks-table")
    .getElementsByTagName("tbody")[0];
  const row = breaksTableBody.insertRow();

  const breakCell = row.insertCell(0);
  const durationCell = row.insertCell(1);

  breakCell.innerText = `Break ${breaksTableBody.rows.length}`;
  durationCell.innerText = duration;

  // Optionally: Assign a random background color to each break row
  const colors = ["#e9ecef", "#d1e7dd", "#cfe2f3", "#ffeeba"];
  row.style.backgroundColor =
    colors[breaksTableBody.rows.length % colors.length];
}

// Example usage:
// addBreak("00:30"); // Call this function with the break duration when needed
