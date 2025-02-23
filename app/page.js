import PageTransition from "@/components/PageTransition";

export default async function Home() {
  return (
    <PageTransition>
      <div>
        <h1>Καλώς ήρθατε</h1>
        <p>Αυτή είναι η αρχική σελίδα.</p>
      </div>
      <div className="h-[300px]">context</div>
      <div className="h-[300px]">context</div>
      <div className="h-[300px]">context</div>
      <div className="h-[300px]">context</div>
      <div className="h-[300px]">context</div>
    </PageTransition>
  );
}

// EDIT {greeceTime > 0 && greeceTime < 21 && ( το > 0 να γίνει > 16
