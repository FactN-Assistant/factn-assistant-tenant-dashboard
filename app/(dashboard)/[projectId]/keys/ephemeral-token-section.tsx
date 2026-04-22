import CopyButton from "@/components/copy-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { type ApiKey, type MintedToken, type MintTokenForm } from "@/lib/schemas/key-schemas"
import { useKeys } from "@/hooks/useKeys"
import { CheckCircle2, ChevronDown, Globe, Info, Key, RefreshCw, Server, Zap, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function EphemeralTokenSection({ keys, projectId }: { keys: ApiKey[]; projectId: string }) {
  const { mintTokenMutation, rotateTokenMutation } = useKeys(projectId)

  const [open, setOpen] = useState(false)
  const [mintedToken, setMintedToken] = useState<MintedToken | null>(null)
  const [selectedKeyId, setSelectedKeyId] = useState<string>("")
  const [secretKeyInput, setSecretKeyInput] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)

  const { register, handleSubmit, reset } = useForm<MintTokenForm>({
    defaultValues: { ttl_seconds: 60, metadata_raw: "" },
  })

  const secretKeys = keys.filter(k => k.key_type === "secret" && !k.revoked)
  const selectedKey = keys.find(k => k.key_id === selectedKeyId)

  const minting = mintTokenMutation.isPending
  const rotating = rotateTokenMutation.isPending

  async function onMint(data: MintTokenForm) {
    if (!selectedKeyId || !secretKeyInput.trim()) return

    // Parse metadata lines: "key=value" per line
    const metadata: Record<string, string> = {}
    data.metadata_raw.split("\n").forEach(line => {
      const [k, ...rest] = line.split("=")
      if (k?.trim()) metadata[k.trim()] = rest.join("=").trim()
    })

    const response = await mintTokenMutation.mutateAsync({
      secretKey: secretKeyInput.trim(),
      ttl_seconds: data.ttl_seconds,
      metadata,
    })
    setMintedToken(response)
  }

  async function onRotate() {
    if (!secretKeyInput.trim() || !mintedToken) return

    const response = await rotateTokenMutation.mutateAsync({
      secretKey: secretKeyInput.trim(),
      current_token: mintedToken.ephemeral_token,
      ttl_seconds: mintedToken.ttl_seconds,
    })
    setMintedToken(response)
  }

  function clearToken() {
    setMintedToken(null)
    reset()
  }

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Ephemeral Tokens</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Single-use, short-lived tokens for browser WebSocket connections
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-5">
            <Separator />

            {/* How it works */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { step: "1", icon: Server,  text: "Your backend calls POST /v1/tokens with a secret key" },
                  { step: "2", icon: Zap,     text: "Platform stores a single-use token in Redis with a TTL" },
                  { step: "3", icon: Globe,   text: "Pass the token to the browser (never the raw secret key)" },
                  { step: "4", icon: Key,     text: "Browser connects via WebSocket — token is atomically deleted on use" },
                ].map(({ step, icon: Icon, text }) => (
                  <div key={step} className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{step}</span>
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 px-3 py-2">
                <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Ephemeral tokens ensure your <strong>secret keys never reach the browser</strong>.
                  They are single-use — a second connection attempt with the same token is rejected with close code 4005.
                  You can rotate a token before it expires using the rotate button.
                </p>
              </div>
            </div>

            <Separator />

            {/* Mint a token */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mint a token</p>

              {secretKeys.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-5 text-center">
                  <Server className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active secret keys found.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Create a <strong>secret</strong> (<code className="text-[10px]">sk_live_...</code>) key above to mint tokens.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onMint)} className="space-y-4">
                  {/* Secret key input */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Your secret key</Label>
                    <div className="relative">
                      <Input
                        type={showSecretKey ? "text" : "password"}
                        placeholder="sk_live_..."
                        value={secretKeyInput}
                        onChange={(e) => setSecretKeyInput(e.target.value)}
                        className="font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecretKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste the secret key you created above. It's used only to authenticate this request and is never stored.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* TTL */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">TTL (seconds)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={300}
                        {...register("ttl_seconds", { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">1–300 s. Default: 60 s.</p>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">Metadata (optional)</Label>
                      <textarea
                        className="w-full rounded-md border bg-background px-3 py-2 text-xs font-mono resize-none min-h-15.5 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder={"user_id=u_123\nlocale=en"}
                        {...register("metadata_raw")}
                      />
                      <p className="text-xs text-muted-foreground">One <code>key=value</code> per line. Max 10 pairs.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="gap-1.5" disabled={minting || !secretKeyInput.trim()}>
                      {minting
                        ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Minting…</>
                        : <><Zap className="h-3.5 w-3.5" /> Mint token</>
                      }
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Minted token result */}
            {mintedToken && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minted token</p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={clearToken}>
                      Clear
                    </Button>
                  </div>

                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300 text-xs">
                      Token minted successfully. Pass it to the browser — it expires in{" "}
                      <strong>{mintedToken.ttl_seconds}s</strong> and can only be used <strong>once</strong>.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ephemeral token</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={mintedToken.ephemeral_token}
                          className="font-mono text-xs bg-muted"
                        />
                        <CopyButton text={mintedToken.ephemeral_token} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Expires at</p>
                        <p className="font-mono">{new Date(mintedToken.expires_at * 1000).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">TTL</p>
                        <p className="font-mono">{mintedToken.ttl_seconds}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Project</p>
                        <p className="font-mono truncate">{mintedToken.project_id}</p>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted px-3 py-2 space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Connect with</p>
                      <code className="text-xs break-all">
                        wss://host/v1/chat?token={mintedToken.ephemeral_token}
                      </code>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={onRotate} disabled={rotating || !secretKeyInput.trim()}>
                        {rotating
                          ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Rotating…</>
                          : <><RefreshCw className="h-3.5 w-3.5" /> Rotate token</>
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}