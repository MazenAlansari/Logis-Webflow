import Shell from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Package, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DriverHome() {
  const { user } = useAuth();

  const tasks = [
    {
      id: "DEL-9821",
      status: "In Progress",
      address: "123 Business Park Dr, Suite 400",
      city: "San Francisco, CA",
      time: "10:30 AM - 12:00 PM",
      packages: 3
    },
    {
      id: "DEL-9822",
      status: "Pending",
      address: "450 Market St",
      city: "San Francisco, CA",
      time: "1:00 PM - 2:00 PM",
      packages: 1
    }
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold">Hello, {user?.fullName.split(" ")[0]}</h1>
          <p className="text-muted-foreground">You have {tasks.length} deliveries scheduled for today.</p>
        </div>

        <div className="grid gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Status Strip */}
                <div className={`w-full md:w-2 h-2 md:h-auto ${task.status === 'In Progress' ? 'bg-primary' : 'bg-muted'}`} />
                
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {task.id}
                      </span>
                      <Badge variant={task.status === 'In Progress' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                    {task.status === 'In Progress' && (
                      <Button size="sm" className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Start Navigation
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold">{task.address}</p>
                          <p className="text-muted-foreground">{task.city}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Expected: {task.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{task.packages} packages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
