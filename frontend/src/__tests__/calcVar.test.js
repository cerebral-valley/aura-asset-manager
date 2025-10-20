import { calcVar } from '../utils/varLite'

const sampleAssets = [
  { weight: 50, sigma: 0.15 },
  { weight: 30, sigma: 0.08 },
  { weight: 20, sigma: 0.05 },
]

describe('calcVar', () => {
  const portValue = 1_000_000

  test.each([
    ['1 day', 1],
    ['5 days', 5],
    ['21 days', 21],
    ['252 days', 252],
  ])('computes VaR for %s horizon', (_, horizon) => {
    const { varValue, varPercent } = calcVar({
      assets: sampleAssets,
      horizonDays: horizon,
      confLvl: 0.95,
      portValue,
    })

    expect(varValue).toBeGreaterThan(0)
    expect(varPercent).toBeGreaterThan(0)
    expect(varPercent).toBeLessThan(100)
  })
})
