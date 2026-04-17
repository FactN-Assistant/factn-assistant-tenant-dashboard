"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Key,
  Plus,
  AlertCircle,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { ApiKey, CreatedKey, CreateKeyForm, MintedToken, MintTokenForm } from "@/lib/types"
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/keysApi"
import KeyRow from "@/components/admin/key-row"
import CreateKeyModal from "./create-key-modal"
import KeyRevealModal from "./key-reveal-modal"
import RevokeDialog from "./revoke-dialog"
import EphemeralTokenSection from "./ephemeral-token-section"
import { useProject } from "@/hooks/useProject"

// ── Types ─────────────────────────────────────────────────────

// ── Mock data ─────────────────────────────────────────────────


// ── Helpers ───────────────────────────────────────────────────

// ── Copy button ───────────────────────────────────────────────

// ── Key type badge ────────────────────────────────────────────

// ── One-time key reveal modal ─────────────────────────────────

// ── Create key modal ──────────────────────────────────────────

// ── Revoke confirm dialog ─────────────────────────────────────


// ── Single key row ────────────────────────────────────────────

// ── Ephemeral token section ───────────────────────────────────

// ── Page ──────────────────────────────────────────────────────

export default function ApiKeys() {
  const { selectedProject } = useProject()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Fetch keys on project selection ──────────────────────────
  useEffect(() => {
    if (!selectedProject?.project_id) {
      setKeys([])
      return
    }

    const loadKeys = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listApiKeys(selectedProject.project_id)
        setKeys(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load API keys"
        setError(message)
        console.error("Error fetching keys:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadKeys()
  }, [selectedProject?.project_id])

  const activeKeys = keys.filter(k => !k.revoked)
  const revokedKeys = keys.filter(k => k.revoked)

  // ── Handle create key ────────────────────────────────────────
  async function handleCreate(data: CreateKeyForm) {
    if (!selectedProject?.project_id) {
      setError("No project selected")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await createApiKey(selectedProject.project_id, {
        label: data.label,
        key_type: data.key_type,
        rate_limit_rpm: data.rate_limit_rpm,
      })

      // Add the new key to the list (without raw key)
      const newKey: ApiKey = {
        key_id: response.key_id,
        key_prefix: response.key_prefix,
        key_type: response.key_type,
        label: response.label,
        rate_limit_rpm: response.rate_limit_rpm,
        revoked: false,
        created_at: response.created_at,
        last_used_at: null,
      }

      // Create the revealed key object (with raw key)
      const revealed: CreatedKey = {
        key_id: response.key_id,
        raw_key: response.raw_key,
        key_prefix: response.key_prefix,
        key_type: response.key_type,
        label: response.label,
        rate_limit_rpm: response.rate_limit_rpm,
        created_at: response.created_at,
      }

      setKeys((prev) => [newKey, ...prev])
      setShowCreate(false)
      setCreatedKey(revealed)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create key"
      setError(message)
      console.error("Error creating key:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle revoke key ────────────────────────────────────────
  async function handleRevoke(key: ApiKey) {
    if (!selectedProject?.project_id) {
      setError("No project selected")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await revokeApiKey(selectedProject.project_id, key.key_id)
      setKeys((prev) =>
        prev.map((k) =>
          k.key_id === key.key_id ? { ...k, revoked: true } : k
        )
      )
      setRevokeTarget(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke key"
      setError(message)
      console.error("Error revoking key:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="m-10 max-w-3xl space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <EphemeralTokenSection keys={keys} />
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