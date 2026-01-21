declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
  }

  interface AmadeusResponse<T> {
    data: T;
    result: {
      data: T;
      dictionaries?: {
        carriers: Record<string, string>;
        aircraft: Record<string, string>;
        currencies: Record<string, string>;
        locations: Record<string, { cityCode: string; countryCode: string }>;
      };
    };
  }

  interface FlightOffersSearch {
    get(params: Record<string, string | number>): Promise<AmadeusResponse<unknown[]>>;
  }

  interface Shopping {
    flightOffersSearch: FlightOffersSearch;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: Shopping;
  }

  export default Amadeus;
}
