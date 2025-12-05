"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event, context) => {
    console.log('Debug function called with:', {
        httpMethod: event.httpMethod,
        path: event.path,
        queryStringParameters: event.queryStringParameters,
        headers: event.headers,
        body: event.body
    });
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Debug function working!',
            event: {
                httpMethod: event.httpMethod,
                path: event.path,
                queryStringParameters: event.queryStringParameters,
                headers: Object.keys(event.headers),
                bodyLength: event.body?.length || 0
            },
            timestamp: new Date().toISOString()
        })
    };
};
exports.handler = handler;
