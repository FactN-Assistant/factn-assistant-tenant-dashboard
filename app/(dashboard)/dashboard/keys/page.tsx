"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Zap,
  Server,
  Globe,
  ChevronDown,
  Info,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ApiKey, CreatedKey, CreateKeyForm, MintedToken, MintTokenForm } from "@/lib/types"
import { MOCK_KEYS } from "@/lib/mock-data"
import KeyRow from "@/components/admin/key-row"
import CreateKeyModal from "./create-key-modal"
import KeyRevealModal from "./key-reveal-modal"
import RevokeDialog from "./revoke-dialog"
import CopyButton from "@/components/copy-button"
import EphemeralTokenSection from "./ephemeral-token-section"

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
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [showCreate, setShowCreate]     = useState(false)
  const [createdKey, setCreatedKey]     = useState<CreatedKey | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)

  const activeKeys  = keys.filter(k => !k.revoked)
  const revokedKeys = keys.filter(k =>  k.revoked)

  function handleCreate(data: CreateKeyForm) {
    // Replace with: POST /v1/projects/{id}/keys
    const mockRawKey = `${data.key_type === "publishable" ? "pk" : "sk"}_live_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 22)}`
    const prefix = mockRawKey.slice(0, 12)

    const newKey: ApiKey = {
      key_id:         crypto.randomUUID(),
      key_prefix:     prefix,
      key_type:       data.key_type,
      label:          data.label,
      rate_limit_rpm: data.rate_limit_rpm,
      revoked:        false,
      created_at:     new Date().toISOString(),
      last_used_at:   null,
    }

    const revealed: CreatedKey = {
      key_id:         newKey.key_id,
      raw_key:        mockRawKey,
      key_prefix:     prefix,
      key_type:       data.key_type,
      label:          data.label,
      rate_limit_rpm: data.rate_limit_rpm,
      created_at:     newKey.created_at,
    }

    setKeys(prev => [newKey, ...prev])
    setShowCreate(false)
    setCreatedKey(revealed)

    console.log("Key created:", { key_id: newKey.key_id, prefix, type: data.key_type })
  }

  function handleRevoke(key: ApiKey) {
    // Replace with: DELETE /v1/projects/{id}/keys/{key_id}
    setKeys(prev => prev.map(k =>
      k.key_id === key.key_id ? { ...k, revoked: true } : k
    ))
    setRevokeTarget(null)
    console.log("Key revoked:", key.key_id)
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
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New key
        </Button>
      </div>

      {/* Active keys */}
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
              <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowCreate(true)}>
                <Plus className="h-3.5 w-3.5" /> Create your first key
              </Button>
            </div>
          ) : (
            activeKeys.map(key => (
              <KeyRow key={key.key_id} apiKey={key} onRevoke={() => setRevokeTarget(key)} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Ephemeral tokens */}
      <EphemeralTokenSection keys={keys} />

      {/* Revoked keys (collapsible) */}
      {revokedKeys.length > 0 && (
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
                {revokedKeys.map(key => (
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