"use client";
import React, { useState, useEffect } from "react";
import InfoButton from "@/components/InfoButton";
import { toast } from "react-toastify";
import Link from "next/link";

const ScheduleForm = ({ SaveSchedule, ToggleFlexibleSuggestions, ChangeHourOffsetFromGreece, id, oldStartingHour, oldEndingHour, oldSuggestionsStatus, oldOffset }) => {
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

  return (
    <div className="w-full max-w-[400px] border border-gray-300 p-4 rounded flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-gray-500 text-sm">Συμπλήρωσε Ώρα Ελλάδος:</div>
        <div className="flex gap-2 items-center">
          <input value={startingHour} onChange={(e) => setStartingHour(e.target.value)} type="number" placeholder="Starting" className="input rounded" />
          <input value={endingHour} onChange={(e) => setEndingHour(e.target.value)} type="number" placeholder="Ending" className="input rounded" />
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <div>
            Τρέχουσες Ώρες Ελλάδος: {oldStartingHour}:00 - {oldEndingHour}:00
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
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input value={offset} onChange={(e) => setOffset(e.target.value)} type="number" placeholder="Offset" className="input rounded" />
        </div>
        <div className="text-sm text-gray-500 flex items-center justify-between">
          <div>
            Διαφορά Ωρών με Ελλάδα: {oldOffset} ώρ{oldOffset === 1 || oldOffset === -1 ? "α" : "ες"}
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
