# Rest API CRUD

## 람다 최적화

### 1. context.callbackWaitsForEmptyEventLoop 사용

- nodejs의 이벤트 루프로 인해 cb는 await documentClient.put(params).promise() 끝난 후 결과를 제공한다. 이때 cb는 기다리지 않고 바로 호출 가능하다.
- 각 람다함수에 context.callbackWaitsForEmptyEventLoop = false; 사용

### 2. http 커넥션 유지

- sdk 사용에 따라 http요청(dynamoDB)을 하게 되고 핸드쉐이크 과정이 발생한다.
  해결책 http keep alive 사용 ~ 이전에 열린 연결을 재사용
- 환경변수에 AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1 적용

### 타임아웃 설정

- API gateWay -> Lambda -> dynamoDB로 이어지는 과정에서 동기적으로 처리된다.
- API gateWay의 시간초과 제한이 29초라면 뒷단에 lambda와 dynamoDB도 시간초과를 설정한다.
- dynamoDB sdk는 다음과 같은 옵션을 제공한다.
  maxRetries: 3,
  httpOptions: {
  timeout: 5000,
  },
