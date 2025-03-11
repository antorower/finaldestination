"use client";
import React, { useState, useEffect } from "react";
import InfoButton from "@/components/InfoButton";
import { toast } from "react-toastify";

const ScheduleForm = ({ SaveSchedule, ToggleFlexibleSuggestions, ChangeTimePreference, ChangeModePreference, timePref, modePref, ChangeHourOffsetFromGreece, id, oldStartingHour, oldEndingHour, oldSuggestionsStatus, oldOffset, mode }) => {
  const [startingHour, setStartingHour] = useState("");
  const [endingHour, setEndingHour] = useState("");
  const [flexibleSuggestions, setFlexibleSuggestions] = useState(oldSuggestionsStatus || false);
  const [offset, setOffset] = useState("");

  useEffect(() => {
    if (oldStartingHour) setStartingHour(oldStartingHour);
    if (oldEndingHour) setEndingHour(oldEndingHour);
    if (oldSuggestionsStatus !== null && oldSuggestionsStatus !== undefined) setFlexibleSuggestions(oldSuggestionsStatus);
    if (oldOffset || oldOffset === 0) setOffset(oldOffset);
  }, [oldStartingHour, oldEndingHour, oldSuggestionsStatus, oldOffset]);

  if (mode !== "tradingsettings") return null;
  const SaveHours = async () => {
    const response = await SaveSchedule({ id, startingHour, endingHour });
    if (response.error) toast.error(response.message);
  };

  const Toggle = async () => {
    const response = await ToggleFlexibleSuggestions({ id, status: !oldSuggestionsStatus });
    if (response.error) toast.error(response.message);
  };

  const ChangeOffset = async () => {
    const response = await ChangeHourOffsetFromGreece({ id, offset });
    if (response.error) toast.error(response.message);
  };

  const ChangeTime = async (preference) => {
    const response = await ChangeTimePreference({ id, preference });
    if (response.error) toast.error(response.message);
  };

  const ChangeMode = async (preference) => {
    const response = await ChangeModePreference({ id, preference });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="w-full max-w-[400px] border border-gray-300 p-4 rounded flex flex-col gap-4 m-auto">
      <div className="flex flex-col gap-2">
        <div className="text-gray-500 text-sm">Συμπλήρωσε Ώρα Ελλάδος:</div>
        <div className="flex gap-2 items-center">
          <input value={startingHour} onChange={(e) => setStartingHour(e.target.value)} type="number" placeholder="Starting" className="input rounded" />
          <input value={endingHour} onChange={(e) => setEndingHour(e.target.value)} type="number" placeholder="Ending" className="input rounded" />
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <div>
            <div>
              Τρέχουσες Ώρες Ελλάδος: {oldStartingHour}:00 - {oldEndingHour}:00
            </div>
            {oldOffset !== 0 && (
              <div>
                Τρέχουσες Τοπικές Ώρες: {oldStartingHour + oldOffset}:00 - {oldEndingHour + oldOffset}:00
              </div>
            )}
          </div>
          <InfoButton classes="text-sm" message="Όσες περισσότερες ώρες δηλώσεις διαθέσιμες, τόσο πιο εύκολα θα σου βρίσκει trades ο αλγοριθμος, άρα τόσο πιο γρήγορα θα προχωράς, άρα τόσο περισσότερα θα βγάζεις." />
        </div>
        <button onClick={SaveHours} className="w-full bg-blue-500 p-2 rounded text-white font-bold text-center">
          ✔
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <button onClick={Toggle} className="text-xs">
              {flexibleSuggestions === true ? "🔵" : "🔴"}
            </button>
            <div className="text-gray-500">Flexible Suggestions</div>
          </div>
          <InfoButton classes="text-sm" message="Αν ενεργοποιήσεις αυτήν την επιλογή ο αλγόριθμος θα σου δίνει και suggestions για trades εκτός των δηλωμένων ωρών. Θα μπορείς να τα απορρίψεις χωρίς καμία συνέπεια. Κάνε το στρογγυλό κουμπί στα αριστερά μπλε πατώντας το για ενεργοποίηση του Flexible Suggestions." />
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex items-center gap-2">
            <button onClick={() => ChangeTime("Early Hours")} className="text-xs">
              {timePref === "Early Hours" ? "🔵" : "🔴"}
            </button>
            <div className="text-gray-500">Early</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => ChangeTime("Late Hours")} className="text-xs">
              {timePref === "Late Hours" ? "🔵" : "🔴"}
            </button>
            <div className="text-gray-500">Late</div>
          </div>
          <div className="flex justify-end">
            <InfoButton
              classes="text-sm"
              message="Μπορείς να επιλέξεις αν προτιμάς τις πρώτες ώρες του προγράμματος σου ή τις τελευταίες. Αν επί παραδείγματι έχεις ωράριο 6:00 - 8:00 και διαλέξεις το Early τότε ο αλγόριθμος θα προτιμάει να σε βάζει κοντά στις 6:00 αν αυτό είναι δυνατό, αντιστρόφως για το late. Αυτό βοηθάει σε περίπτωση που μπορείς μεν να βάλεις κάποιες ώρες αν χρειαστεί αλλά δεν θέλεις να γίνεται συνέχεια. Σε κάθε περίπτωση αυτή η ρύθμιση είναι μια προτίμση και δεν δεσμεύει τον αλγόριθμο ο οποίος αντιλαμβάνεται το σύνολο του ωραρίου σου ως διαθέσιμο."
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => ChangeMode("Βoundaries")} className="text-xs">
              {modePref === "Βoundaries" ? "🔵" : "🔴"}
            </button>
            <div className="text-gray-500">Βoundaries</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => ChangeMode("Condescending")} className="text-xs">
              {modePref === "Condescending" ? "🔵" : "🔴"}
            </button>
            <div className="text-gray-500">Condescending</div>
          </div>
          <div className="flex justify-end">
            <InfoButton
              classes="text-sm"
              message="Μπορείς να επιλέξεις αν προτιμάς τα δύο άκρα του ωραρίου σου ή τις μεσαίες ώρες. Αν επί παραδείγματι το ωράριο σου είναι 6:00 - 8:00 τότε επιλέγοντας Boundaries ενημερώνεις τον αλγόριθμο ότι θέλεις αν μπορεί να προτιμάει τις ώρες κοντά στις 6:00 ή κοντά στις 8:00. Αν επιλέξεις Condescending τον ενημερώνεις ότι προτιμάς τις ώρες στα μέσα του ωραρίου σου, γύρω στις 7:00 στο παράδειγμα μας. Αυτό δεν είναι δεσμευτικό, όμως ο αλγόριθμος προσπαθεί να σε βολέψει όσο περισσότερο γίνεται και όποτε μπορεί θα το κάνει."
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input value={offset} onChange={(e) => setOffset(e.target.value)} type="number" placeholder="Offset" className="input rounded" />
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <div>
            Διαφορά Ώρας με Ελλάδα: {oldOffset} ώρ{oldOffset === 1 || oldOffset === -1 ? "α" : "ες"}
          </div>
          <InfoButton classes="text-sm" message="Εδώ μπορείς να βάλεις πόσες ώρες διαφορά έχει η χώρα σου με την Ελλάδα. Έτσι, στην σελίδα θα βλέπεις τα πάντα σε ώρες της χώρας σου και όχι σε ώρες Ελλάδος. Αν η τιμή είναι 0 τότε θα βλέπεις ώρες Ελλάδος." />
        </div>
        <button onClick={ChangeOffset} className="w-full bg-blue-500 p-2 rounded text-white font-bold text-center">
          ✔
        </button>
      </div>
    </div>
  );
};

export default ScheduleForm;
