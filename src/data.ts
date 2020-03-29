import json from '../data/data.json'

export interface Node {
  type: 'list'
  width: number
  x: number
  y: number
  title: string
  children?: {
    [id: string]: NodeChild }
  requires?: string[]
}

export interface NodeChild {
  label: string
  status: Status
  href?: string
  port?: string
  requires?: string[]
}

export type Status =
  | 'blocked'
  | 'unassigned'
  | 'assigned'
  | 'complete'

export type Side =
  | 'north'
  | 'east'
  | 'south'
  | 'west'

export interface Connection {
  from: string
  fromSide: Side
  to: string
  toSide: Side
  points?: ConnectPoint[]
}

export interface ConnectPoint {
  x: number
  y: number
  relative?: 'from' | 'to'
}

export interface JsonData {
  canvas: {
    width: number
    height: number }
  nodes: {
    [id: string]: Node }
  connections: {
    [id: string]: Connection }
}

export function getData(): JsonData {
  return json as JsonData
}
