import Image from "next/image";

const Education = () => {
  return (
    <div className=" h-full w-full overflow-y-auto flex flex-col">
      <Title text="Πρόγραμμα" />
      <Paragraph text="Η μέρα έχει συγκεκριμένο πρόγραμμα και πρέπει αν τηρείται με θρησκευτική ευλάβεια." />
      <Subtitle text="Προγραμματισμός" />
      <Paragraph text="" />
    </div>
  );
};

export default Education;

const Title = ({ text }) => {
  return <div className="text-center mb-4 bg-gray-50 p-4 text-gray-800 font-bold text-2xl border-b border-gray-300 shadow-md">{text}</div>;
};

const Subtitle = ({ text }) => {
  return <div className="text-left px-4 py-2 w-full max-w-[800px] mx-auto text-gray-800 font-bold text-base">{text}</div>;
};

const Paragraph = ({ text }) => {
  return <div className="text-justify px-4 py-1 w-full max-w-[800px] mx-auto text-gray-600 text-base">{text}</div>;
};
