# API GateWay Access Control

### 1. API Key 적용

- API 키 생성 및 사용 플랜 적용
  참고 : https://blog.shikisoft.com/controlling-usage-with-api-keys-and-usage-plans-on-aws-api-gateway/
- 원하는 api의 메서드 API Key 활성화
- 일반적으로 인증으로 추천하지는 않지만, 일일 스로틀링을 제한할때 유용하다. 즉 하루 요청 수 등을 제한할 수 있다.
- 마이크로서비스에 내부 간 API 접근을 위해 사용하기도 한다.

### 2. Lambda Authorizer

- API GateWay에서 바로 해당 트리거 람다를 호출하는게 아닌 별도의 Auth 함수를 호출
- 클라이언트는 헤더에 토큰을 담아서 API GateWay에 요청을 보내면, 해당 토큰을 Auth 함수에 전달하고 승인
- 또한 Auth 함수는 데이터베이스 호출이 필요한 트리거 함수에게 필요한 데이터를 전달할 수 있다.
- Auth 함수는 Policy를 리턴하며, 해당 정책을 캐시하므로 Auth함수 재호출 안함
- authorizer 함수 생성 및 yaml 파일에 등록

### 2. Cognito User Pool

- 클라이언트가 로그인 후 토큰을 제공하가 위해 Cognito 사용할 수 있다.
- 기타 소셜 로그인 시, Congnito를 통해 토큰을 발급할 수 있고 결국, 해당 토큰으로 Authorizer를 통해 정책을 받을 수 있다.
- Coginito 및 sdk 사용 시 node 14버전 적용
- Coginito 로그인 시 id_Token 발급 후, 해당 토큰을 Autorization 헤더에 보내면 authorizer 함수에서 jwt verify 후 정책 생성

#### 2-1. API GateWay 권한 부여자 Cognito 연결

- Api gateWay에서 직접 권한 부여자 생성하여 cognito userPool 토큰 기반의 인증을 쉽게 만들 수 있다. 이떄 yaml에 생성할 권한부여자 명과, arn(적용할 cogintio Arn)을 기입해야 한다. 또한 동일하게 해당 함수 event 파라미터에 autorizer coginito 유저 정보를 보내준다
