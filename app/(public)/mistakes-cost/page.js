const Cost = () => {
  return (
    <div className="bg-white p-4">
      <div className="text-center font-bold text-2xl mb-4">Κόστος Λαθών</div>
      <div className="text-center max-w-[800px] mx-auto">Τα παρακάτω νούμερα αφορούν λάθη ανά 1%. Σημαίνει αν κάνετε κάποιο λάθος που αφορά 0.5% ρίσκο τότε θα χρεωθείτε τα μισά. Αν κάνετε λάθος που αφορά 2% ρίσκο θα χρωεθείτε τα διπλάσια. Αν είστε σε 4% κέρδος και το κάψετε τότε θα χρεωθείτε 10% dd + 4% κέρδος, δηλαδή και το 14% που κάηκε.</div>
      <div className="flex flex-wrap gap-8 justify-center bg-white p-4">
        <Company name="FTMO" phase1={252} phase2={504} phase3={756} />
        <Company name="Funded Next" phase1={245} phase2={425} phase3={667} />
        <Company name="Funding Pips" phase1={194} phase2={349} phase3={543} />
        <Company name="The5ers" phase1={226} phase2={405} phase3={635} />
      </div>
    </div>
  );
};

export default Cost;

const Company = ({ name, phase1, phase2, phase3 }) => {
  return (
    <div className="max-w-[500px] mx-auto mt-10 p-4 bg-white border border-gray-400 rounded">
      <div className="text-start">{name}</div>
      <div className="grid grid-cols-3">
        <div className="border border-gray-400 p-2">Phase 1</div>
        <div className="border border-gray-400 p-2">Phase 2</div>
        <div className="border border-gray-400 p-2">Phase 3</div>

        <div className="border border-gray-400 p-2 text-center">${phase1}</div>
        <div className="border border-gray-400 p-2 text-center">${phase2}</div>
        <div className="border border-gray-400 p-2 text-center">${phase3}</div>
      </div>
    </div>
  );
};
