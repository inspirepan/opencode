import { createSignal } from "solid-js"
import type { IconProps } from "@opencode-ai/ui/icon"

export type Example = { label: string; query: string }

export type Starter = {
  id: string
  icon: IconProps["name"]
  title: string
  description: string
  examples: Example[]
  color?: { icon: string; bg: string }
}

export type DandelionMode = "chat" | "agent" | "image"

export const [activeStarter, setActiveStarter] = createSignal<Starter | null>(null)

export const starters: Record<DandelionMode, Starter[]> = {
  chat: [
    {
      id: "writing",
      icon: "pencil-line",
      color: { icon: "#9A6700", bg: "#FEF7E0" },
      title: "dandelion.starter.writing.title",
      description: "dandelion.starter.writing.description",
      examples: [
        { label: "dandelion.starter.writing.label1", query: "dandelion.starter.writing.query1" },
        { label: "dandelion.starter.writing.label2", query: "dandelion.starter.writing.query2" },
        { label: "dandelion.starter.writing.label3", query: "dandelion.starter.writing.query3" },
      ],
    },
    {
      id: "analysis",
      icon: "glasses",
      color: { icon: "#3E63DD", bg: "#EDF2FE" },
      title: "dandelion.starter.analysis.title",
      description: "dandelion.starter.analysis.description",
      examples: [
        { label: "dandelion.starter.analysis.label1", query: "dandelion.starter.analysis.query1" },
        { label: "dandelion.starter.analysis.label2", query: "dandelion.starter.analysis.query2" },
        { label: "dandelion.starter.analysis.label3", query: "dandelion.starter.analysis.query3" },
      ],
    },
    {
      id: "brainstorm",
      icon: "brain",
      color: { icon: "#7048C6", bg: "#F0EDFE" },
      title: "dandelion.starter.brainstorm.title",
      description: "dandelion.starter.brainstorm.description",
      examples: [
        { label: "dandelion.starter.brainstorm.label1", query: "dandelion.starter.brainstorm.query1" },
        { label: "dandelion.starter.brainstorm.label2", query: "dandelion.starter.brainstorm.query2" },
        { label: "dandelion.starter.brainstorm.label3", query: "dandelion.starter.brainstorm.query3" },
      ],
    },
  ],
  agent: [
    {
      id: "webpage",
      icon: "window-cursor",
      color: { icon: "#0A7EA4", bg: "#E8F8FB" },
      title: "dandelion.starter.webpage.title",
      description: "dandelion.starter.webpage.description",
      examples: [
        { label: "dandelion.starter.webpage.label1", query: "dandelion.starter.webpage.query1" },
        { label: "dandelion.starter.webpage.label2", query: "dandelion.starter.webpage.query2" },
        { label: "dandelion.starter.webpage.label3", query: "dandelion.starter.webpage.query3" },
      ],
    },
    {
      id: "pptx",
      icon: "presentation",
      color: { icon: "#C4432B", bg: "#FEEFEC" },
      title: "dandelion.starter.pptx.title",
      description: "dandelion.starter.pptx.description",
      examples: [
        { label: "dandelion.starter.pptx.label1", query: "dandelion.starter.pptx.query1" },
        { label: "dandelion.starter.pptx.label2", query: "dandelion.starter.pptx.query2" },
        { label: "dandelion.starter.pptx.label3", query: "dandelion.starter.pptx.query3" },
      ],
    },
    {
      id: "xlsx",
      icon: "table",
      color: { icon: "#1A7F4B", bg: "#ECFAF1" },
      title: "dandelion.starter.xlsx.title",
      description: "dandelion.starter.xlsx.description",
      examples: [
        { label: "dandelion.starter.xlsx.label1", query: "dandelion.starter.xlsx.query1" },
        { label: "dandelion.starter.xlsx.label2", query: "dandelion.starter.xlsx.query2" },
        { label: "dandelion.starter.xlsx.label3", query: "dandelion.starter.xlsx.query3" },
      ],
    },
    {
      id: "files",
      icon: "folder",
      color: { icon: "#9A6700", bg: "#FEF7E0" },
      title: "dandelion.starter.files.title",
      description: "dandelion.starter.files.description",
      examples: [
        { label: "dandelion.starter.files.label1", query: "dandelion.starter.files.query1" },
        { label: "dandelion.starter.files.label2", query: "dandelion.starter.files.query2" },
        { label: "dandelion.starter.files.label3", query: "dandelion.starter.files.query3" },
      ],
    },
    {
      id: "infographic",
      icon: "shapes",
      color: { icon: "#7048C6", bg: "#F0EDFE" },
      title: "dandelion.starter.infographic.title",
      description: "dandelion.starter.infographic.description",
      examples: [
        { label: "dandelion.starter.infographic.label1", query: "dandelion.starter.infographic.query1" },
        { label: "dandelion.starter.infographic.label2", query: "dandelion.starter.infographic.query2" },
        { label: "dandelion.starter.infographic.label3", query: "dandelion.starter.infographic.query3" },
      ],
    },
    {
      id: "poster",
      icon: "shopping-bag",
      color: { icon: "#C4255D", bg: "#FEECF0" },
      title: "dandelion.starter.poster.title",
      description: "dandelion.starter.poster.description",
      examples: [
        { label: "dandelion.starter.poster.label1", query: "dandelion.starter.poster.query1" },
        { label: "dandelion.starter.poster.label2", query: "dandelion.starter.poster.query2" },
        { label: "dandelion.starter.poster.label3", query: "dandelion.starter.poster.query3" },
      ],
    },
  ],
  image: [
    {
      id: "photo",
      icon: "photo",
      color: { icon: "#3E63DD", bg: "#EDF2FE" },
      title: "dandelion.starter.photo.title",
      description: "dandelion.starter.photo.description",
      examples: [
        { label: "dandelion.starter.photo.label1", query: "dandelion.starter.photo.query1" },
        { label: "dandelion.starter.photo.label2", query: "dandelion.starter.photo.query2" },
        { label: "dandelion.starter.photo.label3", query: "dandelion.starter.photo.query3" },
      ],
    },
    {
      id: "remix",
      icon: "edit",
      color: { icon: "#12A594", bg: "#E7FAF4" },
      title: "dandelion.starter.remix.title",
      description: "dandelion.starter.remix.description",
      examples: [
        { label: "dandelion.starter.remix.label1", query: "dandelion.starter.remix.query1" },
        { label: "dandelion.starter.remix.label2", query: "dandelion.starter.remix.query2" },
        { label: "dandelion.starter.remix.label3", query: "dandelion.starter.remix.query3" },
      ],
    },
  ],
}
