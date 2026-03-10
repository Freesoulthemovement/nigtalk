import { useTribes, useCreateTribe } from "@/hooks/use-tribes";
import { NavBar } from "@/components/nav-bar";
import { Loader2, Plus, Users, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTribeSchema, type InsertTribe } from "@shared/schema";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export default function TribesPage() {
  const { data: tribes, isLoading } = useTribes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="p-2 rounded-full hover:bg-muted transition-colors" data-testid="button-back-to-explore">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-display" data-testid="text-tribes-title">Tribes</h1>
                <p className="text-sm text-muted-foreground">Join a community or start your own movement.</p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 rounded-xl" data-testid="button-create-tribe">
                  <Plus className="w-4 h-4" /> Create Tribe
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

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tribes?.map((tribe: any) => (
                <Link key={tribe.id} href={`/tribes/${tribe.id}`}>
                  <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full" data-testid={`card-tribe-${tribe.id}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{tribe.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tribe.description || "No description provided."}</p>
                  </div>
                </Link>
              ))}

              {tribes?.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  No tribes found. Be the first to create one!
                </div>
              )}
            </div>
          )}
        </div>
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tribe Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. The Free Soul Movement" {...field} data-testid="input-tribe-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this tribe about?" {...field} value={field.value || ""} data-testid="input-tribe-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-tribe">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Tribe
        </Button>
      </form>
    </Form>
  );
}
