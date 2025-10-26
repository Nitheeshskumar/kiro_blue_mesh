"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Test function working!',
            method: event.httpMethod,
            path: event.path,
            timestamp: new Date().toISOString()
        })
    };
};
exports.handler = handler;
