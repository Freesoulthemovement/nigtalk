import { useTribes, useCreateTribe } from "@/hooks/use-tribes";
import { NavBar } from "@/components/nav-bar";
import { Loader2, Plus, Shield, ArrowLeft, Vote } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTribeSchema, type InsertTribe } from "@shared/schema";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useNotifications } from "@/hooks/use-notifications";

export default function TribesPage() {
  const { data: tribes, isLoading } = useTribes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();

  // Count unread governance notifications per tribe
  const unreadByTribe: Record<number, number> = {};
  for (const n of notifications) {
    if (!n.isRead && n.tribeId != null && n.type === "new_proposal") {
      unreadByTribe[n.tribeId] = (unreadByTribe[n.tribeId] || 0) + 1;
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-to-explore">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-display" data-testid="text-tribes-title">Tribes</h1>
              <p className="text-sm text-muted-foreground">Create or join a community</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="button-create-tribe">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Tribe</DialogTitle>
              </DialogHeader>
              <CreateTribeForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-5 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(tribes || []).map((tribe: any) => {
              const unread = unreadByTribe[tribe.id] || 0;
              return (
              <Link key={tribe.id} href={`/tribes/${tribe.id}`}>
                <div className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/30 transition-all relative" data-testid={`card-tribe-${tribe.id}`}>
                  <div className="h-20 bg-gradient-to-br from-purple-900/60 to-indigo-900/40 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-purple-400/40" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-semibold text-sm truncate">{tribe.name}</h3>
                      {unread > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-1.5 py-0.5 shrink-0" data-testid={`badge-tribe-governance-${tribe.id}`}>
                          <Vote className="w-2.5 h-2.5" />{unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{tribe.description || "A sovereign tribe"}</p>
                  </div>
                </div>
              </Link>
              );
            })}

            {(!tribes || tribes.length === 0) && (
              <div className="col-span-2 text-center py-16 text-muted-foreground glass-card rounded-2xl">
                No tribes found. Create the first one!
              </div>
            )}
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}

function CreateTribeForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateTribe();
  const form = useForm<InsertTribe>({
    resolver: zodResolver(insertTribeSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: InsertTribe) => {
    mutate(data, { onSuccess: () => { form.reset(); onSuccess(); } });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Tribe Name</FormLabel>
            <FormControl><Input placeholder="e.g. Food Sovereignty" {...field} data-testid="input-tribe-name" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="What is this tribe about?" {...field} value={field.value || ""} data-testid="input-tribe-description" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600" disabled={isPending} data-testid="button-submit-tribe">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Tribe
        </Button>
      </form>
    </Form>
  );
}
