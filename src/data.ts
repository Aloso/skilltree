import json from '../data/data.json'

export interface Group {
  type: 'list'
  width: number
  x: number
  y: number
  title: string
  children?: {
    [id: string]: GroupChild }
  requires?: string[]
}

export interface GroupChild {
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
  groups: {
    [id: string]: Group }
  connections: {
    [id: string]: Connection }
}

export function getData(): JsonData {
  return json as JsonData
}
