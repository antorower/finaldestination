export const dynamic = "force-dynamic";

import AdminMenuItem from "./AdminMenuItem";
import PageTransition from "@/components/PageTransition";
import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { sessionClaims } = await auth();
  const isOwner = sessionClaims.metadata.isOwner;
  const isLeader = sessionClaims.metadata.isLeader;

  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center pb-8">
        {isOwner && (
          <>
            <AdminMenuItem link="/admin/tasks" icon="/charge.svg" color="bg-violet-500" text="Εργασίες" />
            <AdminMenuItem link="/admin/traders" icon="/traders.svg" color="bg-purple-500" text="Traders" />
            <AdminMenuItem link="/admin/accounts" icon="/new-user.svg" color="bg-red-500" text="Accounts" />
            <AdminMenuItem link="/admin/trades" icon="/pairs.svg" color="bg-orange-500" text="Trades" />
            <AdminMenuItem link="/admin/payments" icon="/payment.svg" color="bg-sky-500" text="Πληρωμές" />
          </>
        )}
        {isOwner && <AdminMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-green-500" text="New Users" />}
        {isOwner && <AdminMenuItem link="/admin/payouts" icon="/payout.svg" color="bg-lime-500" text="Payouts" />}
        {isOwner && <AdminMenuItem link="/admin/companies" icon="/company.svg" color="bg-rose-500" text="Εταιρίες" />}
        {isOwner && <AdminMenuItem link="/admin/pairs" icon="/euro-icon.svg" color="bg-slate-500" text="Pairs" />}
        {isOwner && <AdminMenuItem link="/admin/schedule" icon="/calendar.svg" color="bg-blue-500" text="Πρόγραμμα" />}
        {isOwner && <AdminMenuItem link="/admin/settings" icon="/settings.svg" color="bg-teal-500" text="Ρυθμίσεις" />}
        {isOwner && <AdminMenuItem link="/admin/stats" icon="/maths.svg" color="bg-yellow-500" text="Στατιστικά" />}
      </div>
    </PageTransition>
  );
}
