"use client";

import { motion } from "framer-motion";
import { MessageSquare, Sparkles, BarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductShowcase() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Experience the dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A purpose-built interface for async collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="feed">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              <Card className="p-8 border-2">
                <div className="space-y-6">
                  {/* Mock Feed Item */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-background"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Team Member {i}</p>
                              <p className="text-sm text-muted-foreground">
                                {i}h ago
                              </p>
                            </div>
                            <Badge variant="secondary">Engineering</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                              ✅ Completed authentication flow redesign
                            </p>
                            <p className="text-muted-foreground">
                              🎯 Next: Working on API integration
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card className="p-8 border-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6 text-indigo-500" />
                    <h3 className="text-2xl font-bold">
                      Today's AI Insights
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-l-4 border-indigo-500 bg-indigo-500/10 rounded-r-lg p-4"
                    >
                      <p className="font-semibold mb-2">
                        🚀 High momentum in frontend
                      </p>
                      <p className="text-sm text-muted-foreground">
                        3 team members shipped UI features today. Great
                        progress!
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="border-l-4 border-amber-500 bg-amber-500/10 rounded-r-lg p-4"
                    >
                      <p className="font-semibold mb-2">
                        ⚠️ Potential blocker detected
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 people waiting on API documentation. Consider
                        prioritizing.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="border-l-4 border-green-500 bg-green-500/10 rounded-r-lg p-4"
                    >
                      <p className="font-semibold mb-2">
                        ✨ Team collaboration spike
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Multiple mentions of pairing sessions. Team engagement
                        is high.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="p-8 border-2">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: "Updates Today", value: "12", trend: "+20%" },
                    { label: "Active Members", value: "8/10", trend: "80%" },
                    { label: "Avg Response Time", value: "2.3h", trend: "-15%" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center p-6 rounded-lg border bg-background"
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-4xl font-bold mb-2">{stat.value}</p>
                      <Badge variant="secondary" className="text-green-600">
                        {stat.trend}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
