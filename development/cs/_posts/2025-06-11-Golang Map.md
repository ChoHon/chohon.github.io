---
title: "Golang Map"
categories:
  - development
  - cs
tags:
  - Backend
  - 자료구조
  - go
last_modified_at: 2025-06-12
toc: true
---

## 개요

```go
map[KeyType]ValueType
```

Key-Value 형태로 데이터를 저장하는 전형적인 Hash Map 형태의 자료구조

## 구조

![Go map]({{ site.url }}/assets/images/dev/cs/golang_map/01.svg)

### hmap

```go
type hmap struct {
    count int
    B uint8

    buckets unsafe.Pointer
    oldbuckets unsafe.Pointer
}
```

- `count`  
  Map의 데이터 개수
  len() 함수에 사용

- `B`  
  버킷의 개수를 나타내는 2의 지수  
  최대 LoadFactor * 2^B 개의 항목을 저장할 수 있음  

  :pencil: **LoadFactor**  
  버킷들의 평균 데이터 개수로 Go Map의 경우 6.5  
  LoadFactor보다 데이터가 많아지면 Go Map은 [확장](#확장)을 진행한다  
  LoadFactor가 너무 작으면 확장이 자주 일어나서 오버헤드가 발생한다
  반대로 너무 크면 해시 충돌이 발생할 확률이 높아진다

- `buckets`  
  Map이 가진 버킷 배열
  배열의 크기는 `B`가 결정

- `oldbuckets`  
  확장 진행할 때 기존 `buckets`을 저장하는 곳  
  평소에는 `nil`

### bucket

버킷의 크기는 8이다

`bmap` + [8]key + [8]val + `overflow bucket`로 구성되어있고 메모리상으로 연속적으로 위치해있다  
[8]key, [8]val은 메모리상 연속적으로 위치해 있을 뿐 배열 자료구조는 아니다

`bmap`은 [8]tophash로 구성되어 있다  
`bmap`에서 `key`를 이용해서 데이터 인덱스를 찾는다  
[8]key, [8]val에서 같은 인덱스로 접근한다

`overflow bucket`은 기본적으로 `nil`  
버킷이 가득 찬 상태에서 해시충돌이 발생하면 새로운 버킷을 만들어 주소값을 할당한다

```plain
┌─────────────────────────────────────────────────────────┐
│ tophash[0] │ tophash[1] │ ... │ tophash[7] │  (8 bytes) │ --> bmap
├─────────────────────────────────────────────────────────┤
│ key[0] │ key[1] │ key[2] │ ... │ key[7] │ (keysize × 8) │
├─────────────────────────────────────────────────────────┤
│ val[0] │ val[1] │ val[2] │ ... │ val[7] │ (valsize × 8) │
├─────────────────────────────────────────────────────────┤
│ overflow bucket │                          (8 bytes)    │
└─────────────────────────────────────────────────────────┘
```

```go
const (
    emptyRest      = 0  // 빈 슬롯 + 이후 슬롯들도 모두 비어있음
    emptyOne       = 1  // 해당 슬롯만 비어있음 (삭제된 슬롯)
    evacuatedX     = 2  // 확장 시 첫 번째 절반으로 이주됨
    evacuatedY     = 3  // 확장 시 두 번째 절반으로 이주됨
    evacuatedEmpty = 4  // 비어있으며 이주됨
    minTopHash     = 5  // 실제 해시값의 최소값
)

type bmap struct {
  tophash [bucketCnt]uint8
}
```

- `tophash`  
  `key` 해시 값의 상위 8비트를 저장하는 배열  
  `bucketCnt`는 8
  `tophash`를 선형 순회해서 버킷에 데이터가 있는지 찾는다

  `tophash[i]`의 최소값은 5
  그보다 작은 값은 보정을 통해 5 이상의 값으로 만든다
  0 ~ 4의 값은 flag값이다

## Map 데이터 접근

```go
func lookup(t* mapType, m *mapHeader, key unsafe.Pointer) unsafe.Pointer {
  if m == nil || m.count == 0 {
    return zero
  }

  // 1. 버킷 탐색
  hash := t.key.hash(key, m.seed)
  bucket := hash & (1 << m.log B-1)
  extra := byte(hash >> 56)
  b := (bucket) add(m.buckets, bucket*t.bucketsize)

  // 2. 버킷 내부 순회
  bucketloop:
  for ; b != nil; b = b.overflow {
    for i := 0; i < 8; i++ {
      if b.extra[i] != extra {
        continue
      }

      k := add(b, dataOffset + i*t.keysize)
      if t.key.equal(key, k) {
        return add(b, dataOffset + 8*t.keysize + i*t.valuesize)
      }
    }
  }

  return zero
}
```

### 1. 버킷 탐색

먼저 해시함수를 통해 `key`의 해시 값을 구하고 마스킹을 통해 버킷 인덱스(`bucket`)를 계산해서 버킷을 결정한다

`key`의 해시 값의 상위 8비트(`extra`)와 결정된 버킷의 시작 주소값(`b`)을 계산한다

### 2. 버킷 내부 순회

현재 버킷에서 시작해서 연결된 `overflow bucket`을 순회한다

버킷 내부에서는 8 슬롯을 순회한다

`tophash`를 순회하면서 같은 `extra`를 찾으면 해당 데이터의 Key값인 key[i]과 `key`를 비교한다  
Key값도 동일하면 해당 데이터가 접근하고자 하는 데이터이다

## Map 데이터 추가

데이터 접근과 동일한 로직으로 진행된다

버킷 내부 순회에서 빈공간을 발견하면 저장해두고 나머지 순회를 마무리한다  

버킷에서 해당 `key`를 가진 데이터를 발견하지 못하면 저장해둔 빈공간에 `key`를 할당

만약 버킷이 가득 차 있다면 `overflow bucket` 생성 후에 해당 버킷에서 순회부터 시작

## 확장

Map에 데이터가 많아지면 확장을 진행해야 한다

1. 사용 중인 버킷 값인 `buckets`의 값을 `oldbuckets`에 저장한다
2. `buckets`에는 현재 대비 2배의 버킷을 생성한다
3. 기존 Map의 데이터를 `oldbuckets`에서 `buckets`으로 옮긴다
4. `oldbuckets`을 `nil`로 설정한다

이와 같은 과정을 통해 Map을 확장한다

확장은 항상 현재 크기 대비 2배로 진행하기 때문에 2의 거듭제곱 값을 가진다 -> hmap의 `B`

확장 과정에서 데이터에 대한 접근이 가능해야하기 때문에 데이터를 가져올 때 `buckets`과 `oldbuckets`을 모두 읽을 수 있어야 한다

확장을 통해 데이터의 주소가 바뀔 수 있기 때문에 Map의 Value에 대한 주소를 제공하지 않는다

Map 내의 데이터가 적어져도 버킷을 축소하지는 않는다 -> 축소하기 위해서는 새로운 Map을 만들어서 데이터를 옮겨야 한다
