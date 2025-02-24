import { BarChart, PieChart } from "lucide-react"

export interface GraphType {
  id: number
  name: string
  icon: any // Using any for now, but in a real app you'd want to properly type this
  component: string // This would be the actual component in your app
  description: string
}

export const GRAPH_TYPES: GraphType[] = [
  {
    id: 1,
    name: "Bar Chart",
    icon: BarChart,
    component: "BarChart",
    description: "Display poll results in a vertical bar chart"
  },
  {
    id: 2,
    name: "Pie Chart",
    icon: PieChart,
    component: "PieChart",
    description: "Show poll results in a circular pie chart"
  }
]

export const DEFAULT_GRAPH_ID = 1
