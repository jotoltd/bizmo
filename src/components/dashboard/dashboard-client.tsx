"use client";

import { useState } from "react";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";
import { FirstBusinessWizard } from "@/components/dashboard/first-business-wizard";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { acceptBusinessInvitationAction, rejectBusinessInvitationAction } from "@/app/dashboard/actions";

interface Business {
  id: string;
  name: string;
  type: string;
  completed_tasks: string[];
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  has_seen_welcome?: boolean;
}

interface Invitation {
  id: string;
  business_id: string;
  business_name: string;
  invited_by_email: string;
  role: string;
}

interface DashboardClientProps {
  profile: Profile;
  businesses: Business[];
  invitations: Invitation[];
}

export function DashboardClient({ profile, businesses, invitations }: DashboardClientProps) {
  const [showWelcome, setShowWelcome] = useState(!profile.has_seen_welcome);
  const [showWizard, setShowWizard] = useState(false);

  const hasBusinesses = businesses.length > 0;

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    if (!hasBusinesses) {
      setShowWizard(true);
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-void pb-20">
      {showWelcome && (
        <WelcomeModal userId={profile.id} onComplete={handleWelcomeComplete} />
      )}
      
      {showWizard && (
        <FirstBusinessWizard userId={profile.id} onComplete={handleWizardComplete} />
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Invitations */}
        {invitations.length > 0 && (
          <div className="mb-8 space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="p-4 border-electric/30 bg-electric/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      Invitation to join {invitation.business_name}
                    </p>
                    <p className="text-sm text-slate-400">
                      From: {invitation.invited_by_email} • Role: {invitation.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rejectBusinessInvitationAction({ invitationId: invitation.id })}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => acceptBusinessInvitationAction({ invitationId: invitation.id })}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!hasBusinesses && !showWizard && (
          <DashboardEmptyState 
            type="businesses" 
            onAction={() => setShowWizard(true)} 
          />
        )}

        {/* Businesses Grid */}
        {hasBusinesses && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link key={business.id} href={`/business/${business.id}`}>
                <Card className="p-6 hover:border-electric/50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-electric transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-slate-400">{business.type}</p>
                    </div>
                    <Badge variant="secondary">
                      {business.completed_tasks?.length || 0} tasks done
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.round((business.completed_tasks?.length || 0) / 10 * 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Created {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            ))}
            
            {/* Add Business Card */}
            <Button
              variant="outline"
              className="h-full min-h-[150px] border-dashed border-2 hover:border-electric hover:text-electric"
              onClick={() => setShowWizard(true)}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">+</span>
                <span>Add Another Business</span>
              </div>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
