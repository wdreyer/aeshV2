function calculHours(planning, rates) {


  // Initialisation du total à 0
  let totalMinutes = 0;
  
  // Pour chaque slot dans rates
  rates.forEach(rate => {
    // Initialisation du compteur de slots à 0
    let slotCount = 0;
    
    // Parcourir chaque jour dans planning
    Object.keys(planning).forEach(day => {
      // Vérifier si le slot est présent et non vide pour ce jour
      if (planning[day][rate.slot] && planning[day][rate.slot].nameAesh) {
        // Incrémenter le compteur de slots
        slotCount++;
      }
    });
    
    // Ajouter la durée totale pour ce slot au total
    totalMinutes += slotCount * (Number(rate.duration.split(':')[0]) * 60 + Number(rate.duration.split(':')[1]));
  });
  
  // Convertir le total en heures et minutes
  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;
  
  // Retourner le résultat sous forme HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

}

export {calculHours};