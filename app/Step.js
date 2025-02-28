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
      <div className="w-[20px] h-[20px] bg-blue-500 rounded-full flex justify-center items-center relative">
        <div className="w-[10px] h-[10px] bg-blue-200 rounded-full"></div>
        <div className={`w-[10px] h-[10px] bg-blue-200 rounded-full absolute ${active ? "animate-ping" : ""}`}></div>
      </div>
    </div>
  );
};

export default Step;
