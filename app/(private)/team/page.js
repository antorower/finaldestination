export const dynamic = "force-dynamic";

import TeamMenuItem from "./TeamMenuItem";
import PageTransition from "@/components/PageTransition";

const Team = async () => {
  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center">
        <TeamMenuItem link="/admin/schedule" icon="/calendar.svg" color="bg-blue-500" text="Εργασίες" />
        <TeamMenuItem link="/team/traders" icon="/traders.svg" color="bg-purple-500" text="Traders" />
        <TeamMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-red-500" text="Accounts" />
        <TeamMenuItem link="/admin/trades" icon="/pairs.svg" color="bg-orange-500" text="Trades" />
        <TeamMenuItem link="/admin/new-users" icon="/maths.svg" color="bg-yellow-500" text="Στατιστικά" />
        <TeamMenuItem link="/admin/new-users" icon="/payment.svg" color="bg-sky-500" text="Πληρωμές" />
        <TeamMenuItem link="/admin/new-users" icon="/charge.svg" color="bg-violet-500" text="Χρεώσεις" />
      </div>
    </PageTransition>
  );
};

export default Team;
