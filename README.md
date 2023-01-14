# serverless-aws

서버리스 아키텍처 구축

### 1 lambda Fundamentals

1. Lambda Cold Starts

(1) Cold Start

- code Download
- start new excution environment

(2) Invocation

- excute initialization code
- excute handler code

(3) Cold Start 최소화

- Provision Concurrency를 사용하면 excute initialization code 과정을 유지하여 excute handler 과정만 진행할 수 있도록함. 단, 추가 요금 발생

### 미정 Using EventBridge for Extending the Architecture

- 쉽게 애플리케이션을 확장
- 이벤트 브리지는 SNS와 다르게 컨텐츠 기반 필터링하여 라우팅 가능
- 유저가 EventBridge -> SQS -> Lambda의 프로세스를 기다리는 과정은 길어 응답 시간이 길 수 있는데, EventBridge에서 front로 바로 응답을 해주고 뒷처리는 비동기 flow로 처리 가능하다.
- 람다 성공 시 이벤트를 생성하여 eventBridge에 해당 이벤트를 전송하여 성공에 대한 처리를 진행가능
- 람다 실패 시, DLG에 메시지를 보내고 해당 DLG에 람다를 연결하여 후속 처리 가능
- 람다 실행 시 사용하는 서버, DB가 다운되도, SQS에서 지속적으로 메시지를 보내는데, Cockatiel사용하여 circuitBreaker 패턴을 적용할 수 있다.

### 미정 StepFunctions

- 람다를 실행하는 작업이 상태에 따라 연속적일 경우, 예를들어 요청값 확인, 등록, S3업로드 등의 과정을 StepFunctions으로 해결할 수 있다.
- StepFunctions은 일련의 작업 실패 시, dynamoDB에 이미 데이터를 기록했던 내역을 쉽게 이전으로 rollback 할 수 있다.
- 결론적으로 StepFunctions을 사용하는 이유는 각 단계별 오류 추적을 쉽게 할 수 있기 때문이다. 만약 각 람다함수를 디커플링 후 eventBridge에 추가하고 재 호출 작업이 이루어진다면, 단계별 오류 추적이 어려워진다.
- express WorkFlow는 비동기식으로 진행되면 제한시간은 5분가량이다.
