---
title: "Golang Map"
categories:
  - development
  - cs
tags:
  - Backend
  - 자료구조
  - go
last_modified_at: 2025-06-11
toc: true
---

## 개요

```go
map[KeyType]ValueType
```

Key-Value 형태로 데이터를 저장하는 전형적인 Hash Map 형태의 자료구조

Map은 참조 타입이기 때문에 초기화 하지 않으면 `nil` 값을 갖는다

`nil` 값을 가진 Map은 읽기 시에는 빈 Map처럼 동작하지만 쓰기를 시도하면 런타임 오류가 발생한다

## 구조

![Go map]({{ site.url }}/assets/images/dev/cs/golang_map/01.svg)

```go
// Go Map의 Header Struct
type hmap struct {
    count int // 맵에 저장된 항목의 개수. len() 함수에서 사용됨
    B uint8   // 버킷의 개수를 나타내는 2의 지수. 최대 loadFactor * 2^B 개의 항목을 저장할 수 있음

    buckets unsafe.Pointer    // 2^B 개의 버킷 배열. count가 0일 경우 nil일 수 있음
    oldbuckets unsafe.Pointer // 이전 버킷 배열의 포인터. 크기는 절반이며, 확장 중일 때만 nil이 아님
}
```

```go
// Go Map의 Bucket Header Struct
type bmap struct {
  tophash [bucketCnt]uint8 // 각 Key의 해시 상위 8비트. bucketCnt는 8을 기본값으로 한다
}

const (
    emptyRest      = 0  // 빈 슬롯 + 이후 슬롯들도 모두 비어있음
    emptyOne       = 1  // 해당 슬롯만 비어있음 (삭제된 슬롯)
    evacuatedX     = 2  // 확장 시 첫 번째 절반으로 이주됨
    evacuatedY     = 3  // 확장 시 두 번째 절반으로 이주됨
    evacuatedEmpty = 4  // 비어있으며 이주됨
    minTopHash     = 5  // 실제 해시값의 최소값. 해시값이 이것보다 작으면 보정
)
```

```plaintext
Go Map Bucket의 메모리 구조
┌─────────────────────────────────────────────────────────┐
│ tophash[0] │ tophash[1] │ ... │ tophash[7] │  (8 bytes) │
├─────────────────────────────────────────────────────────┤
│ key[0] │ key[1] │ key[2] │ ... │ key[7] │ (keysize × 8) │
├─────────────────────────────────────────────────────────┤
│ val[0] │ val[1] │ val[2] │ ... │ val[7] │ (valsize × 8) │
├─────────────────────────────────────────────────────────┤
│ overflow pointer │                         (8 bytes)    │
└─────────────────────────────────────────────────────────┘
```

## Map 데이터 접근 Flow

1. `Key`에 대해 해시함수를 적용해서 해시값을 얻는다
2. 해시값를 마스킹해서 버킷 인덱스를 만든다
3. 해당 버킷의 tophash를 선형 순회한다
   1. tophash[i] 값이 존재
      1. tophash[i] != 상위 해시비트(해시값의 상위 8비트)  
      해당 위치에 다른 값이 이미 있다 -> 순회 진행
      2. tophash[i] == 상위 해시비트  
         1. key[i] == `Key`  
         이미 해당 `Key`가 Map에 할당되어 있다 -> **접근 완료**
         2. key[i] != `Key`  
         key값이 다른데 같은 해시값을 가진 해시 충돌 -> 순회 진행
   2. tophash[i] 값이 없음
      1. tophash[i] == emptyRest(0)  
      Map에 해당 `Key`가 아직 할당되지 않음 -> **데이터 없음**
      2. tophash[i] == emptyOne(1)  
      뒤에 데이터가 더 있다는 뜻 -> 순회 진행
4. 순회가 끝나고
   1. overflow pointer 없음  
   Map에 해당 `Key`가 아직 할당되지 않음 -> **데이터 없음**
   2. overflow pointer 존재  
   overflow pointer가 가리키는 bucket에서 3~4번 반복

## 확장

Map에 데이터가 많아지면 확장을 진행해야 한다

Go Map의 기준은 6.5로 Bucket의 평균 수용률를 말한다

1. 사용 중인 버킷 값인 `buckets`의 값을 `oldbuckets`에 저장한다
2. `buckets`에는 현재 대비 2배의 버킷을 생성한다
3. 기존 Map의 데이터를 `oldbuckets`에서 `buckets`으로 옮긴다
4. `oldbuckets`을 `nil`로 설정한다

이와 같은 과정을 통해 Map을 확장한다

확장은 항상 현재 크기 대비 2배로 진행하기 때문에 2의 거듭제곱 값을 가진다 -> hmap의 `B`

확장 과정에서 데이터에 대한 접근이 가능해야하기 때문에 데이터를 가져올 때 `buckets`과 `oldbuckets`을 모두 읽을 수 있어야 한다

확장을 통해 데이터의 주소가 바뀔 수 있기 때문에 Map의 Value에 대한 주소를 제공하지 않는다

Map 내의 데이터가 적어져도 버킷을 축소하지는 않는다 -> 축소하기 위해서는 새로운 Map을 만들어서 데이터를 옮겨야 한다
