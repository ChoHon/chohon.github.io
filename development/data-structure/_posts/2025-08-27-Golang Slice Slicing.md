---
title: "Golang Slice Slicing"
categories:
  - development
  - data-structure
tags:
  - Golang
  - 자료구조
last_modified_at: 2025-08-27
toc: true
---

## Golang Slice Slicing

### 선형 자료구조 구현 방법

Stack과 Queue와 같은 선형 자료구조를 구현할 때 Linked List를 쓰는 방법과 Array를 사용하는 방법이 있다

Linked List를 사용하면 삽입과 삭제가 O(1)로 동작하는 대신 특정 요소에 접근하는데 O(n) 시간 복잡도를 가진다

Array를 사용하면 특정 요소에 접근하는데 인덱싱을 사용하기 때문에 O(1)으로 동작한다

삽입과 삭제를 하는게 O(n) 시간 복잡도를 갖게 되고 예상보다 많은 요소가 들어올 경우 배열의 크기를 늘리기 위한 재할당과 같은 오버헤드가 발생한다

두 방법은 각각 장단점을 갖기 때문에 사용되는 곳에서 삽입, 삭제가 자주 일어나는지, 조회가 자주 일어나는지 등에 따라 더 좋은 방법을 선택해야 한다

### Queue 구현

기존에 Linked List로 동작하는 Queue는 구현한 적 있다

Array 방식의 경우에는 golang slice와 기본 연산으로 구현할 수 있다

삽입의 경우 `append` 연산으로 간단하게 구현된다

삭제의 경우 `slice[0]` 값을 pop하고 `slice[1:]`와 같은 slicing을 통해 배열 내에서 첫번째 요소를 삭제하는 방식으로 구현할 수 있다

이 부분에서 Golang Slice에 대한 Slicin이 어떤 방식으로 동작하는지, 시간 복잡도가 어떻게 되는지 궁금증이 생겼다

### Golang Slice 구조

기본적으로 golang array의 경우 다른 언어처럼 연속된 메모리 공간으로 구현된 값의 집합이다

slice의 경우 내부 배열 포인터, 길이, 용량으로 구성되어 있다

```go
type slice struct {
    array   unsafe.Pointer    // 내부 배열 포인터
    len     int               // 길이 - 가지고 있는 데이터의 개수
    cap     int               // 용량 - 현재 내부 배열의 크기
}
```

### Slicing

slice에 대해 slicing을 진행하면 같은 원본 slice의 내부 배열 메모리를 바라보는 새로운 slice를 만드는 방식으로 진행된다

시작 인덱스의 포인터 값을 `array`로 갖고 slicing의 요소 개수를 `len`으로 가지는 새로운 slice가 만들어진다

즉 실질적으로 데이터 복사로 새로운 배열이 만들어지는 것이 아니라 기존의 배열을 보는 형태가 바뀔 뿐이다

이와 같은 동작은 원본과 slicing 배열이 같은 내부 배열을 참조하기 때문에 한쪽에서 데이터 수정이 반대쪽에도 영향을 미치는지를 통해 확인할 수 있다

```go
	a := make([]int, 10, 20)
	for i := range 10 {
		a[i] = i * 10
	}

	b := a[5:]
	b[2] = -100

	fmt.Println(a)
	fmt.Println(b)
```

결과

```bash
[0 10 20 30 40 50 60 -100 80 90]
[50 60 -100 80 90]
```

계속해서 원본과 slicing한 slice가 같은 내부 배열을 참조하는 것은 아니다

slice의 기본 동작으로 요소 추가로 인해 slice의 용량을 벗어나게 되면 내부 배열의 재할당이 이루어진다

이 과정이 진행되면 원본과 slicing한 slice가 서로 다른 배열을 참조하게 될 수도 있다

어쨋든 이와 같이 동작하기 때문에 slicing의 시간 복잡도는 O(1)이 된다
