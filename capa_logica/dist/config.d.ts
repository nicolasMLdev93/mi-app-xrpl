export declare const config: {
    port: string | number;
    nodeEnv: string;
    jwtSecret: string | undefined;
    jwtExpiresIn: string | undefined;
    db: {
        username: string;
        password: string;
        database: string;
        host: string;
        port: number;
        dialect: "mysql";
    };
};
