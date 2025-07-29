import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import "dotenv/config";


// init arcjet

export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        //shield requests from bots
        shield({ mode: "LIVE" }),
        //rate limit requests to 10 per minute
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                //see the full list at https://docs.arcjet.io/docs/arcjet-node#categories
            ]
        }),
        //rate limit requests to 5 per 10 seconds

        tokenBucket({
            mode: "LIVE",
            refillRate: 5,
            capacity: 10,
            interval: 10,
            capacity: 10,
        }),
    ]

});
