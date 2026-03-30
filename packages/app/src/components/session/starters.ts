import type { IconProps } from "@opencode-ai/ui/icon"

export type Starter = {
  id: string
  icon: IconProps["name"]
  title: string
  description: string
  examples: string[]
  color?: { icon: string; bg: string }
}

export type DandelionMode = "chat" | "agent" | "image"

export const starters: Record<DandelionMode, Starter[]> = {
  chat: [
    {
      id: "writing",
      icon: "pencil-line",
      color: { icon: "#B45309", bg: "#FEF3C7" },
      title: "dandelion.starter.writing.title",
      description: "dandelion.starter.writing.description",
      examples: [
        "dandelion.starter.writing.example1",
        "dandelion.starter.writing.example2",
        "dandelion.starter.writing.example3",
      ],
    },
    {
      id: "analysis",
      icon: "glasses",
      color: { icon: "#1D4ED8", bg: "#DBEAFE" },
      title: "dandelion.starter.analysis.title",
      description: "dandelion.starter.analysis.description",
      examples: [
        "dandelion.starter.analysis.example1",
        "dandelion.starter.analysis.example2",
        "dandelion.starter.analysis.example3",
      ],
    },
    {
      id: "brainstorm",
      icon: "brain",
      color: { icon: "#7C3AED", bg: "#EDE9FE" },
      title: "dandelion.starter.brainstorm.title",
      description: "dandelion.starter.brainstorm.description",
      examples: [
        "dandelion.starter.brainstorm.example1",
        "dandelion.starter.brainstorm.example2",
        "dandelion.starter.brainstorm.example3",
      ],
    },
  ],
  agent: [
    {
      id: "pptx",
      icon: "presentation",
      color: { icon: "#C43E1C", bg: "#FFF0EB" },
      title: "dandelion.starter.pptx.title",
      description: "dandelion.starter.pptx.description",
      examples: [
        "dandelion.starter.pptx.example1",
        "dandelion.starter.pptx.example2",
        "dandelion.starter.pptx.example3",
      ],
    },
    {
      id: "docx",
      icon: "document",
      color: { icon: "#2B579A", bg: "#EBF0FA" },
      title: "dandelion.starter.docx.title",
      description: "dandelion.starter.docx.description",
      examples: [
        "dandelion.starter.docx.example1",
        "dandelion.starter.docx.example2",
        "dandelion.starter.docx.example3",
      ],
    },
    {
      id: "xlsx",
      icon: "table",
      color: { icon: "#217346", bg: "#E8F5ED" },
      title: "dandelion.starter.xlsx.title",
      description: "dandelion.starter.xlsx.description",
      examples: [
        "dandelion.starter.xlsx.example1",
        "dandelion.starter.xlsx.example2",
        "dandelion.starter.xlsx.example3",
      ],
    },
    {
      id: "files",
      icon: "folder",
      color: { icon: "#92400E", bg: "#FEF3C7" },
      title: "dandelion.starter.files.title",
      description: "dandelion.starter.files.description",
      examples: [
        "dandelion.starter.files.example1",
        "dandelion.starter.files.example2",
        "dandelion.starter.files.example3",
      ],
    },
    {
      id: "infographic",
      icon: "shapes",
      color: { icon: "#7C3AED", bg: "#EDE9FE" },
      title: "dandelion.starter.infographic.title",
      description: "dandelion.starter.infographic.description",
      examples: [
        "dandelion.starter.infographic.example1",
        "dandelion.starter.infographic.example2",
        "dandelion.starter.infographic.example3",
      ],
    },
    {
      id: "poster",
      icon: "shopping-bag",
      color: { icon: "#BE123C", bg: "#FFE4E6" },
      title: "dandelion.starter.poster.title",
      description: "dandelion.starter.poster.description",
      examples: [
        "dandelion.starter.poster.example1",
        "dandelion.starter.poster.example2",
        "dandelion.starter.poster.example3",
      ],
    },
  ],
  image: [
    {
      id: "photo",
      icon: "photo",
      color: { icon: "#4338CA", bg: "#E0E7FF" },
      title: "dandelion.starter.photo.title",
      description: "dandelion.starter.photo.description",
      examples: [
        "dandelion.starter.photo.example1",
        "dandelion.starter.photo.example2",
        "dandelion.starter.photo.example3",
      ],
    },
    {
      id: "remix",
      icon: "edit",
      color: { icon: "#0D9488", bg: "#CCFBF1" },
      title: "dandelion.starter.remix.title",
      description: "dandelion.starter.remix.description",
      examples: [
        "dandelion.starter.remix.example1",
        "dandelion.starter.remix.example2",
        "dandelion.starter.remix.example3",
      ],
    },
  ],
}
