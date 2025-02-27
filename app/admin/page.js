export const dynamic = "force-dynamic";

import AdminMenuItem from "./AdminMenuItem";
import PageTransition from "@/components/PageTransition";

export default function AdminPage() {
  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center">
        <AdminMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-green-500" text="New Users (OK)" />
        <AdminMenuItem link="/admin/traders" icon="/traders.svg" color="bg-purple-500" text="Traders (ΟΚ)" />
        <AdminMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-red-500" text="Accounts" />
        <AdminMenuItem link="/admin/trades" icon="/pairs.svg" color="bg-orange-500" text="Trades" />
        <AdminMenuItem link="/admin/new-users" icon="/maths.svg" color="bg-yellow-500" text="Στατιστικά" />
        <AdminMenuItem link="/admin/new-users" icon="/payout.svg" color="bg-lime-500" text="Payouts" />
        <AdminMenuItem link="/admin/companies" icon="/company.svg" color="bg-rose-500" text="Εταιρίες (ΟΚ)" />
        <AdminMenuItem link="/admin/pairs" icon="/euro-icon.svg" color="bg-slate-500" text="Pairs (OK)" />
        <AdminMenuItem link="/admin/new-users" icon="/payment.svg" color="bg-sky-500" text="Πληρωμές" />
        <AdminMenuItem link="/admin/new-users" icon="/charge.svg" color="bg-violet-500" text="Χρεώσεις" />
        <AdminMenuItem link="/admin/schedule" icon="/calendar.svg" color="bg-blue-500" text="Πρόγραμμα (ΟΚ)" />
        <AdminMenuItem link="/admin/settings" icon="/settings.svg" color="bg-teal-500" text="Ρυθμίσεις (OK)" />
        <AdminMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-fuchsia-500" text="Live" />
      </div>
    </PageTransition>
  );
}
