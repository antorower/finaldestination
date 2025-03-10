export const dynamic = "force-dynamic";

import Image from "next/image";

const Education = () => {
  return (
    <div className=" h-full w-full overflow-y-auto flex flex-col">
      <Title text="Εισαγωγή" />
      <Paragraph text="Στο παρελθόν κάναμε πολλά λάθη, και το μεγαλύτερο από αυτά ήταν ότι σπαταλήσαμε αμέτρητες ώρες κυνηγώντας τα άτομα της ομάδας για να κάνουν τη δουλειά τους σωστά. Ξοδέψαμε τεράστιο κόπο, χρόνο και, το σημαντικότερο, πολλά χρήματα εξαιτίας αυτής της χαλαρής προσέγγισης. Δεν γίνεται να επαναλάβουμε τα ίδια λάθη." />
      <Paragraph text="Η σελίδα είναι σχεδιασμένη έτσι ώστε να μην επιτρέπει χαλαρή ή περιστασιακή συμμετοχή. Υπάρχουν αυτόματες χρεώσεις για κάθε λάθος ή παράλειψη, και το σύστημα scanάρει συνεχώς τα πάντα." />
      <Paragraph text="Όποιος συμμετέχει πρέπει να συνεργάζεται πλήρως, να παίρνει τη δουλειά στα σοβαρά και να τη χειρίζεται με υπευθυνότητα. Αν κάποιος δεν μπορεί να το κάνει, απλά δεν έχει λόγο να συμμετέχει, γιατί το μόνο που θα καταφέρει είναι να χάσει χρόνο και χρήματα." />
      <Subtitle text="Παραδείγματα" />
      <Paragraph text="❌ Ήμουν στην δουλειά και δεν ενημέρωσα την σελίδα για το balance ή ακόμα χειρότερα δεν έκλεισα το trade γιατί είχα meeting με τον Πάπα." />
      <Paragraph text="❌ Ξύπνησα τελευταία στιγμή για να βάλω μπαμ μπαμ τα trades να φεύγω γιατί άργησα στην δουλειά." />
      <Paragraph text="❌ Για να μην τρώω χρόνο θα βάζω τα trades καθώς ετοιμάζομαι γιατί δεν μπορώ να ξυπνάω νωρίτερα να κάνω με την ησυχία μου την δουλειά μου." />
      <Subtitle text="Δεν Υπάρχουν Δικαιολογίες" />
      <Paragraph text="Τα accounts κοστίζουν 500$ το ένα και τα λάθη από 150$ μέχρι 7.800$ το κάθε ένα. Συνεπώς κανένας δεν μπορεί να βρει καμία απολύτως δικαιολογία που να αξίζει τόσες χιλιάδες ευρώ! Άργησες να πας στην δουλειά; Στην δουλειά θα πάρεις ένα 50άρικο. Τα accounts σου μπορεί αν αξίζουν από 500€ μέχρι και 20.000€. Οπότε το να βιάζεσαι να πας να πάρεις το 50άρικο και να μας κάνεις ζημιά 5, 10 ή 20 χιλιάρικα είναι το λιγότερο γελοίο. Το να έχεις ένα funded 100άρι που αξίζει 7.800$ και να μην κλείσεις το trade με αποτέλεσμα να κάψεις το account επειδή μιλούσες με τον Πάπα είναι επίσης γελοίο. Που θέλω να καταλήξω; ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΙΚΑΙΟΛΟΓΙΕΣ!" />
      <Subtitle text="Θερμή Παράκληση" />
      <Paragraph text="Αν δεν έχεις σκοπό να το δεις όντως ΣΟΒΑΡΑ και να δουλεύεις το μυαλό σου για αυτό τότε μην μπεις καθόλου! Έτσι και αλλίως αν ξεχνάς να κάνεις τις δουλειές σου η σελίδα θα σε χρεώνει αυτόματα τις παραλείψεις και τα λάθη σου και δεν πρόκειται να καταλήξεις ποτέ με κέρδος!" />
      <Subtitle text="Σημαντική Σημείωση" />
      <Paragraph text="Από εδώ και κάτω κανένας δεν θα ασχολείται μαζί σου να σε νταντεύει κάνε αυτό και κάνε το άλλο. Θα πρέπει ΕΣΥ να κάνεις τις δουλειές σου. Το σύστημα αξιολογεί καθημερινά τον κάθε ένα ξεχωριστά, καταγράφει κάθε click που κάνει, κρατάει τα πλήρη στατιστικά των κινήσεων του και αξιολογεί. Όλα αυτά θα μπορείς να τα δεις και εσύ ανά πάσα στιγμή. Όταν η αξιολόγηση από τον ίδιο το αλγόριθμο γίνει αρκετά κακή τότε κλειδώσει από μόνος του λογαριασμούς." />
      <Subtitle text="Όροι Συμμετοχής" />
      <Paragraph text="Με χαρά λοιπόν να επενδύσουμε πάνω στον κάθε ένα τα χιλιάρικα της ομάδας. Αλλά πριν μπεις θα πρέπει να αποδεχτείς τα παρακάτω:" />
      <Paragraph text="✅ Θα είσαι συνεπής και δεν θα λες ποτέ δικαιολογίες γιατί δεν έκανες την δουλειά σου. Απλά θα την κάνεις." />
      <Paragraph text="✅ Τα accounts που σου αγοράζουμε ανήκουν στην ομάδα." />
      <Paragraph text="✅ Θα βάζεις τα ξυπνητήρια σου σε όλες τις φάσεις τις ημέρας που έχεις να κάνεις κάποια δουλειά." />
      <Paragraph text="✅ Για όλα τα accounts που σου αγοράζουμε θα εισάγεις στην σελίδα τα credentials τους (του MetaTrader, όχι της εταιρείας)." />
      <Paragraph text="✅ Αν θέλεις να φύγεις από την ομάδα οποιαδήποτε στιγμή και για οποιονδήποτε λόγο θα παίξεις πρώτα τα accounts σου μέχρι να χάσουν." />
      <Paragraph text="✅ Αν η αξιολόγησή σου από τον αλγόριθμο είναι κακή και σου κλειδώσει τον λογαριασμό θα το σεβαστείς και θα παίξεις τα accounts που έχεις σε συνεργασία μαζί μας και μετά θα φύγεις." />
      <Title text="Βασικές Πληροφορίες" />
      <Paragraph text="Στο μενού Profile στο link Εργασίες θα βρίσκεις κάθε μέρα τις εργασίες που έχεις να κάνεις. Αν μπεις 4 - 10 το πρωί θα βρεις τα trades που έχεις να βάλεις. Αν μπεις 10 το πρωί με 5 το απόγευμα θα μπορείς να ενημερώσεις το balance σου αν έχει κλείσει το trade. Αν μπεις 6 - 8 το απόγευμα θα δεις τις προτάσεις των trades του αλγορίθμου για τα accounts σου για την επόμενη μέρα και αν μπεις 8 - 12 θα βρεις το πρόγραμμα σου για την επόμενη ημέρα." />
      <Title text="Πρόγραμμα" />
      <Paragraph text="Η ημέρα χωρίζεται σε 4 φάσεις. Το πρωί βάζουμε τα trades. Τα ωράρια σου μπορείς να τα ορίσεις από το μενού Profile στις ρυθμίσεις. Το μεσημέρι/απόγευμα τα κλείνουμε και ενημερώνουμε την σελίδα για το balance. Το απόγευμα μπαίνουμε για να δεχτούμε ποιά trades θα βάλουμε την επομένη. Το βράδυ βλέπουμε το πρόγραμμα μας της επόμενης ημέρας. Είναι σημαντικό να αναφέρουμε ότι η σελίδα δεν θα δίνει σε όλους trades κάθε μέρα. Πολλές μέρες δεν θα έχετε να κάνετε τίποτα. Παρακάτω εξηγούνται αναλυτικά οι τέσσερις φάσεις ξεκινώντας από την τρίτη γιατί έτσι θα καταλάβετε καλύτερα τον κύκλο." />
      <Subtitle text="3. Προγραμματισμός" />
      <Paragraph text="Από τις 18:00 έως τις 20:00 (6-8 το απόγευμα) μπαίνεις στην σελίδα, στο menu profile στα αριστερά και το υπομενού `Εργασίες` και βλέπεις τις προτάσεις του αλγορίθμου για τα αυριανά σου trades. Τα trades αυτά είναι είτε με πορτοκαλί background είτε με γκρι. Τα πορτοκαλί είναι πάντα εντός των χρονικών ορίων που εσύ έχεις δηλώσει ότι μοπρείς να βάλεις trades. Οπότε είσαι υποχρεωμένος να τα πατήσεις accept. Αν τα κάνεις reject ο αλγόριθμος στις 8 ακριβώς θα σε χρεώσει λόγω ασυνέπειας. Τα γκρι trades είναι προτάσεις εκτός των ωρών που σε βολεύει, οπότε αν δεν μπορείς να τα βάλεις μπορείς να τα κάνεις reject χωρίς κανένα πρόβλημα. Να έχεις πάνα στο μυαλό σου ότι τα trades πρέπει να μπαίνουν με ησυχία, ηρεμία και χωρίς βιασύνη. Αν δεν μπορείς να τα βάλεις υπό αυτές τις συνθήκες τότε πάτησε reject. Αυτό ισχύει για τα γκρι trades και μόνο. Τα πορτοκαλί είσαι υπόχρεος να τα βάλεις υπό αυτές τις συνθήκες. Αν ξέρεις ότι δεν θα μπορείς να βάλεις άλλες ώρες εκτός αυτών που έχεις δηλώσει τότε μπορείς να πάς στις ρυθμίσεις και να απενεργοποιήσεις τα Flexible Suggestions. Όποιες μέρες θέλεις μπορείς να το ενεργοποιείς ξανά." />
      <Subtitle text="4. Προετοιμασία" />
      <Paragraph text="Μετά τις 20:00 (8 το βράδυ), μπορείς να δεις τα trades που έχεις για αύριο. Δεν σημαίνει πως ότι πάτησες accept στην προηγούμενη φάση θα το βάλεις κιόλας. Μετά τις 20:00 βλέπεις το τελικό σου πρόγραμμα, ρυθμίζεις τα ξυπνητήρια σου και είσαι έτοιμος." />
      <Subtitle text="1. Trading" />
      <Paragraph text="Το πρωί θα πρέπει να είσαι έτοιμος μπροστά από τον υπολογιστή σου ΤΟΥΛΑΧΙΣΤΟΝ 15 λεπτά πριν το πρώτο σου trade. Οπότε η διαδικασία πηγαίνει ως εξής: Αν, επι παραδείγματι, έχεις να βάλεις ένα trade στις 7:30, τότε 6:30 - 7:20 μπορείς να πατήσεις το κουμπί Aware ώστε να δηλώσεις ότι είσαι στο pc. Αν δεν πατήσεις 10 λεπτά με 1 ώρα νωρίτερα το Aware η σελίδα δεν θα σε αφήσει να προχωρήσεις και θα θεωρήσει ότι έχασες το trade. Αφού περάσει 7:20, δηλαδή το τελευταίο 10λεπτο, μπορείς να πατήσεις Open Trade. Αν η σελίδα σου δώσει το trade τότε θα το βάλεις κανονικά. Αν η σελίδα το ακυρώσει θα σε ενημερώσει όταν πατήσεις το Open Trade. Θα πρέπει να πατάς αρκετά νωρίς το Open Trade (7-10 λεπτά πριν το trade) ώστε να έχεις αρκετό χρόνο να προετοιμάσεις το trade σου και να το ανοίξεις ΑΚΡΙΒΩΣ την ώρα που γράφει η σελίδα (μισό λεπτό πάνω, μισό λεπτό κάτω, όχι παραπάνω διαφορά!). Να ξέρεις ότι πριν πατήσεις το Aware θα πρέπει να είσαι σίγουρος ότι το account είναι έτοιμο να δεχτεί trades και ότι είσαι login στον λογαριασμό αυτόν. Αν τελευταία στιγμή καταλάβεις ότι έχεις ένα από τα δύο προβλήματα τότε κανένας δεν μπορεί να σου κάνει τίποτα. Απλά θα χρεωθείς το λάθος! Άρα θέλει υπευθυνότητα! Προσπαθείς να ξεπετάξεις; Δεν ενδιαφέρεσαι και απλά έχεις μια νοοτροπία `να βγει η δουλειά`; Θα τα βρεις μπροστά σου." />
      <Subtitle text="2. Ενημέρωση" />
      <Paragraph text="Από τις 10:00 το πρωί ως τις 17:00 (5 το απόγευμα) μπορείς να ενημερώνεις το balance σου. Αν δεν έχεις ενημερώσει το balance σου ως τις 17.00 τότε η πλατφόρμα θα scanάρει όλα τα trades, θα δει ότι δεν το έχεις ενημερώσει και θα σε χρεώσει για ασυνέπεια. Τα trades θα πρέπει να ελέγχονται ότι έκλεισαν ή και να κλείνουν πολύ συγκεκριμένη ώρα που θα αναγράφεται στην σελίδα." />
      <Title text="Χρεώσεις" />
      <Paragraph text="Οι χρεώσεις για τα λάθη θα είναι δυναμικές και θα διαμορφώνονται αναλόγως της συνέπειας μας. Θα ξεκινήσουν από αρκετά ψηλά και και όσο είμαστε συνεπείς θα μειώνονται." />
    </div>
  );
};

export default Education;

const Title = ({ text }) => {
  return <div className="text-center my-4 bg-gray-50 p-4 text-gray-800 font-bold text-2xl border-b border-gray-300 shadow-md">{text}</div>;
};

const Subtitle = ({ text }) => {
  return <div className="text-left px-8 py-2 w-full max-w-[800px] mx-auto text-gray-800 font-bold text-base">{text}</div>;
};

const Paragraph = ({ text }) => {
  return <div className="text-justify px-8 py-1 w-full max-w-[800px] mx-auto text-gray-600 text-base">{text}</div>;
};
