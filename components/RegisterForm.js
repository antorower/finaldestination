"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const RegisterForm = ({ RegisterUser, SaveQuestions, register, questions }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [bybitEmail, setBybitEmail] = useState("");
  const [bybitUid, setBybitUid] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [customAnswer, setCustomAnswer] = useState("");

  const router = useRouter();

  const Register = async () => {
    if (!firstName || !lastName || !telephone || !bybitEmail || !bybitUid) {
      toast.warn("Συμπλήρωσε όλα τα πεδία");
      return;
    }

    try {
      const response = await RegisterUser({
        firstName,
        lastName,
        telephone,
        bybitEmail,
        bybitUid,
      });
      if (response) {
        toast.success("Επιτυχής εγγραφή");
        router.refresh();
      } else {
        toast.error("Κάτι πήγε στραβά συνάδελφε, επικοινώνησε με τον Αντώνη");
      }
    } catch (error) {
      toast.error("Κάτι πήγε στραβά, επικοινώνησε με τον Αντώνη");
      console.error("Error: ", error);
    }
  };

  const Save = async () => {
    const response = await SaveQuestions({ answers });
    if (response) {
      toast.success("Οι απαντήσεις αποθηκεύτηκαν");
    } else {
      toast.error("Κάτι πήγε στραβά. Προσπάθησε ξανά.");
    }
  };

  const listOfQuestions = [
    {
      question: "Τα accounts σε αυτό το σημείο είναι πανάκριβα. Γι' αυτό υπάρχει αυτόματο σύστημα αξιολόγησης από την σελίδα ώστε οι χρήστες που κάνουν λάθη ή δεν είναι συνεπείς να διαγράφονται αυτόματα από την σελίδα χωρίς δυνατότητα επαναεισαγωγής τους. Αν συμβεί αυτό, θα πρέπει να παίξουν τα accounts που έχουν σε συνεργασία με την ομάδα και να αποχωρήσουν. Συμφωνείς με ένα τέτοιο σύστημα;",
      answers: [
        "Είναι απαραίτητο για τη σωστή λειτουργία της ομάδας.", // ✅ Υπέρ ξεκάθαρα
        "Συμφωνώ απόλυτα, η συνέπεια είναι το πιο σημαντικό.", // ✅ Υπέρ ξεκάθαρα
        "Είναι λογικό, αρκεί να υπάρχει δίκαιη αξιολόγηση.", // ✅ Υπέρ με αμφιβολία
        "Συμφωνώ, αλλά θα έπρεπε να υπάρχει προειδοποίηση πριν τη διαγραφή.", // ✅ Υπέρ με αμφιβολία
        "Η διαγραφή είναι υπερβολική, ίσως χρειάζεται μια δεύτερη ευκαιρία.", // ❌ Κατά με επιχείρημα
        "Διαφωνώ, γιατί ένα λάθος δεν σημαίνει ότι κάποιος είναι ακατάλληλος.", // ❌ Κατά με επιχείρημα
        "Δεν συμφωνώ καθόλου, είναι πολύ αυστηρό.", // ❌❌ Ξεκάθαρα κατά
        "Απαράδεκτο, κανείς δεν πρέπει να διαγράφεται οριστικά.", // ❌❌ Ξεκάθαρα κατά
      ],
    },
    {
      question: "Αποδέχεσαι ότι αν το αυτόματο σύστημα σε διαγράψει λόγω ασυνέπειας ή λαθών θα παίξεις τα accounts σου με συνεργασία και θα αποχωρήσεις;",
      answers: [
        "Το αποδέχομαι πλήρως, είναι δίκαιο για την ομάδα.", // ✅ Υπέρ ξεκάθαρα
        "Συμφωνώ, η συνέπεια είναι το πιο σημαντικό.", // ✅ Υπέρ ξεκάθαρα
        "Κατανοώ τον κανόνα, αλλά θα έπρεπε να υπάρχει περιθώριο συζήτησης.", // ✅ Υπέρ με αμφιβολία
        "Δεκτό, αρκεί να υπάρχει κάποιος δίκαιος μηχανισμός αξιολόγησης.", // ✅ Υπέρ με αμφιβολία
        "Θεωρώ ότι θα έπρεπε να υπάρχει προειδοποίηση πριν τη διαγραφή.", // ❌ Κατά με επιχείρημα
        "Αν δεν υπάρχει δυνατότητα επανεξέτασης, είναι υπερβολικά αυστηρό.", // ❌ Κατά με επιχείρημα
        "Δεν συμφωνώ, η οριστική διαγραφή είναι άδικη.", // ❌❌ Ξεκάθαρα κατά
        "Απορρίπτω πλήρως αυτή την πολιτική.", // ❌❌ Ξεκάθαρα κατά
      ],
    },
    {
      question: "Εδώ θα κρατάς accounts πολλών χιλιάδων ευρώ. Πόσο σοβαρά βλέπεις αυτήν την δουλειά;",
      answers: [
        "Την αντιμετωπίζω με απόλυτη σοβαρότητα, κατανοώντας την ευθύνη.", // ✅ Υπέρ ξεκάθαρα
        "Είναι σημαντικό για μένα και δεσμεύομαι να είμαι συνεπής.", // ✅ Υπέρ ξεκάθαρα
        "Το βλέπω ως μια μεγάλη ευκαιρία, αλλά χρειάζομαι χρόνο να προσαρμοστώ.", // ✅ Υπέρ με αμφιβολία
        "Θα το πάρω σοβαρά, αν δω ότι προχωράμε.", // ✅ Υπέρ με αμφιβολία
        "Αρχικά το βλέπω σαν μια δοκιμή, αλλά αν αποδειχθεί κερδοφόρο, θα το πάρω πιο σοβαρά.", // ❌ Κατά με επιχείρημα
        "Δεν είμαι σίγουρος ακόμα αν θέλω να το δω τόσο σοβαρά.", // ❌ Κατά με επιχείρημα
        "Το βλέπω περισσότερο σαν ένα side project.", // ❌❌ Ξεκάθαρα κατά
        "Δεν πιστεύω ότι χρειάζεται να το δω πολύ σοβαρά σε αυτό το στάδιο.", // ❌❌ Ξεκάθαρα κατά
      ],
    },
  ];

  const handleAnswerSubmit = async () => {
    setAnswers([...answers, { question: listOfQuestions[questionIndex].question, answer: customAnswer.trim() }]);

    setCustomAnswer("");
    if (questionIndex < listOfQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  return (
    <div className="flex w-full h-dvh items-center justify-center">
      {register && (
        <div className="flex flex-col w-full max-w-[300px] gap-2">
          <input type="text" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input" />
          <input type="text" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input" />
          <input type="tel" name="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className="input" />
          <input type="email" name="bybitEmail" value={bybitEmail} onChange={(e) => setBybitEmail(e.target.value)} placeholder="Bybit Email" className="input" />
          <input type="text" name="bybitUid" value={bybitUid} onChange={(e) => setBybitUid(e.target.value)} placeholder="Bybit Uid" className="input" />
          <button onClick={Register} className="bg-orange-700 p-3 rounded-b hover:bg-orange-600 text-white font-semibold outline-none">
            Register
          </button>
        </div>
      )}
      {questions && (
        <div className="flex flex-col items-center gap-4 max-w-[800px]">
          {answers.length !== listOfQuestions.length && (
            <>
              <p className="text-lg font-medium text-justify">{listOfQuestions[questionIndex].question}</p>
              <div className="flex flex-wrap gap-4">
                {listOfQuestions[questionIndex].answers.map((option, index) => (
                  <button key={index} onClick={() => setCustomAnswer(option)} className="bg-blue-500 text-white p-2 rounded-md text-sm hover:bg-blue-400">
                    {option}
                  </button>
                ))}
              </div>
              <textarea placeholder="Ή γράψε τη δική σου απάντηση" value={customAnswer} onChange={(e) => setCustomAnswer(e.target.value)} className="input" />
            </>
          )}
          {answers.length !== listOfQuestions.length && (
            <button onClick={handleAnswerSubmit} className="bg-green-700 text-white p-2 w-full rounded-md hover:bg-green-600" disabled={customAnswer.trim() === ""}>
              Υποβολή
            </button>
          )}
          {answers.length === listOfQuestions.length && (
            <button onClick={Save} className="bg-green-700 text-white p-2 w-full rounded-md hover:bg-green-600">
              Αποθήκευσε τις απαντήσεις σου
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
