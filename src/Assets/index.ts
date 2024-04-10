import StellarSdk from "stellar-sdk";

const STELLAR_SCHEME = "stellar";
const FIAT_SCHEME = "iso4217";

export const createAssetId = (id, scheme) => ({
  id,
  scheme,
  sep38: `${scheme}:${id}`,
});

export const createStellarAssetId = (code, issuer) => ({
  ...createAssetId(`${code}:${issuer}`, STELLAR_SCHEME),
  code,
  issuer,
  toAsset: () => {
    try {
      if (id === "native") {
        return new StellarSdk.Asset("XLM");
      }
      return new StellarSdk.Asset(code, issuer);
    } catch (error) {
      console.error("Error converting to Stellar Asset:", error);
      throw new Error("Failed to convert to Stellar Asset");
    }
  },
});

export const createIssuedAssetId = (code, issuer) => ({
  ...createStellarAssetId(code, issuer),
  toString: () => sep38,
});

export const createNativeAssetId = () => ({
  ...createStellarAssetId("XLM", "native"),
});

export const createFiatAssetId = (code) => ({
  ...createAssetId(code, FIAT_SCHEME),
  toString: () => sep38,
});

// Example usage:

const stellarAsset = createStellarAssetId("USD", "issuer123");
console.log(stellarAsset.toAsset());

const issuedAsset = createIssuedAssetId("USD", "issuer123");
console.log(issuedAsset.toString());

const nativeAsset = createNativeAssetId();
console.log(nativeAsset.toAsset());

const fiatAsset = createFiatAssetId("USD");
console.log(fiatAsset.toString());
