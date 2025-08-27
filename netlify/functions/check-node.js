// netlify/functions/check-node.js

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      nodeVersion: process.version,
      runtime: process.env.AWS_LAMBDA_JS_RUNTIME || 'default',
    }),
  };
};
