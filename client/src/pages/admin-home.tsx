import Shell from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Truck, Package, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  const { user } = useAuth();

  const stats = [
    { label: "Total Drivers", value: "24", icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Active Deliveries", value: "142", icon: Truck, color: "text-orange-600 bg-orange-100" },
    { label: "Packages Today", value: "1,204", icon: Package, color: "text-purple-600 bg-purple-100" },
    { label: "Success Rate", value: "98.5%", icon: Activity, color: "text-green-600 bg-green-100" },
  ];

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your fleet operations</p>
          </div>
          <Button variant="outline">Download Report</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold font-display">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart/Map Area Placeholder */}
          <Card className="lg:col-span-2 shadow-sm border-0">
            <CardHeader>
              <CardTitle>Live Fleet Status</CardTitle>
              <CardDescription>Real-time location of active drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-muted">
                <div className="text-center space-y-2">
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground font-medium">Map Integration Unavailable</p>
                  <p className="text-sm text-muted-foreground/60">Configure Google Maps API to view live tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>System notifications & updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Driver #10{i} arrived at destination</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
