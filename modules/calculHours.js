function calculHours(planning, rates) {

  // Initialization of the total to 0
  let totalMinutes = 0;

  // For each slot in rates
  rates.forEach(rate => {
    // Initialization of the slot counter to 0
    let slotCount = 0;

    // Iterate through each day in planning
    Object.keys(planning).forEach(day => {
      // Check if the slot is present and non-empty for this day (either nameChild or nameAesh)
      if (
        planning[day][rate.slot] &&
        (planning[day][rate.slot].nameChild || planning[day][rate.slot].nameAesh)
      ) {
        // Increment the slot counter
        slotCount++;
      }
    });

    // Add the total duration for this slot to the total
    totalMinutes +=
      slotCount *
      (Number(rate.duration.split(':')[0]) * 60 + Number(rate.duration.split(':')[1]));
  });

  // Convert the total to hours and minutes
  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;

  // Return the result in the format HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export { calculHours };