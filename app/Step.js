import InfoButton from "@/components/InfoButton";

const Step = ({ text, active, info, startingHour, endingHour }) => {
  return (
    <div className="flex flex-col items-center gap-2 col-span-2">
      <InfoButton classes="text-xs" message={info} />
      <div className="flex flex-col items-center">
        <div>
          {startingHour > 24 ? startingHour - 24 : startingHour}:00 - {endingHour > 24 ? endingHour - 24 : endingHour}:00
        </div>
        <div className="font-semibold">{text}</div>
      </div>
      <div className={`w-[20px] h-[20px] ${active ? "bg-blue-500" : "bg-red-500"} rounded-full flex justify-center items-center relative`}>
        <div className={`w-[10px] h-[10px] rounded-full ${active ? "bg-blue-100" : "bg-red-300"}`}></div>
        <div className={`w-[10px] h-[10px] ${active ? "bg-blue-100 animate-ping" : "bg-red-300"} rounded-full absolute`}></div>
      </div>
    </div>
  );
};

export default Step;
