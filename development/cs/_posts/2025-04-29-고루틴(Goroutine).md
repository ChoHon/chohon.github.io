---
title: "고루틴(Goroutine)"
categories:
  - development
  - cs
tags:
  - Backend
  - Golang
last_modified_at: 2025-04-29
toc: true
---

## 고루틴이란?

고루틴(Goroutine)은 Golang에서 사용 가능한 경량 실행 스레드(lightweight thread of execution) 구현체이다

고루틴은 OS 스레드가 아니라 스레드를 추상화한 것이다

그렇기 때문에 OS 스레드 하나에 여러 고루틴이 할당 될 수도 있다

또한 OS의 스케줄러가 아닌 별도의 스케줄러이 있다

이렇게 OS 스레드와 고루틴 할당 및 스케줄링 관리를 하는 것이 `Go Runtime`

이와 같은 형태를 `GMP`(Goroutine, Machine, Processor) 모델이라고 부른다

### GMP 모델

- G(Goroutine)
- P는 Processor로 `Go Runtime`이 관리하는 추상화된 실행 컨텍스트
  - 고루틴의 실행 컨텍스트를 제공
  - 고루틴 큐를 관리
  - 한 번에 하나의 M과만 연결 가능
  - CPU 코어 수만큼 생성
  
- M은 OS Thread로 OS에서 관리하고 스케줄링하는 실제 실행 단위
  - 실제 CPU에서 코드를 실행
  - P와 연결되어 고루틴을 실행
  - 필요에 따라 동적으로 생성/소멸
  - 시스템 콜 등 블로킹 작업 처리

#### 예시

```golang
func main() {
    // 4개의 고루틴 생성
    for i := 0; i < 4; i++ {
        go func() {
            // 작업 수행
        }()
    }
}
```

1. P는 CPU 코어 수만큼 생성
1. M은 필요에 따라 생성
1. G는 4개가 생성
1. P의 로컬 큐에 고루틴이 분배됨
1. M이 P와 연결되어 고루틴을 실행

### Go Scheduler

`Go Scheduler`는 2가지가 있다

- Global Run Queue(GRQ)
- Local Run Queue(LRQ)

각 P는 자신에게 할당된 G을 관리하는 로컬 큐(LRQ)를 갖는다

이러한 G들은 해당 P에 할당된 M 위에서 컨텍스트 스위칭을 통해 번갈아가며 실행된다

글로벌 큐에는 아직 P에 할당되지 않은 G들이 들어간다

```plaintext
G 생성 -> GRQ에 insert -> LRQ에 insert -> M에 의해 실행
```

### Context Switch

Goroutine의 Context Switch의 경우 커널이 아닌 유저 영역에서 실행된다

`Go Scheduler`는 선점형이 아닌 협력형 스케줄러이다

강제적인 스위칭이 아니라 자발적인 제어권 반납을 통한 Context Switch가 실행된다

그렇기 때문에 Context Switch를 위한 Event가 필요하다

다음과 같은 경우에 Context Switch가 일어난다

- 함수 호출 시
- 시스템 콜 발생 시
- 채널 연산 시
- `runtime.Gosched()` 호출 시
- 가비지 컬렉션 시
- `time.Sleep()` 호출 시

G에서 비동기 시스템 콜을 호출하면 P는 LRQ의 다른 G로 Context Switch를 실행한다

G에서 동기 시스템 콜을 호출하면 M까지 Block 된다

이 경우에는 P는 새로운 M을 만들어서 LRQ의 다른 G를 할당한다

### Reuse Thread and Work Stealing

고루틴 시스템에서 가장 피해야하는 상황은 M이 대기 상태가 되는 것이다

M가 대기 상태가 될 경우 OS가 M을 물리적 코어에서 빼버리면서 Thread 단위의 Context Switch가 발생하기 때문이다

P는 자신의 LRQ의 G를 모두 처리하면 할당된 M을 바로 OS에 반납하지 않는다

일정 시간 동안 idle 상태로 관리하거나 다른 P의 LRQ에서 G를 가져온다(`Work Stealing`)

물론 `Work Strealing`에도 Overhead가 있기 때문에 최소화해야 한다

### 성능

고루틴은 다음과 같은 장점을 갖는다

- Memory를 적게 소모한다
  - 고루틴은 스택에서 2KB 정도를 사용하고 필요에 따라 힙을 사용한다
  - Thread의 경우 1MB 정도 사용한다

- 생성/소멸 시 비용이 적다
  - Thread를 생성/소멸할 경우 리소스의 할당 혹은 반납 등의 추가 비용이 필요하다
  
- Context Switch Cost가 적다
  - 변경되는 자원 자체가 적다
  - **User <-> Kernal 전환이 없이 실행된다**

동일한 Thread와 코어에서 고루틴 간의 모든 처리나 메세지 전달 실행된다

OS 입장에서는 Thread는 한번도 대기 상태가 된 적이 없다

이는 **I/O Blocking 작업을 CPU Bound 작업으로 전환**한 것이다

`Go Scheduler`는 이를 위해 더 적은 Thread를 사용하고 한 Thread에서 최대한 많은 작업을 수행하고자 한다
