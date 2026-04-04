import z from "zod"
import { Tool } from "./tool"
import { Question } from "../question"
import DESCRIPTION from "./question.txt"

export const QuestionTool = Tool.define("question", {
  description: DESCRIPTION,
  parameters: z.object({
    questions: z.array(Question.Info.omit({ custom: true })).describe("Questions to ask"),
  }),
  async execute(params, ctx) {
    const answers = await Question.ask({
      sessionID: ctx.sessionID,
      questions: params.questions,
      tool: ctx.callID ? { messageID: ctx.messageID, callID: ctx.callID } : undefined,
    })

    function format(answer: Question.Answer | undefined, question: (typeof params.questions)[number]) {
      if (!answer?.length) return "Unanswered"
      const labels = new Set(question.options.map((o) => o.label))
      const selected = answer.filter((a) => labels.has(a))
      const notes = answer.filter((a) => !labels.has(a))
      const parts: string[] = []
      if (selected.length) parts.push(selected.join(", "))
      if (notes.length) parts.push(`(note: ${notes.join(", ")})`)
      if (!parts.length) return "Unanswered"
      return parts.join(" ")
    }

    const formatted = params.questions.map((q, i) => `"${q.question}"="${format(answers[i], q)}"`).join(", ")

    return {
      title: `Asked ${params.questions.length} question${params.questions.length > 1 ? "s" : ""}`,
      output: `User has answered your questions: ${formatted}. You can now continue with the user's answers in mind.`,
      metadata: {
        answers,
      },
    }
  },
})
