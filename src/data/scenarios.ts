import type { ScenarioType } from "../types/market";

export interface ScenarioConfig {
  type: ScenarioType;
  name: string;
  description: string;
  annualDrift: number;     // expected annual return (mu)
  volMultiplier: number;   // multiplier on ticker's base vol
  ivSchedule: "rising" | "falling" | "stable" | "crush" | "spike_then_crush";
}

const scenarios: Record<ScenarioType, ScenarioConfig> = {
  bull_rally: {
    type: "bull_rally",
    name: "Bull Rally",
    description: "Stock climbs steadily over the period with moderate volatility.",
    annualDrift: 0.40,
    volMultiplier: 0.9,
    ivSchedule: "stable",
  },
  bear_crash: {
    type: "bear_crash",
    name: "Bear Crash",
    description: "Stock drops sharply with spiking volatility.",
    annualDrift: -0.50,
    volMultiplier: 1.5,
    ivSchedule: "rising",
  },
  sideways: {
    type: "sideways",
    name: "Sideways Chop",
    description: "Stock goes nowhere — oscillates in a tight range.",
    annualDrift: 0.0,
    volMultiplier: 0.7,
    ivSchedule: "stable",
  },
  iv_crush: {
    type: "iv_crush",
    name: "IV Crush",
    description: "Volatility collapses after an event — stock barely moves but options lose value.",
    annualDrift: 0.05,
    volMultiplier: 0.5,
    ivSchedule: "crush",
  },
  gradual_decay: {
    type: "gradual_decay",
    name: "Gradual Decay",
    description: "Slow, grinding decline — like death by a thousand cuts.",
    annualDrift: -0.15,
    volMultiplier: 0.8,
    ivSchedule: "falling",
  },
};

export function getScenarioConfig(type: ScenarioType): ScenarioConfig {
  return scenarios[type];
}

export function getAllScenarios(): ScenarioConfig[] {
  return Object.values(scenarios);
}
