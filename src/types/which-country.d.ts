declare module 'which-country' {
  /**
   * Returns the ISO 3166-1 alpha-3 country code for the given coordinates.
   * @param coordinates An array of [longitude, latitude]
   * @returns The 3-letter ISO code or null if no country is found.
   */
  function wc(coordinates: [number, number]): string | null;
  export default wc;
}
