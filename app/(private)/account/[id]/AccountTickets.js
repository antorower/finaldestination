import dbConnect from "@/dbConnect";
import Ticket from "@/models/Ticket";
import { revalidatePath } from "next/cache";
import TicketListItem from "./TicketListItem";

const GetAccountTickets = async ({ accountId }) => {
  "use server";
  try {
    await dbConnect();
    return await Ticket.find({ account: accountId, status: "open" });
  } catch (error) {
    console.log("Υπήρξε ένα erorr στην GetAccountTickets στο /account/[id] AccountTickets", error);
    return { error: true, message: error.message };
  }
};

const AccountTickets = async ({ accountId }) => {
  const tickets = await GetAccountTickets({ accountId });

  if (!tickets || tickets.length === 0 || tickets.error) return <div>Δεν υπάρχουν tickets για αυτό το account</div>;

  return (
    <div className="h-full flex flex-col gap-2">
      {tickets.map((ticket) => {
        return <TicketListItem subject={ticket.subject} message={ticket.messages[0].content} notifyUser={ticket.notifyUser} key={`ticket-account-${ticket._id.toString()}`} />;
      })}
    </div>
  );
};

export default AccountTickets;
