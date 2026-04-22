"use client"

import { useState } from "react"
import {
  Key,
  Plus,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { type ApiKey, type CreatedKey, type CreateKeyForm } from "@/lib/schemas/key-schemas"
import KeyRow from "@/components/admin/key-row"
import CreateKeyModal from "./create-key-modal"
import { useProject } from "@/hooks/useProject"
import { useKeys } from "@/hooks/useKeys"
import KeyRevealModal from "./key-reveal-modal"
import EphemeralTokenSection from "./ephemeral-token-section"
import RevokeDialog from "./revoke-dialog"

export default function ApiKeys() {
  const { selectedProject } = useProject()
  const projectId = selectedProject?.project_id ?? ""
  const { keys, isLoading, createKeyMutation, revokeKeyMutation } = useKeys(projectId)

  const [showCreate, setShowCreate] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)

  const activeKeys = keys.filter(k => !k.revoked)
  const revokedKeys = keys.filter(k => k.revoked)

  const isSubmitting = createKeyMutation.isPending || revokeKeyMutation.isPending

  async function handleCreate(data: CreateKeyForm) {
    const result = await createKeyMutation.mutateAsync(data)
    setShowCreate(false)
    setCreatedKey(result)
  }

  async function handleRevoke(key: ApiKey) {
    await revokeKeyMutation.mutateAsync(key.key_id)
    setRevokeTarget(null)
  }

  return (
    <div className="m-10 max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            API Keys
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeKeys.length} active key{activeKeys.length !== 1 ? "s" : ""} for this project
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowCreate(true)}
          disabled={!selectedProject || isSubmitting}
        >
          <Plus className="h-4 w-4" />
          New key
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="text-sm text-muted-foreground">Loading API keys...</div>
          </CardContent>
        </Card>
      )}

      {/* Active keys */}
      {!isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active keys</CardTitle>
            <CardDescription className="text-xs">
              Keys are shown by prefix only — the full key was displayed once at creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Key className="h-7 w-7 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No active keys</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setShowCreate(true)}
                  disabled={!selectedProject || isSubmitting}
                >
                  <Plus className="h-3.5 w-3.5" /> Create your first key
                </Button>
              </div>
            ) : (
              activeKeys.map((key) => (
                <KeyRow
                  key={key.key_id}
                  apiKey={key}
                  onRevoke={() => setRevokeTarget(key)}
                  isRevoking={isSubmitting}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Ephemeral tokens */}
      {!isLoading && (
        <EphemeralTokenSection keys={keys} projectId={projectId} />
      )}

      {/* Revoked keys (collapsible) */}
      {!isLoading && revokedKeys.length > 0 && (
        <Card>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-xl pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-muted-foreground">
                      Revoked keys ({revokedKeys.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Revoked keys reject all new connections. Existing sessions were not affected.
                    </CardDescription>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2">
                <Separator className="mb-3" />
                {revokedKeys.map((key) => (
                  <KeyRow key={key.key_id} apiKey={key} onRevoke={() => {}} />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateKeyModal
          onCreate={handleCreate}
          onCancel={() => setShowCreate(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {createdKey && (
        <KeyRevealModal
          createdKey={createdKey}
          onClose={() => setCreatedKey(null)}
        />
      )}

      {revokeTarget && (
        <RevokeDialog
          apiKey={revokeTarget}
          onConfirm={() => handleRevoke(revokeTarget)}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  )
}
