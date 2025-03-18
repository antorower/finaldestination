export const dynamic = "force-dynamic";

const Education = () => {
  return (
    <div className=" h-full w-full overflow-y-auto flex flex-col bg-white">
      <Title text="Προγραμματισμός" />
      <Paragraph text="Κάθε μέρα 6-8 ώρα Ελλάδας μπαίνουμε για να πατήσουμε accept ή reject τα trades που θα βάλουμε την επομένη" />
      <Subtitle text="Αποδοχή Trades" />
      <Paragraph text="Τα trades που που είναι σε μπεζ background είναι υποχρεωτικά γιατί είναι μέσα στις ώρες που δηλώσαμε εμείς ότι μας βολεύουν και πρέπει πάντα να τα κάνουμε accept." />
      <Subtitle text="Απόρριψη Trades" />
      <Paragraph text="Τα trades που που είναι σε γκρι background είναι εκτός των ωρών που μας βολεύουν. Αν τυγχάνει να μπορούμε να τα βάλουμε την επομένη πατάμε accept. Αν δεν μπορούμε τα κάνουμε reject χωρίς κανένα πρόβλημα." />
      <Subtitle text="Best Practices" />
      <Paragraph text="1. Είναι καλό να βάζετε όσες παραπάνω ώρες μπορείτε διαθέσιμες για να σας βρίσκει ο αλγόριθμος περισσότερα trades. Με αυτόν τον τρόπο θα προχωράτε πιο γρήγορα, άρα θα βγάζετε περισσότερα λεφτά." />
      <Paragraph text="2. Είναι καλό στα settings να έχετε ανοιχτή την επιλογή Flexible Suggestions ώστε να παίρνετε και γκρι προτάσεις εκτός των ωραρίων σας και να κρίνετε αν θα τα κάνετε accept ή reject. Αν είστε όμως σίγουροι ότι δεν μπορείτε σίγουρα να βάλετε trades άλλες ώρες εκτός από αυτές που έχετε δηλώσει είναι καλύτερα να κρατήσετε το Flexible Suggestions απενεργοποιημένο για να πάρουν άλλοι τις προτάσεις." />
      <Subtitle text="Bad Practices" />
      <Paragraph text="1. Την επόμενη μέρα έχουμε κάτι να κάνουμε και ξεχνάμε να αλλάξουμε τις διαθέσιμες ώρες μας. Το θυμόμαστε αφού έχει φτιάξει trades ο αλγόριθμος και μετά κάνουμε reject trades με μπεζ background. Αυτό δεν πρέπει να γίνεται. Η σελίδα χρεώνει αυτόματα τα reject των trades που είναι εντός των ωρών που έχουμε δηλώσει." />
      <Paragraph text="2. Δεν πατάμε reject τα trades που δεν μπορούμε να βάλουμε. Αν πατήσεις reject ένα trade που είναι εκτός των ωρών σου τότε δεν θα χρεωθείς τίποτα. Αν όμως δεν πατήσεις τίποτα η σελίδα θα θεωρήσει ότι δεν μπήκες καν να τα δεις, μας έγραψες και θα χρεώσει." />

      <Title text="Προετοιμασία" />
      <Paragraph text="Δεν σημαίνει ότι όποια κάναμε accept θα τα βάλουμε κιόλας. Κάθε μέρα μετά τις 8 ώρα Ελλάδας μπαίνουμε για να δούμε ποια trades θα βάλουμε την επομένη." />
      <Subtitle text="Βάλε τα ξυπνητήρια σου" />
      <Paragraph text="Κάθε μέρα μετά τις 8 πρέπει να μπαίνουμε και να βλέπουμε τα trades που έχουμε να βάλουμε την επομένη και να προετοιμαζόμαστε ώστε να γίνει σωστά η δουλειά." />
      <Subtitle text="Best Practices" />
      <Paragraph text="1. Κάθε βράδυ δες τα trades της επόμενης ημέρας και βάλε ξυπνητήρι ώρα τέτοια ώστε να είσαι αρκετά νωρίτερα έτοιμος στο pc. Μπορεί το πρωί αν βρεις διάφορα προβλήματα, τύπου δεν έχει μπαταρία το laptop, οπότε πρέπει να έχεις τον χρόνο να τα διευθετήσεις." />
      <Paragraph text="2. Είναι καλή ιδέα να βάζεις τα ξυπνητήρια σου για κάθε trade ξεχωριστά. Αν τα trades έχουν διαφορά μεταξύ τους κανένα μισάωρο να μην ξεχάσεις το δεύτερο." />
      <Subtitle text="Bad Practices" />
      <Paragraph text="1. Βάζω το ξυπνητήρι αργά, το πατάω και δύο αναβολές και τρέχω τελευταία στιγμή μπας και προλάβω." />
      <Paragraph text="2. Βάζω ξυπνητήρι μόνο για το πρώτο trade και τα υπόλοιπα δήθεν θα τα θυμάμαι αφού θα έχω ξυπνήσει. Μια, δυο φορές, την τρίτη θα την πάθεις και θα λες πώς την πατήσαμε έτσι. Μην προκαλείς την τύχη σου. Προετοιμάσου σωστά για να αποφύγεις τα λάθη." />

      <Title text="Trading" />
      <Paragraph text="Κάθε μέρα 4 με 10 το πρωί θα βάζουμε τα trades μας." />
      <Subtitle text="Aware" />
      <Paragraph text="Πάνω από 10 λεπτά πριν το trade θα πρέπει να πατάμε aware. Στα 10 λεπτά πριν το trade, στα 9 λεπτά πριν το trade, δεν θα μας αφήσει να το πατήσουμε. Είμαστε υπεύθυνοι. Την σελίδα δεν την ενδιαφέρει αν άργησες 1 δευτερόλεπτο ή 1 χιλιετία, απλά δεν θα σε αφήσει να το πατήσεις." />
      <Subtitle text="Open Trade" />
      <Paragraph text="Κάτω από 10 λεπτά νωρίτερα (δηλαδή στα 8-9 λεπτά νωρίτερα) θα πρέπει να πατάς open trade ώστε να το προετοιμάζεις στο meta trader σου και όταν έρθει η ώρα απλά να πατάς το buy/sell να ανοίξει. Στην αρχή η σελίδα σε ρωτάω αν είσαι στο σωστό account. ΠΑΝΤΑ ΠΑΝΤΑ ΠΑΝΤΑ να ελέγχεις αν είσαι στο σωστό account. Αν βάλεις το trade στο λάθος account το account πάει για πέταμα αυτόματα και το χρεώνεσαι. Επίσης μετά το trade η σελίδα σου ζητάει να ελέγξεις τα πάντα, account, sl, tp, lots, position. Αυτό δεν το περνάμε έτσι. Τα ελέγχουμε ΟΝΤΩΣ!" />
      <Subtitle text="Best Practices" />
      <Paragraph text="1. Να βάζεις τα ξυπνητήρια σου αρκετά νωρίς ώστε να έχεις χρόνο να πατήσεις το aware" />
      <Paragraph text="2. Να κάνεις ΠΑΝΤΑ τους ελέγχους που σου ζητάει η σελίδα. Είναι τρομερά κακή ιδέα μόλις περάσουν λίγες μέρες και συνηθήσεις να νομίζεις ότι έγινες pro και να μην τα ελέγχεις γιατί αυτό θα είναι το σημείο που θα ξεκινήσετε να κάνετε λάθη και θα ξεκινήσουμε να κυνηγάμε την ουρά μας πάλι." />
      <Paragraph text="3. Θα αφιερώνεις όσο χρόνο χρειάζεται ΜΟΝΟ για αυτήν την δουλειά και θα την κάνεις συγκεντρωμένος και σωστά με όλους τους ελέγχους χωρίς να σε ενοχλεί κανένας! Αυτό σημαίνει ότι θα ξυπνάς πιο νωρίς για να κάνεις ειδικά αυτήν την δουλειά. Όχι ξυπνάω την ίδια ώρα και απλά πάω στην δουλειά και τα ξεπετάω μπαμ μπαμ. Όποιος το κάνει αυτό να μην μπει καθόλου και όποιος μπει και το καταλάβουμε έχει φύγει χωρίς συζήτηση. Είναι απολύτως ξεκάθαρο από την αρχή αυτό." />
      <Subtitle text="Bad Practices" />
      <Paragraph text="1. Βάζω το ξυπνητήρι αργά, το πατάω και δύο αναβολές και τρέχω τελευταία στιγμή μπας και προλάβω." />
      <Paragraph text="2. Τα κάνω γενικά όλα τελευταία στιγμή και πολλές φορές δεν προλαβαίνω για λίγο να πατήσω τα κουμπιά" />
      <Paragraph text="3. Στέλνω του Αντώνη μηνύματα ότι δεν πρόλαβα για λίγο και αν μπορεί αν κάνει κάτι. Το μόνο που θα κάνει ο Αντώνης αν του στείλετε τέτοιο μήνυμα είναι να σας κλειδώσει το account από την clerk για να σας ξεφορτωθεί να βρει την υγεία του. Αν δεν πρόλαβες για λίγο σημαίνει ότι είτε τα κάνεις όλα τελευταία στιγμή είτε κάνεις και άλλα πράγματα ταυτόχρονα. Και τα δύο είναι Χ." />

      <Title text="Ενημέρωση Balance" />
      <Paragraph text="Κάθε μέρα 10 το πρωί με 5 το απόγευμα θα ενημερώνουμε το balance μας. Κάθε μέρα πρέπει να κλείνουμε τα trades μας την ώρα που γράφει η σελίδα και να ενημερώνουμε το balance μας. Αν το trade έχει κλείσει από μόνο του μπορείτε να το ενημερώσετε νωρίτερα από την ώρα που λέει η σελίδα. Διαφορετικά περιμένετε την ώρα που λέει η σελίδα, το κλείνετε και ενημερώνετε." />
      <Subtitle text="Best Practices" />
      <Paragraph text="1. Ενημέρωνε σωστά το balance χωρίς να στέλνεις κάθε δεύτερη Τετάρτη μήνυμα στον Αντώνη να το διορθώσει. Μην μπερδεύεις τις 9000 με τις 90000. Μην τα βάζεις βιαστικά. Έλεγχει το νούμνερο που έγραψες αν όντως είναι σωστό ή λείπει κανένα νούμερο. Μην γράφεις μπαμ μπαμ ένα νούμερο και να πατάς το κουμπί και μου δημιουργείς προβλήματα!! Γράψε σωστά έναν αριθμό! Δεν είναι επιστήμη! Είναι απλά --> ένας αριθμός <--" />
      <Paragraph text="2. Πάντα ενημερώνεις το balance την ώρα που λέει η σελίδα. Εκείνη την ώρα ακριβώς! Δεν υπάρχουν δικαιολογίες!!! Το account αξίζει από 500$ μέχρι και 7500$. Δεν υπάρχει τίποτα άλλο που να κάνεις εκείνη την ώρα που να αξίζει παραπάνω. Και αν αυτά που κάνεις μέσα στην ημέρα σου αξίζουν πάνω από 7500$ τότε είμαστε λίγοι για εσένα, μην ασχοληθείς μαζί μας!!" />
      <Subtitle text="Bad Practices" />
      <Paragraph text="1. Δεν μπορούσα να κλείσω εκείνη την ώρα ή να ενημερώσω γιατί ήμουν στο γραφείο. Έκλεισα τα trades λίγο νωρίτερα ή λίγο αργόερα. 10 λεπτά δουλειά στο γραφείο σου αξίζουν πάνω από 7500$ ώστε δεν μπορούσες να κλείσεις το trade; Μην μπεις. Σου μιλούσε ένας πελάτης στο κατάστημα που δουλεύεις εκείνη την ώρα; Αν οι πελάτες σου αξίζουν πάνω από 7500$ μην μπεις στην ομάδα. Που θέλω να καταλήξω; ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΙΚΑΙΟΛΟΓΙΕΣ και αν αυτά που κάνεις μέσα στην η μέρα σου αξίζουν πάνω από 7500$ σημαίνει ότι όντως έχεις δικαιολογίες άρα δεν σε θέλουμε στην ομάδα!! Θέλουμε μόνο άτομα που ΔΕΝ έχουν δικαιολογίες." />

      <Title text="Προϋποθέσεις" />
      <Subtitle text="Ιδιοκτησία Accounts" />
      <Paragraph text="Τα accounts είναι και παραμένουν στην ιδιοκτησία της ομάδας. Αυτό σημαίνει ότι για όλα τα accounts θα αποθηκεύεις στα credentials τους στην σελίδα μας. Όχι τους κωδικούς της εταιρίας, τους κωδικούς του meta trader. Αν διαπιστωθεί ότι έχεις αποθηκεύσει λάθος στοιχεία τότε σημαίνει ότι δουλεύεις εκ του πονηρού και θα φύγεις αφού παίξεις τα accounts μέχρι να χάσουν." />

      <Subtitle text="Αποχωρήσεις" />
      <Paragraph text="Αν για οποινδήποτε λόγο θέλεις να φύγεις ή σε διώξουμε εμείς επειδή είσαι ασυνεπής και δεν μπορούμε να σε παρακαλάμε και να σου αλλάζουμε πάνα τότε θα παίξεις τα accounts σου μέχρι να χάσουν, όσο καιρό και αν πάρει αυτό, και μετά θα φύγεις." />

      <Subtitle text="Αλλαγή Πάνας" />
      <Paragraph text="Δεν θα καθόμαστε να αλλάζουμε πάντα και να κάνουμε κουπεπέ σε κανέναν. Αν μπορείς να είσαι Υ-Π-Ε-Υ-Θ-Υ-Ν-Ο-Σ και να παίζεις μόνος σου και σωστά καλώς. Αν όχι μην φας τον χρόνο μας και τα λεφτά μας. Είναι κρίμα." />

      <Subtitle text="Προβλήματα" />
      <Paragraph text="Ότι πρόβλημα δημιουργείται με το account σου θα μιλάς ΕΣΥ και από ΜΟΝΟΣ ΣΟΥ με το support της εταιρίας για να το λύνεις και θα ενημερώνεις σχετικά την ομάδα σου. Το να έχεις πρόβλημα και να το έχει παρατήσει εκεί πέρα μια βδομάδα περιμένοντας να το δούμε εμείς και να σε ρωτήσουμε τι γίνεται ΔΕΝ ΕΙΝΑ ΑΝΕΚΤΟ. Αυτό όταν είμαστε πολλά άτομα είναι ένας απίστευτος ΚΑΡΚΙΝΟΣ και όποιος το κάνει θα φεύγει με συνοπτικές διαδικασίες να βρίσκουμε την υγειά μας. Μπορείς να είσαι υπεύθυνος και αν λύνεις τα προβλήματα σου; Μπες. Δεν μπορείς και θες να σου αλλάζουν την πάνα; Δεν είμαστε ο σωστός τόπος γαι εσένα." />

      <Subtitle text="Λάθη" />
      <Paragraph text="Τα λάθη σας θα μιλήσετε με την ομάδα σας το πως θα τα χρεώνεστε. Επίσης όλοι θα χρεωνόμαστε τα λάθη που εντοπίζει αυτόματα η σελίδα." />

      <Subtitle text="Έσοδα" />
      <Paragraph text="Το σύστημα είναι άδικο! Κάποιος μπορεί να βγάλει περισσότερα λεφτά από εσάς, είτε επειδή έχει βάλει να παίζει περισσότερες ώρες είτε απλά επειδή είναι πιο τυχερός. Αν αυτό σας ενοχλεί τότε μην μπείτε καθόλου." />

      <Subtitle text="Τύχη" />
      <Paragraph text="Θα προσπαθήσουμε όσο γίνεται και όσο είναι λογικό να μετριάσουμε λίγο τον παράγοντα τύχη ώστε να μην υπάρχουν αυτοί που βγάζουν πολλά και αυτοί που δεν βγάζουν τίποτα. Αυτό όμως θα χρειαστεί και εσείς να μην κοιτάτε ο κάθε ένας το συμφέρον του ξεχωριστά. Τι εννοώ; Έχουμε 10 παιδιά που βγάζουν πολλά λεφτά, έχουμε άλλα 10 που βγάζουν αρκετά λιγότερα. Για να λυθεί αυτό θα πρέπει είτε να βρούμε λεφτόδεντρα είτε να πάρουμε μερικά λεφτά αμέσως ή εμμέσως από αυτούς που βγάζουν πολλά να τα δώσουμε σε αυτούς που βγάλαν λίγα. Αν εδώ αυτοί που βάζουν πολλά κοιτάξουν το προσωπικό τους συμφέρον δεν υπάρχει λύση. Άρα: Μπαίνοντας στην ομάδα θα πρέπει να αποδεχτείτε ότι αλλαγές κάνουμε, ακόμα και στα ποσοστά σας, με μόνο σκοπό να κλείσουμε την ψαλίδα μεταξύ του πιο τυχερού και του πιο άτυχου. Πάντα σε λογικά πλαίσια. Αποδεχόμαστε ότι όταν είμαστε τόσοι πολλοί θα υπάρχουν οι τυχεροί και οι άτυχοι, απλά θα προσπαθήσουμε να κρατάμε την διαφορά σε λογικά πλαίσια. (πχ κάποια στιγμή μπορούμε να πούμε ότι στους 10 πρώτους σε εισόδημα τον μήνα θα κόψουμε Χ$ για να τα δώσουμε στους 10 τελευταίους, παράδειγμα λέω)" />
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

//<Paragraph text="❌ Για να μην τρώω χρόνο θα βάζω τα trades καθώς ετοιμάζομαι γιατί δεν μπορώ να ξυπνάω νωρίτερα να κάνω με την ησυχία μου την δουλειά μου." />

//<Paragraph text="✅ Θα είσαι συνεπής και δεν θα λες ποτέ δικαιολογίες γιατί δεν έκανες την δουλειά σου. Απλά θα την κάνεις." />
