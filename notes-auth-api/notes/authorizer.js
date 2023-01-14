const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
  // coginito User Pool Id
  userPoolId: COGNITO_USERPOOL_ID,
  // id 토큰과 access 토큰 이있다.
  tokenUse: "id",
  // 앱 clientId
  clientId: COGNITO_WEB_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
  let authReponse = {};
  authReponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: "execute-api:Invoke",
        },
      ],
    };
    authReponse.policyDocument = policyDocument;
  }
  // 해당 authroizer를 사용하는 람다함수는 아래 context를 event에서 추출할 수 있다.
  authReponse.context = {
    foo: "bar",
  };
  console.log(JSON.stringify(authReponse));
  return authReponse;
};

exports.handler = async (event, context, callback) => {
  // 클라이언트 헤더의 토큰을 변수에 저장
  let token = event.authorizationToken;
  try {
    const payload = await jwtVerifier.verify(token);
    console.log(JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (err) {
    callback("Error: Invalid token");
  }
};

// exports.handler = (event, context, callback) => {
//   // 클라이언트 헤더의 토큰을 변수에 저장
//   let token = event.authorizationToken;
//   switch (token) {
//     case "allow":
//       callback(null, generatePolicy("user", "Allow", event.methodArn));
//       break;
//     case "deny":
//       callback(null, generatePolicy("user", "Deny", event.methodArn));
//       break;
//     default:
//       callback("Error: Invalid token");
//   }
// };
