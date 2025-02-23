import Link from "next/link";

const NewCompanyButton = () => {
  return (
    <Link className="fixed bottom-8 right-8 w-[50px] h-[50px] flex items-center justify-center rounded-full hover:scale-110 transition-transform duration-300 text-white text-4xl bg-blue-500" href={`/admin/companies?mode=new`}>
      +
    </Link>
  );
};

export default NewCompanyButton;
