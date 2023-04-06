/**
 * @fileoverview Firebase Cloud Functions to update hours on cellPlanning changes
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Calculate duration between start and end of a timeslot
 * @param {Object} timeObj
 * @param {string} timeslot
 * @return {number} duration in minutes
 */
function calculateDuration(timeObj, timeslot) {
  const start = timeObj[`${timeslot}.Start`];
  const end = timeObj[`${timeslot}.End`];

  const startTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  return (endTime - startTime) / (1000 * 60); // Duration in minutes
}

/**
 * Update hours for children and AESH based on cellPlanning documents
 * @param {string} schoolId
 */
async function updateHours(schoolId) {
  const cellPlanningRef = admin.firestore().collection(`/schools/${schoolId}/cellPlanning`);
  const childrenRef = admin.firestore().collection(`/schools/${schoolId}/children`);
  const aeshRef = admin.firestore().collection(`/schools/${schoolId}/aesh`);
  const schoolRef = admin.firestore().doc(`/schools/${schoolId}`);

  // Fetch timeObj data
  const timeObj = (await schoolRef.get()).data().timeObj;

  // Count hours for each child and AESH
  const cellPlanningSnap = await cellPlanningRef.get();
  const childrenHours = {};
  const aeshHours = {};

  cellPlanningSnap.forEach((doc) => {
    const data = doc.data();
    const {childId, idAesh, timeslot} = data;

    const duration = calculateDuration(timeObj, timeslot);

    if (childrenHours[childId]) {
      childrenHours[childId] += duration;
    } else {
      childrenHours[childId] = duration;
    }

    if (aeshHours[idAesh]) {
      aeshHours[idAesh] += duration;
    } else {
      aeshHours[idAesh] = duration;
    }
  });

  // Update hours for each child
  for (const [childId, minutes] of Object.entries(childrenHours)) {
    const hoursReels = `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
    await childrenRef.doc(childId).update({hoursReels});
  }

  // Update hours for each AESH
  for (const [idAesh, minutes] of Object.entries(aeshHours)) {
    const hoursReels = `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
    await aeshRef.doc(idAesh).update({hoursReels});
  }
}

exports.onCellPlanningChange = functions.firestore
  .document('/schools/{schoolId}/cellPlanning/{docId}')
  .onWrite(async (change, context) => {
    const schoolId = context.params.schoolId;
    await updateHours(schoolId);
  });
