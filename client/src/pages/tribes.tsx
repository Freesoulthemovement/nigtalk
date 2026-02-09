import { useTribes, useCreateTribe, useJoinTribe } from "@/hooks/use-tribes";
import { NavSidebar } from "@/components/nav-sidebar";
import { Loader2, Plus, Users } from "lucide-react";
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

export default function TribesPage() {
  const { data: tribes, isLoading } = useTribes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <NavSidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display mb-2">Tribes</h1>
              <p className="text-muted-foreground">Join a community or start your own movement.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tribes?.map((tribe) => (
                <Link key={tribe.id} href={`/tribes/${tribe.id}`}>
                  <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{tribe.name}</h3>
                    <p className="text-muted-foreground text-sm flex-1 mb-4 line-clamp-3">
                      {tribe.description || "No description provided."}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                      Created {new Date(tribe.createdAt!).toLocaleDateString()}
                    </div>
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
      </main>
    </div>
  );
}

function CreateTribeForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateTribe();
  const form = useForm<InsertTribe>({
    resolver: zodResolver(insertTribeSchema),
    defaultValues: { name: "", description: "" }
  });

  const onSubmit = (data: InsertTribe) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
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
                <Input placeholder="e.g. The Free Soul Movement" {...field} />
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
                <Textarea placeholder="What is this tribe about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Tribe
        </Button>
      </form>
    </Form>
  );
}
