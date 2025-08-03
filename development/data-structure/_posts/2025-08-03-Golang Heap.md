---
title: "Golang Heap"
categories:
  - development
  - data-structure
tags:
  - Golang
  - 자료구조
last_modified_at: 2025-08-03
toc: true
---

## Heap

Priority Queue 한 종류

Min Heap의 경우 가장 작은 값부터 순서대로 Pop

Push와 Pop의 시간 복잡도 N(logN)

인덱싱을 활용하기 때문에 Linked List가 아닌 Array로 구현

구현하는 Heap은 Min Heap

### Heap Struct

```go
type Heap struct {
	arr    []int
	length int
}

func NewHeap() *Heap {
	return &Heap{
		arr:    []int{-1},
		length: 0,
	}
}

// Index 0은 사용하지 않기 때문에 실제 length는 len(h.arr)보다 1개 작음
func (h *Heap) Len() int {
	return h.length
}

// Pop을 실행하면 반환될 값
func (h *Heap) Root() int {
	if h.length == 0 {
		return -1
	}

	return h.arr[1]
}
```

### Push
```go
func (h *Heap) Push(v int) {
	h.arr = append(h.arr, v)
	h.length++

	curr := h.length
	for curr > 1 {
		parent := curr / 2
		if h.arr[curr] < h.arr[parent] {
			h.arr[curr], h.arr[parent] = h.arr[parent], h.arr[curr]
			curr = parent
			continue
		}

		return
	}
}
```

### Pop
```go
func (h *Heap) Pop() int {
	if h.length == 0 {
		return -1
	}

	popValue := h.Root()
	h.arr[1] = h.arr[h.length]
	h.arr = h.arr[:h.length]
	h.length--

	curr := 1
	for {
		minChild := 0
		left := curr * 2
		right := (curr * 2) + 1

		if left > h.length {
			break
		} else if right > h.length || h.arr[left] < h.arr[right] {
			minChild = left
		} else {
			minChild = right
		}

		if h.arr[curr] > h.arr[minChild] {
			h.arr[curr], h.arr[minChild] = h.arr[minChild], h.arr[curr]
			curr = minChild
			continue
		}

		break
	}
	return popValue
}
```