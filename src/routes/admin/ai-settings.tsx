import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IconBrain, IconInfoCircle } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/admin/ai-settings')({ component: AiSettingsPage })

const modelEndpoints = [
  { label: 'OpenAI API', value: 'https://api.openai.com/v1' },
  { label: 'Ollama (local)', value: 'http://localhost:11434/v1' },
  { label: 'Custom endpoint', value: 'https://your-model.example.com/v1' },
]

function AiSettingsPage() {
  const [modelUrl, setModelUrl] = useState(modelEndpoints[0].value)

  return (
    <main className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <IconBrain className="size-5 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight">AI settings</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the model service endpoint for AI features.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model endpoint</CardTitle>
          <CardDescription>Select the URL that should be used for model requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="model-endpoint">Model URL</Label>
          <Select value={modelUrl} onValueChange={setModelUrl}>
            <SelectTrigger id="model-endpoint" className="w-full sm:max-w-lg">
              <SelectValue placeholder="Choose a model URL" />
            </SelectTrigger>
            <SelectContent>
              {modelEndpoints.map((endpoint) => (
                <SelectItem key={endpoint.value} value={endpoint.value}>
                  {endpoint.label} — {endpoint.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <IconInfoCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            This selection is a UI preview and is not saved or connected to model requests yet.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
