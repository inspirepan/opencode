import type { IconProps } from "@opencode-ai/ui/icon"

export type Starter = {
  id: string
  icon: IconProps["name"]
  title: string
  description: string
  examples: string[]
}

export type DandelionMode = "chat" | "agent" | "image"

export const starters: Record<DandelionMode, Starter[]> = {
  chat: [
    {
      id: "writing",
      icon: "pencil-line",
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
      icon: "task",
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
      icon: "review",
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
      icon: "checklist",
      title: "dandelion.starter.xlsx.title",
      description: "dandelion.starter.xlsx.description",
      examples: [
        "dandelion.starter.xlsx.example1",
        "dandelion.starter.xlsx.example2",
        "dandelion.starter.xlsx.example3",
      ],
    },
    {
      id: "pdf",
      icon: "open-file",
      title: "dandelion.starter.pdf.title",
      description: "dandelion.starter.pdf.description",
      examples: [
        "dandelion.starter.pdf.example1",
        "dandelion.starter.pdf.example2",
        "dandelion.starter.pdf.example3",
      ],
    },
    {
      id: "files",
      icon: "folder",
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
      title: "dandelion.starter.infographic.title",
      description: "dandelion.starter.infographic.description",
      examples: [
        "dandelion.starter.infographic.example1",
        "dandelion.starter.infographic.example2",
        "dandelion.starter.infographic.example3",
      ],
    },
  ],
  image: [
    {
      id: "photo",
      icon: "photo",
      title: "dandelion.starter.photo.title",
      description: "dandelion.starter.photo.description",
      examples: [
        "dandelion.starter.photo.example1",
        "dandelion.starter.photo.example2",
        "dandelion.starter.photo.example3",
      ],
    },
    {
      id: "design",
      icon: "models",
      title: "dandelion.starter.design.title",
      description: "dandelion.starter.design.description",
      examples: [
        "dandelion.starter.design.example1",
        "dandelion.starter.design.example2",
        "dandelion.starter.design.example3",
      ],
    },
    {
      id: "remix",
      icon: "edit",
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
