import { IconMessageChatbot } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomeIntroduction() {
  return (
    <section className="mx-auto flex w-full max-w-4xl items-center px-6 pt-12 pb-8 sm:px-10 sm:pt-16">
      <Card className="w-full border-0 bg-card/80 shadow-xl shadow-primary/5 ring-1 ring-border/70 backdrop-blur-sm sm:p-3">
        <CardHeader className="gap-4 sm:px-8 sm:pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700/70 dark:text-sky-300/75">
            BlueVoid · Evaluation workspace
          </p>
          <CardTitle className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your civil service evaluations, in one place.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed sm:text-lg">
            Manage evaluation forms, review progress, and keep track of the
            people and documents involved in each assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="sm:px-8 sm:pb-8">
          <div className="flex items-start gap-4 rounded-xl bg-primary/5 p-5 ring-1 ring-primary/10">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <IconMessageChatbot aria-hidden="true" className="size-5" />
            </span>
            <div className="space-y-1">
              <h2 className="font-semibold">Ready to get started?</h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Use the AI Assistant in the bottom-right corner to ask questions
                or tell it what you need. It can help you find evaluations,
                complete forms, and guide you through the rest of your work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
