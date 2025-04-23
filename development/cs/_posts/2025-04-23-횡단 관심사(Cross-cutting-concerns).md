---
title: "Cross-cutting Concerns"
categories:
  - development
  - cs
tags:
  - Backend
last_modified_at: 2025-04-23
toc: true
---

## Cross-cutting Concerns

### 의미

횡단 관심사 혹은 공통관심사항 등으로 불리는 Cross-cutting Concerns는

- 여러 서비스에 걸쳐서 동작해야 하는 코드
- 애플리케이션 내 여러 핵심 비지니스 로직들에 걸쳐서 실행되어야 하는 동작

을 말한다

관심사의 분리 측면에서 보면 Cross-cutting Concerns는 애플리케이션의 다른 부분과 깨끗하게 분리되지 못하는 경우가 많으며 코드 중복되거나 의존성 문제가 생길 수 있다
  
### 예시

- 인증
- 로깅
- 트랜잭션
- 에러 핸들링
