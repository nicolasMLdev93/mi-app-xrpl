export declare const config: {
    port: string | number;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    db: {
        username: string;
        password: string;
        database: string;
        host: string;
        port: number;
        dialect: "mysql";
    };
};
export declare const XRPL_TESTNET = "wss://s.altnet.rippletest.net:51233";
export declare const RLUSD_ISSUER = "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV";
export declare const RLUSD_CURRENCY = "RLUSD";
