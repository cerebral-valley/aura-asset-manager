/**
 * Calculate portfolio VaR using a diagonal covariance approximation.
 * @param {Object} params
 * @param {{weight:number,sigma:number}[]} params.assets
 * @param {number} params.horizonDays
 * @param {number} params.confLvl
 * @param {number} params.portValue
 * @returns {{varValue:number,varPercent:number}}
 */
export function calcVar({ assets = [], horizonDays = 1, confLvl = 0.95, portValue = 1 }) {
  const z = confLvl === 0.99 ? 2.33 : 1.65

  const sigmaAnnual = Math.sqrt(
    assets.reduce((sum, asset) => {
      const weight = (Number(asset.weight) || 0) / 100
      const sigma = Number(asset.sigma) || 0
      return sum + weight ** 2 * sigma ** 2
    }, 0),
  )

  const sigmaDaily = sigmaAnnual / Math.sqrt(252)
  const sigmaH = sigmaDaily * Math.sqrt(Math.max(1, horizonDays))
  const varValue = z * sigmaH * portValue
  const varPercent = portValue > 0 ? (varValue / portValue) * 100 : 0

  return { varValue, varPercent }
}

export default calcVar
