import type { ScenarioType } from "../types/market";

export interface ScenarioConfig {
  type: ScenarioType;
  name: string;
  description: string;
  totalMovePercent: number;   // guaranteed total price change (e.g. 0.15 = +15%, -0.25 = -25%)
  dailyNoisePercent: number;  // cosmetic noise magnitude (e.g. 0.008 = ±0.8% daily wiggle)
  ivSchedule: "rising" | "falling" | "stable" | "crush" | "spike_then_crush";
}

const scenarios: Record<ScenarioType, ScenarioConfig> = {
  bull_rally: {
    type: "bull_rally",
    name: "Bull Rally",
    description: "Stock climbs steadily over the period with moderate volatility.",
    totalMovePercent: 0.18,      // +18% over 3 months
    dailyNoisePercent: 0.008,
    ivSchedule: "stable",
  },
  bear_crash: {
    type: "bear_crash",
    name: "Bear Crash",
    description: "Stock drops sharply with spiking volatility.",
    totalMovePercent: -0.25,     // -25% over 3 months
    dailyNoisePercent: 0.012,
    ivSchedule: "rising",
  },
  sideways: {
    type: "sideways",
    name: "Sideways Chop",
    description: "Stock goes nowhere — oscillates in a tight range.",
    totalMovePercent: 0.0,       // net zero (sine wave handles the shape)
    dailyNoisePercent: 0.006,
    ivSchedule: "stable",
  },
  iv_crush: {
    type: "iv_crush",
    name: "IV Crush",
    description: "Volatility collapses after an event — stock barely moves but options lose value.",
    totalMovePercent: 0.03,      // tiny +3% drift
    dailyNoisePercent: 0.005,
    ivSchedule: "crush",
  },
  gradual_decay: {
    type: "gradual_decay",
    name: "Gradual Decay",
    description: "Slow, grinding decline — like death by a thousand cuts.",
    totalMovePercent: -0.12,     // -12% over 3 months
    dailyNoisePercent: 0.007,
    ivSchedule: "falling",
  },
};

export function getScenarioConfig(type: ScenarioType): ScenarioConfig {
  return scenarios[type];
}

export function getAllScenarios(): ScenarioConfig[] {
  return Object.values(scenarios);
}
